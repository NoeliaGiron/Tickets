// types/index.ts

export type Ticket = {
  id_ticket: number;
  id_usuario: number;
  asunto: string;
  estado: string;
  prioridad: string;
  fecha_creacion: string;
};

export type Interaccion = {
  id_interaccion: number;
  id_ticket: number;
  autor: string;
  mensaje: string;
  fecha_creacion: string;
};

export type Historial = {
  id_interaccion: number;
  id_ticket: number;
  autor: string;
  mensaje: string;
  fecha_creacion: string;
};


