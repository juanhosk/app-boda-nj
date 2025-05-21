import { useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@js/firebase";
import { navigate } from "astro:transitions/client";

export default function CodeLoginIsland({ code: propCode }: { code?: string }) {
  useEffect(() => {
    const loginConCodigo = async () => {
      const inicio = Date.now();

      // Obtener el código de la URL si no se pasó como prop
      const urlCode =
        propCode ||
        window.location.pathname.split("/").pop() ||
        new URLSearchParams(window.location.search).get("code") ||
        "";

      if (!urlCode) {
        navigate("/");
        return;
      }

      try {
        const ref = doc(db, "invitados", urlCode);
        const snap = await getDoc(ref);

        const esperaMinima = 100; 

        if (!snap.exists()) {
          await new Promise((r) => setTimeout(r, esperaMinima));
          navigate("/");
          return;
        }

        const data = snap.data();
        localStorage.setItem("invitado", JSON.stringify({ ...data, code: urlCode }));

        const tiempoTranscurrido = Date.now() - inicio;
        const esperaRestante = Math.max(0, esperaMinima - tiempoTranscurrido);

        setTimeout(() => {
          navigate("/privado");
        }, esperaRestante);
      } catch (error) {
        console.error("Error al buscar el invitado:", error);
        navigate("/");
      }
    };

    loginConCodigo();
  }, [propCode]);
  
  // This component does not render anything, so return null.
  return null; 
}
