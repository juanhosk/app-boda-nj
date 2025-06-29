import { useEffect, useState } from "react";

export default function ConfirmButtonIsland() {
  const [mostrarBoton, setMostrarBoton] = useState(false);

  useEffect(() => {
    const invitadoStr = localStorage.getItem("invitado");

    if (invitadoStr) {
      try {
        const invitado = JSON.parse(invitadoStr);
        // Si no ha confirmado o ha rechazado (false o undefined), mostramos el botón
        if (!invitado.asiste) {
          setMostrarBoton(true);
        }
      } catch (err) {
        console.error("Error al parsear invitado:", err);
        setMostrarBoton(true); // por si acaso está mal el JSON, lo mostramos
      }
    } else {
      // No hay invitado → mostrar botón
      setMostrarBoton(true);
    }
  }, []);

  if (!mostrarBoton) return null;

  return (
    <div className="mt-80 flex flex-wrap justify-center gap-4 md:justify-start">
      <a
        href="/login"
        className="pl-0 text-xl text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] md:text-3xl hover:underline"
      >
        Confirma tu asistencia →
      </a>
    </div>
  );
}
