// app/page.tsx

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [rol, setRol] = useState("cliente");

  const login = () => {
    localStorage.setItem("rol", rol);

    if (rol === "operador") {
      router.push("/operador");
    } else {
      router.push("/cliente");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Login</h1>

      <select value={rol} onChange={(e) => setRol(e.target.value)}>
        <option value="cliente">Cliente</option>
        <option value="operador">Operador</option>
      </select>

      <br /><br />

      <button onClick={login}>Entrar</button>
    </div>
  );
}
