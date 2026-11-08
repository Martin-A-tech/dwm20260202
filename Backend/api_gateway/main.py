import os
import httpx
from fastapi import FastAPI, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

app = FastAPI(title="API Gateway - Dulce Hogar")

# Permitir que tu Frontend (Live Server) se conecte sin problemas de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción se pone la URL exacta
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)

# URLs de los microservicios
# URLs de los microservicios
INVENTORY_URL = "http://127.0.0.1:9200"
CLIENTS_URL = "http://127.0.0.1:9300"
ORDERS_URL = "http://127.0.0.1:9400"
PAYMENTS_URL = "http://127.0.0.1:9500"
AUTH_URL = "http://127.0.0.1:8100"

# Secretos compartidos (En la vida real, aquí usarías Vault)
INTERNAL_GATEWAY_SECRET = "gateway-api-secret-456"
INTROSPECTION_SECRET = "GatewaySecret789"

# Función que valida el token del usuario consultando al AuthService
async def authenticate_client(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Token requerido")
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            response = await client.post(
                f"{AUTH_URL}/introspect",
                json={"token": credentials.credentials},
                headers={"X-Gateway-Secret": INTROSPECTION_SECRET}
            )
            data = response.json()
            if not data.get("active"):
                raise HTTPException(status_code=401, detail="Token inválido o expirado")
            return data # Retorna los datos del usuario (username, roles, etc)
        except httpx.RequestError:
            raise HTTPException(status_code=502, detail="Error de conexión con AuthService")

# ==========================================
# RUTAS PÚBLICAS (No requieren token)
# ==========================================

@app.post("/api/login")
async def login(request: Request):
    body = await request.json()
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{AUTH_URL}/login", json=body)
        return Response(content=res.content, status_code=res.status_code)

@app.get("/api/products")
async def get_products():
    # Inyecta el secreto para que el microservicio de inventario responda
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{INVENTORY_URL}/products", headers={"X-Gateway-Secret": INTERNAL_GATEWAY_SECRET})
        return Response(content=res.content, status_code=res.status_code)

# ==========================================
# RUTAS PROTEGIDAS (Requieren Token Bearer)
# ==========================================

@app.get("/api/clients/{email}")
async def get_client(email: str, auth: dict = Depends(authenticate_client)):
    headers = {"X-Gateway-Secret": INTERNAL_GATEWAY_SECRET}
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{CLIENTS_URL}/clients/{email}", headers=headers)
        return Response(content=res.content, status_code=res.status_code)

@app.post("/api/orders")
async def create_order(request: Request, auth: dict = Depends(authenticate_client)):
    body = await request.json()
    headers = {"X-Gateway-Secret": INTERNAL_GATEWAY_SECRET, "X-User": auth["username"]}
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{ORDERS_URL}/orders", json=body, headers=headers)
        return Response(content=res.content, status_code=res.status_code)

@app.post("/api/payments")
async def process_payment(request: Request, auth: dict = Depends(authenticate_client)):
    body = await request.json()
    headers = {"X-Gateway-Secret": INTERNAL_GATEWAY_SECRET}
    async with httpx.AsyncClient() as client:
        res = await client.post(f"{PAYMENTS_URL}/payments", json=body, headers=headers)
        return Response(content=res.content, status_code=res.status_code)