import { useEffect, useState } from "react";

export default function MobileNavConfirmButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("invitado");
    setIsLoggedIn(!!user);
  }, []);

  if (isLoggedIn) return null;

  return (
    <a
      href="/login"
      className="block w-full text-center bg-primary-500 text-white py-3 px-6 rounded-md font-semibold hover:bg-primary-600 transition"
    >
      Confirma Asistencia
    </a>
  );
}
