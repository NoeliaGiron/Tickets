'use client';

import { useEffect, useState } from 'react';
import { Ticket } from '@/types/ticket';
import { getTickets } from '@/lib/api';
import TicketCard from '@/components/TicketCard';
import DashboardStats from '@/components/DashboardStats';
import NewTicketModal from '@/components/NewTicketModal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);

  const { user, role, loading, logout } = useAuth();
  const router = useRouter();

  /* =========================
     PROTECCIÓN DE RUTA
  ========================== */
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  /* =========================
     CARGAR TICKETS
  ========================== */
  const refrescarTickets = async () => {
    if (!user || !role) return;

    try {
      const data = await getTickets(user.id, role);
      setTickets(data);
    } catch (error) {
      console.error('Fallo al cargar tickets:', error);
    }
  };

  useEffect(() => {
    if (user) {
      refrescarTickets();
    }
  }, [user]);

  /* =========================
     ACTUALIZAR TICKET (OPERADOR)
  ========================== */
  const actualizarTicket = (updatedTicket: Ticket) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id_ticket === updatedTicket.id_ticket ? updatedTicket : t
      )
    );
  };

  if (loading || !user) return null;

  return (
    <main className="p-8 max-w-7xl mx-auto">

      {/* BOTÓN CERRAR SESIÓN */}
      <div className="flex justify-end mb-4">
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
        >
          Cerrar Sesión ({role})
        </button>
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">
          🎫 Gestión de Tickets
        </h1>

        {/* SOLO OPERADOR CREA */}
        {role === 'operador' && (
          <button
            onClick={() => setMostrarModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            ➕ Nuevo Ticket para Cliente
          </button>
        )}
      </div>

      {/* STATS */}
      <DashboardStats tickets={tickets} />

      {/* LISTA DE TICKETS */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-6">
        {tickets.length === 0 ? (
          <p className="text-slate-500 italic">
            No hay tickets para mostrar
          </p>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.id_ticket}
              ticket={ticket}
              onUpdate={actualizarTicket}
            />
          ))
        )}
      </section>

      {/* MODAL NUEVO TICKET */}
      {mostrarModal && role === 'operador' && (
        <NewTicketModal
          onClose={() => setMostrarModal(false)}
          onCreated={refrescarTickets}
        />
      )}
    </main>
  );
}
