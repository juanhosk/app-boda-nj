import { useEffect, useState } from "react";

export default function NavConfirmButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("invitado");
    setIsLoggedIn(!!user);
  }, []);

  if (isLoggedIn) return null;

  return (
    <a
      href="/login"
      className="nav__cta py-1 my-auto hidden md:block border border-primary-200 hover:border-primary-200/80 text-sm px-4 rounded-md transition"
    >
      Confirma Asistencia
    </a>
  );
}
