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
# DB DEPENDENCY
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

class TicketUpdate(BaseModel):
    estado: EstadoTicket
    prioridad: PrioridadTicket

# ======================================================
# AUTH
# ======================================================
@app.post("/auth/register")
def register_user(usuario_data: UsuarioCreate, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.email == usuario_data.email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    usuario = Usuario(**usuario_data.dict())
    db.add(usuario)
    db.commit()
    db.refresh(usuario)

    return {
        "id": usuario.id_usuario,
        "nombre": usuario.nombre,
        "rol": usuario.rol
    }

@app.post("/auth/login")
def login_user(usuario_login: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == usuario_login.email).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    return {
        "id": usuario.id_usuario,
        "nombre": usuario.nombre,
        "rol": usuario.rol
    }

# ======================================================
# TICKETS
# ======================================================
@app.get("/tickets")
def get_tickets(
    user_id: int,
    rol: RolUsuario,
    db: Session = Depends(get_db)
):
    try:
        if rol == RolUsuario.cliente:
            tickets = db.query(Ticket).filter(
                Ticket.id_usuario == user_id
            ).all()
        else:
            tickets = db.query(Ticket).all()

        return tickets

    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Error al obtener tickets")

@app.post("/tickets")
def crear_ticket_operador(
    data: TicketCreateOperator,
    rol: RolUsuario,
    db: Session = Depends(get_db)
):
    if rol != RolUsuario.operador:
        raise HTTPException(status_code=403, detail="No autorizado")

    cliente = db.query(Usuario).filter(
        Usuario.email == data.client_email
    ).first()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    ticket = Ticket(
        id_usuario=cliente.id_usuario,
        asunto=data.asunto,
        descripcion=data.descripcion,
        prioridad=data.prioridad
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return ticket

@app.put("/tickets/{ticket_id}")
def actualizar_ticket(
    ticket_id: int,
    data: TicketUpdate,
    rol: RolUsuario,
    db: Session = Depends(get_db)
):
    if rol == RolUsuario.cliente:
        raise HTTPException(status_code=403, detail="Clientes no pueden editar tickets")

    ticket = db.query(Ticket).filter(
        Ticket.id_ticket == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    ticket.estado = data.estado
    ticket.prioridad = data.prioridad

    db.commit()
    db.refresh(ticket)

    return ticket
