import { useEffect, useState } from "react";

export default function NavConfirmButton() {
  const [mostrarBoton, setMostrarBoton] = useState(false);

  useEffect(() => {
    const invitadoStr = localStorage.getItem("invitado");

    if (invitadoStr) {
      try {
        const invitado = JSON.parse(invitadoStr);
        if (!invitado.asiste) {
          setMostrarBoton(true);
        }
      } catch (error) {
        console.error("Error al parsear invitado:", error);
        setMostrarBoton(true); // mostramos botón si hay error en el JSON
      }
    } else {
      setMostrarBoton(true); // no hay invitado → mostrar botón
    }
  }, []);

  if (!mostrarBoton) return null;

  return (
    <a
      href="/privado"
      className="nav__cta py-1 my-auto hidden md:block border border-primary-200 hover:border-primary-200/80 text-sm px-4 rounded-md transition"
    >
      Confirma Asistencia
    </a>
  );
}
