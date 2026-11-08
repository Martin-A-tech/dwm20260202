import contextlib
import os
import secrets
from fastapi import FastAPI, HTTPException, Header, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List
from bson import ObjectId

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "dulce_hogar_clients"

client = None
db = None
collection = None

INTERNAL_GATEWAY_SECRET = os.getenv("INTERNAL_GATEWAY_SECRET")
if not INTERNAL_GATEWAY_SECRET:
    raise RuntimeError("INTERNAL_GATEWAY_SECRET no está configurado")

async def verify_gateway(x_gateway_secret: str = Header(None)):
    if not x_gateway_secret or not secrets.compare_digest(x_gateway_secret, INTERNAL_GATEWAY_SECRET):
        raise HTTPException(status_code=403, detail="Solicitud no autorizada")

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db, collection
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db["clients"]
    yield
    client.close()

app = FastAPI(title="Clients Service - Dulce Hogar", lifespan=lifespan)

class ClientIn(BaseModel):
    nombre: str
    email: str
    password: str # En un caso real, esto debe ir hasheado

class ClientOut(BaseModel):
    id: str
    nombre: str
    email: str

@app.post("/clients", response_model=ClientOut, dependencies=[Depends(verify_gateway)])
async def create_client(client_data: ClientIn):
    # Verificar si el correo ya existe
    existe = await collection.find_one({"email": client_data.email})
    if existe:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    
    res = await collection.insert_one(client_data.model_dump())
    doc = await collection.find_one({"_id": res.inserted_id})
    return ClientOut(id=str(doc["_id"]), nombre=doc["nombre"], email=doc["email"])

@app.get("/clients/{email}", response_model=ClientOut, dependencies=[Depends(verify_gateway)])
async def get_client(email: str):
    doc = await collection.find_one({"email": email})
    if not doc:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return ClientOut(id=str(doc["_id"]), nombre=doc["nombre"], email=doc["email"])