// app/admin/page.tsx

"use client";

import { useState } from "react";
import { crearUsuario } from "../services/api";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("cliente");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crearUsuario(nombre, email, rol);
      router.push("/operador");  // Redirige al Dashboard Operador
    } catch (error) {
      alert("Error al crear el usuario");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Crear Usuario</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Rol:</label>
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="cliente">Cliente</option>
            <option value="operador">Operador</option>
          </select>
        </div>
        <button type="submit">Crear Usuario</button>
      </form>
    </div>
  );
}
