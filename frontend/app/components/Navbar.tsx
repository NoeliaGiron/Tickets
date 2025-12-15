// components/Navbar.tsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [rol, setRol] = useState<string | null>(null);

  useEffect(() => {
    const r = localStorage.getItem("rol");
    setRol(r);
  }, []);

  const logout = () => {
    localStorage.clear();
    router.push("/");
  };

  if (!rol) return null;

  return (
    <nav style={styles.nav}>
      <h3>Sistema de Tickets</h3>

      <div style={styles.links}>
        {rol === "operador" && (
          <>
            <Link href="/operador">Dashboard</Link>
            <Link href="/admin">Admin</Link>
          </>
        )}

        {rol === "cliente" && (
          <Link href="/cliente">Mis Tickets</Link>
        )}

        <button onClick={logout}>Salir</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 20px",
    background: "#111",
    color: "#fff",
  },
  links: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },
};
