# main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session, relationship
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from enum import Enum as PyEnum
from datetime import datetime

from fastapi.middleware.cors import CORSMiddleware

from database import SessionLocal, Base, init_db

# ======================================================
# FASTAPI
# ======================================================
app = FastAPI(root_path="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================================
# DB DEPENDENCY (LAZY INIT)
# ======================================================
def get_db():
    init_db()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ======================================================
# ENUMS
# ======================================================
class RolUsuario(str, PyEnum):
    cliente = "cliente"
    operador = "operador"

class PrioridadTicket(str, PyEnum):
    baja = "baja"
    media = "media"
    alta = "alta"

class EstadoTicket(str, PyEnum):
    abierto = "abierto"
    en_proceso = "en_proceso"
    cerrado = "cerrado"

# ======================================================
# MODELOS
# ======================================================
class Usuario(Base):
    __tablename__ = "usuarios"
    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    rol = Column(Enum(RolUsuario), nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.now)

class Ticket(Base):
    __tablename__ = "tickets"
    id_ticket = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    asunto = Column(String(200), nullable=False)
    descripcion = Column(String, default="")
    estado = Column(Enum(EstadoTicket), default=EstadoTicket.abierto)
    prioridad = Column(Enum(PrioridadTicket), nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.now)

    usuario = relationship("Usuario")

class Interaccion(Base):
    __tablename__ = "interacciones"
    id_interaccion = Column(Integer, primary_key=True, index=True)
    id_ticket = Column(Integer, ForeignKey("tickets.id_ticket"), nullable=False)
    autor = Column(Enum(RolUsuario), nullable=False)
    mensaje = Column(String, nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.now)

# ======================================================
# SCHEMAS
# ======================================================
class UsuarioBase(BaseModel):
    nombre: str
    email: str
    rol: RolUsuario

class UsuarioCreate(UsuarioBase):
    pass

class UsuarioLogin(BaseModel):
    email: str

class TicketCreateOperator(BaseModel):
    client_email: str
    asunto: str
    descripcion: str
    prioridad: PrioridadTicket

# ======================================================
# ENDPOINTS
# ======================================================
@app.post("/auth/register")
def register_user(usuario_data: UsuarioCreate, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.email == usuario_data.email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    usuario = Usuario(**usuario_data.dict())
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return {"id_usuario": usuario.id_usuario}

@app.post("/auth/login")
def login_user(usuario_login: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == usuario_login.email).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    return {"id": usuario.id_usuario, "nombre": usuario.nombre, "rol": usuario.rol}

@app.get("/me")
def get_current_user(db: Session = Depends(get_db)):
    usuario = db.query(Usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="No hay usuarios")
    return {"id": usuario.id_usuario, "nombre": usuario.nombre, "rol": usuario.rol}
