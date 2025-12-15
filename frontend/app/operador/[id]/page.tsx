"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { cambiarEstado, getHistorial } from "../../services/api";
import TicketHistorial from "../..//components/TicketHistorial";
import { Historial } from "../../types";

export default function DetalleTicket() {
  const { id } = useParams();
  const [historial, setHistorial] = useState<Historial[]>([]);
  const [estado, setEstado] = useState("en_proceso");

  useEffect(() => {
    getHistorial(Number(id)).then(setHistorial);
  }, []);

  const actualizarEstado = async () => {
    await cambiarEstado(Number(id), estado);
    alert("Estado actualizado");
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Ticket #{id}</h2>

      <select value={estado} onChange={(e) => setEstado(e.target.value)}>
        <option value="abierto">Abierto</option>
        <option value="en_proceso">En proceso</option>
        <option value="cerrado">Cerrado</option>
      </select>

      <button onClick={actualizarEstado}>Actualizar</button>

      <h3>Historial</h3>
      <TicketHistorial historial={historial} />
    </div>
  );
}
