import contextlib
import os
import secrets
from fastapi import FastAPI, HTTPException, Header, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional
from bson import ObjectId

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "dulce_hogar_orders"

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
    collection = db["orders"]
    yield
    client.close()

app = FastAPI(title="Orders Service - Dulce Hogar", lifespan=lifespan)

class OrderItem(BaseModel):
    id: str
    nombre: str
    precio: int

class OrderIn(BaseModel):
    cliente_email: str
    items: List[OrderItem]
    total: int
    idempotency_key: str # Clave única para evitar doble cobro

class OrderOut(OrderIn):
    id: str
    estado: str

@app.post("/orders", response_model=OrderOut, dependencies=[Depends(verify_gateway)])
async def create_order(order: OrderIn):
    # 1. CONTROL DE IDEMPOTENCIA (Evita doble click)
    pedido_existente = await collection.find_one({"idempotency_key": order.idempotency_key})
    if pedido_existente:
        # Si ya existe, devolvemos el que ya estaba guardado sin volver a procesar
        return OrderOut(
            id=str(pedido_existente["_id"]),
            cliente_email=pedido_existente["cliente_email"],
            items=pedido_existente["items"],
            total=pedido_existente["total"],
            idempotency_key=pedido_existente["idempotency_key"],
            estado=pedido_existente["estado"]
        )

    # 2. GUARDAR NUEVO PEDIDO
    nuevo_pedido = order.model_dump()
    nuevo_pedido["estado"] = "pendiente"
    
    res = await collection.insert_one(nuevo_pedido)
    doc = await collection.find_one({"_id": res.inserted_id})
    
    return OrderOut(
        id=str(doc["_id"]),
        cliente_email=doc["cliente_email"],
        items=doc["items"],
        total=doc["total"],
        idempotency_key=doc["idempotency_key"],
        estado=doc["estado"]
    )

@app.get("/orders/id/{order_id}", dependencies=[Depends(verify_gateway)])
async def get_order_by_id(order_id: str):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    doc = await collection.find_one({"_id": ObjectId(order_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return {
        "id": str(doc["_id"]),
        "total": doc["total"],
        "estado": doc["estado"]
    }

@app.get("/orders/{email}", dependencies=[Depends(verify_gateway)])
async def get_orders_by_client(email: str):
    cursor = collection.find({"cliente_email": email})
    orders = []
    async for doc in cursor:
        orders.append({
            "id": str(doc["_id"]),
            "total": doc["total"],
            "estado": doc["estado"],
            "items": doc["items"]
        })
    return orders