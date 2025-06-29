import { useEffect, useState } from "react";

export default function MobileNavConfirmButton() {
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
        setMostrarBoton(true); // mostrar por defecto si falla
      }
    } else {
      setMostrarBoton(true); // no hay invitado, mostrar
    }
  }, []);

  if (!mostrarBoton) return null;

  return (
    <a
      href="/login"
      className="block w-full text-center bg-primary-500 text-white py-3 px-6 rounded-md font-semibold hover:bg-primary-600 transition"
    >
      Confirma Asistencia
    </a>
  );
}
