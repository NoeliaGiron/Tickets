import { Historial } from "../types";

export default function TicketHistorial({
  historial,
}: {
  historial: Historial[];
}) {
  return (
    <div>
      {historial.map((h) => (
        <div key={h.id_interaccion} style={{ marginBottom: 12 }}>
          <strong>{h.autor}</strong> —{" "}
          {new Date(h.fecha_creacion).toLocaleString()}
          <p>{h.mensaje}</p>
        </div>
      ))}
    </div>
  );
}
