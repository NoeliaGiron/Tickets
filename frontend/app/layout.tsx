// app/layout.tsx
import "./globals.css";
import Navbar from "./components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">  {/* Define el lenguaje de la página */}
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sistema de Tickets</title>  {/* Puedes cambiar el título */}
      </head>
      <body>
        <Navbar />
        {children} {/* Los componentes y páginas internas se renderizan aquí */}
      </body>
    </html>
  );
}
