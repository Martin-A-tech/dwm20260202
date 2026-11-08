import contextlib
import os
import secrets
import hashlib
from fastapi import FastAPI, HTTPException, Header
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "dulce_hogar_auth"
TOKEN_LIFETIME_MINUTES = 60
OUT_INTROSPECTION_SECRET = os.getenv("OUT_INTROSPECTION_SECRET")

if not OUT_INTROSPECTION_SECRET:
    raise RuntimeError("OUT_INTROSPECTION_SECRET no está configurado")

client = None
db = None
users_collection = None
sessions_collection = None

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db, users_collection, sessions_collection
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    users_collection = db["users"]
    sessions_collection = db["sessions"]
    yield
    client.close()

app = FastAPI(title="Auth Service - Dulce Hogar", lifespan=lifespan)

class LoginRequest(BaseModel):
    username: str
    password: str

class IntrospectionRequest(BaseModel):
    token: str

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@app.post("/register")
async def register(req: LoginRequest):
    existe = await users_collection.find_one({"username": req.username})
    if existe:
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    rol = "operador" if req.username == "admin@dulcehogar.cl" else "cliente"
    
    await users_collection.insert_one({
        "username": req.username,
        "password_hash": hash_password(req.password),
        "roles": [rol]
    })
    return {"message": "Usuario registrado exitosamente", "rol": rol}

@app.post("/login")
async def login(req: LoginRequest):
    user = await users_collection.find_one({"username": req.username})
    if not user or user["password_hash"] != hash_password(req.password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_LIFETIME_MINUTES)
    
    await sessions_collection.insert_one({
        "token": token,
        "user_id": str(user["_id"]),
        "username": req.username,
        "roles": user["roles"],
        "expires_at": expires_at
    })
    
    return {
        "access_token": token, 
        "token_type": "bearer", 
        "expires_in": TOKEN_LIFETIME_MINUTES * 60,
        "rol": user["roles"][0]
    }

@app.post("/introspect")
async def introspect(req: IntrospectionRequest, x_gateway_secret: str = Header(None)):
    if not x_gateway_secret or not secrets.compare_digest(x_gateway_secret, OUT_INTROSPECTION_SECRET):
        raise HTTPException(status_code=403, detail="Gateway no autorizado")
    
    session = await sessions_collection.find_one({"token": req.token})
    if not session:
        return {"active": False}
    
    if datetime.now(timezone.utc) > session["expires_at"].replace(tzinfo=timezone.utc):
        await sessions_collection.delete_one({"token": req.token})
        return {"active": False}
        
    return {
        "active": True,
        "user_id": session["user_id"],
        "username": session["username"],
        "roles": session["roles"]
    }