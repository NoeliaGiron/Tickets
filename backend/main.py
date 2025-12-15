from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from enum import Enum

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

from database import SessionLocal
from models import Usuario, Ticket, Interaccion
from redis_client import cache_usuario, enviar_tarea

app = FastAPI(title="Sistema de Tickets con Batch Worker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas las solicitudes de cualquier origen
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos HTTP
    allow_headers=["*"],  # Permite todos los encabezados
)


# ======================================================
# ENUMS (coinciden EXACTAMENTE con los CHECK de Supabase)
# ======================================================

class RolUsuario(str, Enum):
    cliente = "cliente"
    operador = "operador"

class EstadoTicket(str, Enum):
    abierto = "abierto"
    en_proceso = "en_proceso"
    cerrado = "cerrado"

class PrioridadTicket(str, Enum):
    baja = "baja"
    media = "media"
    alta = "alta"

# ======================================================
# DEPENDENCIA DE BASE DE DATOS
# ======================================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ======================================================
# CREAR USUARIO
# ======================================================

@app.post("/usuarios")
def crear_usuario(
    nombre: str,
    email: str,
    rol: RolUsuario,
    db: Session = Depends(get_db)
):
    try:
        usuario = Usuario(
            nombre=nombre,
            email=email,
            rol=rol.value
        )
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
    except SQLAlchemyError as e:
        db.rollback()
        print("ERROR BD:", e)
        raise HTTPException(status_code=500, detail="Error al crear usuario")

    # Cache en Redis (no rompe si falla)
    try:
        cache_usuario(usuario.id_usuario, {
            "id_usuario": usuario.id_usuario,
            "nombre": usuario.nombre,
            "rol": usuario.rol
        })
    except Exception:
        pass

    return usuario

# ======================================================
# CREAR TICKET
# ======================================================

@app.post("/tickets")
def crear_ticket(
    id_usuario: int,
    asunto: str,
    prioridad: PrioridadTicket,
    db: Session = Depends(get_db)
):
    usuario = db.query(Usuario).filter(
        Usuario.id_usuario == id_usuario
    ).first()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no existe")

    try:
        ticket = Ticket(
            id_usuario=id_usuario,
            asunto=asunto,
            estado=EstadoTicket.abierto.value,
            prioridad=prioridad.value
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)
    except SQLAlchemyError as e:
        db.rollback()
        print("ERROR BD:", e)
        raise HTTPException(status_code=500, detail="Error al crear ticket")

    # Enviar al batch worker
    try:
        enviar_tarea(ticket.id_ticket)
    except Exception:
        pass

    return ticket

# -----------------------
# LISTAR TODOS LOS TICKETS (OPERADOR)
# -----------------------
@app.get("/tickets")
def listar_tickets(db: Session = Depends(get_db)):
    tickets = db.query(Ticket).order_by(Ticket.fecha_creacion.desc()).all()
    return tickets

# ======================================================
# CAMBIAR ESTADO DEL TICKET (SOLO OPERADOR)
# ======================================================

@app.put("/tickets/{id_ticket}/estado")
def cambiar_estado_ticket(
    id_ticket: int,
    nuevo_estado: EstadoTicket,
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(
        Ticket.id_ticket == id_ticket
    ).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    try:
        ticket.estado = nuevo_estado.value
        db.commit()

        interaccion = Interaccion(
            id_ticket=id_ticket,
            autor="operador",
            mensaje=f"Estado actualizado a {nuevo_estado.value}"
        )
        db.add(interaccion)
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        print("ERROR BD:", e)
        raise HTTPException(status_code=500, detail="Error al actualizar estado")

    try:
        enviar_tarea(id_ticket)
    except Exception:
        pass

    return {"mensaje": "Estado actualizado correctamente"}

# ======================================================
# HISTORIAL DE INTERACCIONES
# ======================================================

@app.get("/tickets/{id_ticket}/historial")
def historial_ticket(
    id_ticket: int,
    db: Session = Depends(get_db)
):
    historial = db.query(Interaccion).filter(
        Interaccion.id_ticket == id_ticket
    ).order_by(Interaccion.fecha_creacion.asc()).all()

    return historial

# -----------------------
# LISTAR TODOS LOS TICKETS
# -----------------------
@app.get("/tickets")
def listar_tickets(db: Session = Depends(get_db)):
    try:
        tickets = db.query(Ticket).all()
        return tickets
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Error al obtener tickets")

