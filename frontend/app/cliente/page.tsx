// app/cliente/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Ticket } from "../types";
import { useRouter } from "next/navigation";

export default function ClientePage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const rol = localStorage.getItem("rol");
    if (rol !== "cliente") router.push("/"); // Si no es cliente, redirigir al login
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/tickets") // Obtén todos los tickets del backend
      .then((r) => r.json())
      .then((data) => setTickets(data)); // Mostrar todos los tickets disponibles
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h1>Mis Tickets</h1>

      {/* Mostrar los tickets del cliente */}
      <table border={1} width="100%" cellPadding={8}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Asunto</th>
            <th>Estado</th>
            <th>Prioridad</th>
          </tr>
        </thead>
        <tbody>
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={4}>No tienes tickets activos.</td>
            </tr>
          ) : (
            tickets.map((t) => (
              <tr key={t.id_ticket}>
                <td>{t.id_ticket}</td>
                <td>{t.asunto}</td>
                <td>{t.estado}</td>
                <td>{t.prioridad}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
