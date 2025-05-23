// src/components/Nav/NavLogoutButtonIsland.tsx
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@js/firebase";
import LogoutButton from "@components/Auth/LogoutIsland";

export default function NavLogoutButtonIsland() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  if (!loggedIn) return null;

  return (
    <div className="ml-4 hidden md:block">
      <LogoutButton />
    </div>
  );
}