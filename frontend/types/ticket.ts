export type TicketStatus =
  | 'Abierto'
  | 'En Progreso'
  | 'Cerrado';

export type TicketPriority =
  | 'Baja'
  | 'Media'
  | 'Alta';

// types/ticket.ts
export interface Ticket {
  id_ticket: number;
  id_usuario: number;
  asunto: string;
  descripcion: string;
  estado: 'abierto' | 'en_proceso' | 'cerrado';
  prioridad: 'baja' | 'media' | 'alta';
  fecha_creacion: Date;
}


export type UserRole = 'admin' | 'operador' | 'cliente';

export interface User {
  id: number;
  nombre: string;
  rol: UserRole;
}
