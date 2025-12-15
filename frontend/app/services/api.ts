// services/api.ts

const API_URL = "http://127.0.0.1:8000";

export async function getTickets() {
  const res = await fetch(`${API_URL}/tickets`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener tickets");
  return res.json();
}

export async function getTicketById(id: number) {
  const res = await fetch(`${API_URL}/tickets/${id}`);
  if (!res.ok) throw new Error("Error al obtener el ticket");
  return res.json();
}

// services/api.ts

export async function crearUsuario(nombre: string, email: string, rol: string) {
  const res = await fetch("http://127.0.0.1:8000/usuarios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nombre,
      email,
      rol,
    }),
  });

  if (!res.ok) throw new Error("Error al crear usuario");
  return res.json();
}



export async function crearTicket(id_usuario: number, asunto: string, prioridad: string) {
  const res = await fetch(`${API_URL}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_usuario,
      asunto,
      prioridad,
    }),
  });

  if (!res.ok) throw new Error("Error al crear ticket");
  return res.json();
}

export async function cambiarEstado(id: number, estado: string) {
  const res = await fetch(`${API_URL}/tickets/${id}/estado?nuevo_estado=${estado}&rol_operador=operador`, { method: "PUT" });

  if (!res.ok) throw new Error("Error al cambiar estado");
  return res.json();
}

export async function getHistorial(id: number) {
  const res = await fetch(`${API_URL}/tickets/${id}/historial`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al obtener historial");
  return res.json();
}
