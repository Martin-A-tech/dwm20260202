import contextlib
import os
import secrets
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware 
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List
from bson import ObjectId

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "dulce_hogar_inventory" 

client = None
db = None
collection = None

INTERNAL_GATEWAY_SECRET = os.getenv("INTERNAL_GATEWAY_SECRET")
if not INTERNAL_GATEWAY_SECRET:
    raise RuntimeError("INTERNAL_GATEWAY_SECRET no está configurado")

async def verify_gateway(x_gateway_secret: str = Header(None)):
    if not x_gateway_secret or not secrets.compare_digest(x_gateway_secret, INTERNAL_GATEWAY_SECRET):
        raise HTTPException(status_code=403, detail="Solicitud no autorizada desde Gateway")

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db, collection
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db["products"]
    yield
    client.close()

app = FastAPI(title="Inventory Service - Dulce Hogar", lifespan=lifespan)

# Permitir peticiones desde el Frontend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProductIn(BaseModel):
    nombre: str
    precio: int
    img: str
    stock: int = Field(default=50, ge=0)

class ProductOut(ProductIn):
    id: str

def doc_to_product(doc: dict) -> ProductOut:
    return ProductOut(
        id=str(doc["_id"]),
        nombre=doc.get("nombre", ""),
        precio=doc.get("precio", 0),
        img=doc.get("img", ""),
        stock=doc.get("stock", 50)
    )

@app.get("/products", response_model=List[ProductOut], dependencies=[Depends(verify_gateway)])
async def get_products():
    cursor = collection.find({})
    products = []
    async for doc in cursor:
        products.append(doc_to_product(doc))
    return products

@app.post("/products", response_model=ProductOut, status_code=201, dependencies=[Depends(verify_gateway)])
async def create_product(product: ProductIn):
    res = await collection.insert_one(product.model_dump())
    doc = await collection.find_one({"_id": res.inserted_id})
    return doc_to_product(doc)

@app.put("/products/{product_id}", response_model=ProductOut, dependencies=[Depends(verify_gateway)])
async def update_product(product_id: str, product: ProductIn):
    # Validar que el ID tenga formato de MongoDB
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="ID de producto inválido")
        
    res = await collection.replace_one({"_id": ObjectId(product_id)}, product.model_dump())
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
        
    doc = await collection.find_one({"_id": ObjectId(product_id)})
    return doc_to_product(doc)

@app.delete("/products/{product_id}", status_code=204, dependencies=[Depends(verify_gateway)])
async def delete_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="ID de producto inválido")
        
    res = await collection.delete_one({"_id": ObjectId(product_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return None