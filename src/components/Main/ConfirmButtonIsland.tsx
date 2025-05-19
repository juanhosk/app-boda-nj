import { useEffect, useState } from "react";

export default function ConfirmButtonIsland() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const invitado = localStorage.getItem("invitado");
    if (invitado) {
      setIsLoggedIn(true);
    }
  }, []);

  if (isLoggedIn) return null;

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
