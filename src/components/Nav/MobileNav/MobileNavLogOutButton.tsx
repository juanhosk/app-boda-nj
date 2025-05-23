
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
    <div className="block w-full text-center bg-primary-500 text-white py-3 px-6 rounded-md font-semibold hover:bg-primary-600 transition">
      <LogoutButton />
    </div>
  );
}