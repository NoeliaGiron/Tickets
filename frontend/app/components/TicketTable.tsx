// components/TicketTable.tsx

import { Ticket } from "../types";
import Link from "next/link";

type TicketTableProps = {
  tickets: Ticket[];
};

export default function TicketTable({ tickets }: TicketTableProps) {
  return (
    <table border={1} width="100%" cellPadding={8}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Asunto</th>
          <th>Estado</th>
          <th>Prioridad</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((ticket) => (
          <tr key={ticket.id_ticket}>
            <td>{ticket.id_ticket}</td>
            <td>{ticket.asunto}</td>
            <td>{ticket.estado}</td>
            <td>{ticket.prioridad}</td>
            <td>
              <Link href={`/operador/tickets/${ticket.id_ticket}`}>Ver</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
