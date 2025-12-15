// app/operador/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getTickets } from "../services/api"; // Asegúrate de que el endpoint GET /tickets esté funcionando
import TicketTable from "../components/TicketTable"; // Componente para mostrar la tabla de tickets
import { Ticket } from "../types"; // Definir el tipo de Ticket
import { useRouter } from "next/navigation";

export default function OperadorPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [estado, setEstado] = useState("");
  const [prioridad, setPrioridad] = useState("");

  useEffect(() => {
    const rol = localStorage.getItem("rol");
    if (rol !== "operador") router.push("/"); // Si no es operador, redirigir al login
  }, []);

  useEffect(() => {
    getTickets().then(setTickets).catch((error) => console.log("Error fetching tickets", error));
  }, []);

  const filtrados = tickets.filter(
    (t) =>
      (estado ? t.estado === estado : true) &&
      (prioridad ? t.prioridad === prioridad : true)
  );

  return (
    <div style={{ padding: 30 }}>
      <h1>Dashboard Operador</h1>

      <div style={{ display: "flex", gap: 15, marginBottom: 20 }}>
        <select onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="abierto">Abierto</option>
          <option value="en_proceso">En proceso</option>
          <option value="cerrado">Cerrado</option>
        </select>

        <select onChange={(e) => setPrioridad(e.target.value)}>
          <option value="">Todas las prioridades</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
      </div>

      {/* Mostrar los tickets filtrados */}
      <TicketTable tickets={filtrados} />
    </div>
  );
}
