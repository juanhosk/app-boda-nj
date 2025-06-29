import { useEffect, useState } from "react";
import { navigate } from "astro:transitions/client";

interface ProtectedIslandProps {
  children: React.ReactNode;
}

export default function ProtectedIsland({ children }: ProtectedIslandProps) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const code = localStorage.getItem("code");

    if (!code) {
      navigate("/login");
    } else {
      setAllowed(true);
    }
  }, []);

  if (!allowed) return null; // o spinner si quieres

  return <>{children}</>;
}
