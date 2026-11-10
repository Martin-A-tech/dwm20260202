import contextlib
import os
import secrets
import httpx
from fastapi import FastAPI, HTTPException, Header, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List
from bson import ObjectId

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "dulce_hogar_payments"

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
    collection = db["payments"]
    yield
    client.close()

app = FastAPI(title="Payments Service - Dulce Hogar", lifespan=lifespan)

class PaymentIn(BaseModel):
    order_id: str
    monto: int

class PaymentOut(BaseModel):
    id: str
    order_id: str
    monto: int
    estado: str

@app.post("/payments", response_model=PaymentOut, dependencies=[Depends(verify_gateway)])
async def process_payment(payment: PaymentIn):
    # 1. Consultar el pedido real al microservicio de orders
    async with httpx.AsyncClient() as client_http:
        try:
            res = await client_http.get(
                f"http://127.0.0.1:9400/orders/id/{payment.order_id}",
                headers={"X-Gateway-Secret": INTERNAL_GATEWAY_SECRET}
            )
            if res.status_code != 200:
                raise HTTPException(status_code=404, detail="Pedido no encontrado")
            
            order_data = res.json()
            monto_real = order_data.get("total")

            # 2. Validar que el monto enviado no esté alterado
            if payment.monto != monto_real:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Monto incorrecto. El total real del pedido es {monto_real}"
                )
                
        except httpx.RequestError:
            raise HTTPException(status_code=502, detail="Error al conectar con Orders")

    # 3. Si el monto es correcto, procesar el pago
    nuevo_pago = {
        "order_id": payment.order_id,
        "monto": payment.monto,
        "estado": "aprobado" 
    }
    res = await collection.insert_one(nuevo_pago)
    doc = await collection.find_one({"_id": res.inserted_id})
    return PaymentOut(id=str(doc["_id"]), order_id=doc["order_id"], monto=doc["monto"], estado=doc["estado"])