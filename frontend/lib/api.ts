// lib/api.ts
import { Ticket } from '@/types/ticket';
import { User, UserRole } from '@/types/users'; 
import { Interaccion } from '@/types/interacciones';

/**
 * 👉 En local usa .env.local
 * 👉 En Vercel usa Environment Variables
 *
 * NEXT_PUBLIC_API_URL=http://127.0.0.1:8000   (local)
 * NEXT_PUBLIC_API_URL=https://tu-backend.com  (producción)
 */
const API_URL ="/api"

/* ======================================================
   AUTENTICACIÓN
====================================================== */

export async function getUsuarioActual(): Promise<User> {
  const res = await fetch(`${API_URL}/me`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('No autenticado');
  }
  return res.json();
}

export async function loginUser(email: string): Promise<User> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error desconocido al iniciar sesión');
  }

  return res.json();
}

export async function registerUser(
  nombre: string,
  email: string,
  rol: UserRole
) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, rol }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al registrar usuario');
  }

  return res.json();
}

/* ======================================================
   MAPPER Y API TICKETS
====================================================== */

interface TicketBackend {
id_usuario: number;
  id_ticket: number;
  asunto: string;
  descripcion: string;
  prioridad: 'baja' | 'media' | 'alta';
  estado: 'abierto' | 'en_proceso' | 'cerrado';
  fecha_creacion: string;
}

function mapTicket(t: TicketBackend): Ticket {
  return {
    id_usuario: t.id_usuario,
    id_ticket: t.id_ticket,
    asunto: t.asunto,
    descripcion: t.descripcion,
    prioridad:
      t.prioridad.charAt(0).toUpperCase() +
      t.prioridad.slice(1) as Ticket['prioridad'],
    estado:
      t.estado === 'en_proceso'
        ? 'en_proceso'
        : (t.estado.charAt(0).toUpperCase() +
            t.estado.slice(1)) as Ticket['estado'],
    fecha_creacion: new Date(t.fecha_creacion),
  };
}

/* ======================================================
   1. OBTENER TICKETS
====================================================== */

export async function getTickets(userId: number, role: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/tickets?user_id=${userId}&rol=${role}`
  );

  if (!res.ok) {
    throw new Error('Error al obtener tickets');
  }

  return res.json();
}

/* ======================================================
   2. CREAR TICKET (OPERADOR)
====================================================== */

export async function crearTicket(data: {
  operator_id: number;
  client_email: string;
  asunto: string;
  descripcion: string;
  prioridad: 'baja' | 'media' | 'alta';
}) {
  const params = new URLSearchParams({
    operator_id: String(data.operator_id),
  });

  const res = await fetch(`${API_URL}/tickets?${params}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_email: data.client_email,
      asunto: data.asunto,
      descripcion: data.descripcion,
      prioridad: data.prioridad,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al crear ticket');
  }

  return res.json();
}

/* ======================================================
   3. CAMBIAR ESTADO TICKET
====================================================== */

export async function cambiarEstadoTicket(
  id: string,
  nuevoEstado: 'abierto' | 'en_proceso' | 'cerrado'
) {
  const res = await fetch(
    `${API_URL}/tickets/${id}/estado?nuevo_estado=${nuevoEstado}`,
    { method: 'PUT' }
  );

  if (!res.ok) {
    throw new Error('Error al cambiar estado');
  }

  return res.json();
}

/* ======================================================
   4. CAMBIAR PRIORIDAD TICKET
====================================================== */

export async function cambiarPrioridadTicket(
  id: string,
  nuevaPrioridad: 'baja' | 'media' | 'alta'
): Promise<TicketBackend> {
  const res = await fetch(
    `${API_URL}/tickets/${id}/prioridad?nueva_prioridad=${nuevaPrioridad}`,
    { method: 'PUT' }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Error al cambiar prioridad');
  }

  return res.json();
}

/* ======================================================
   5. HISTORIAL TICKET
====================================================== */

export async function getHistorialTicket(
  idTicket: string
): Promise<Interaccion[]> {
  const res = await fetch(
    `${API_URL}/tickets/${idTicket}/historial`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Error al obtener historial');
  }

  return res.json();
}



