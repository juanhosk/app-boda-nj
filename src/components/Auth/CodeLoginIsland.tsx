import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@js/firebase";

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
        window.location.href = "/";
        return;
      }

      try {
        const ref = doc(db, "invitados", urlCode);
        const snap = await getDoc(ref);

        const esperaMinima = 100; 

        if (!snap.exists()) {
          await new Promise((r) => setTimeout(r, esperaMinima));
          window.location.href = "/";
          return;
        }

        const data = snap.data();
        localStorage.setItem("invitado", JSON.stringify({ ...data, code: urlCode }));

        const tiempoTranscurrido = Date.now() - inicio;
        const esperaRestante = Math.max(0, esperaMinima - tiempoTranscurrido);

        setTimeout(() => {
          window.location.href = "/privado";
        }, esperaRestante);
      } catch (error) {
        console.error("Error al buscar el invitado:", error);
        window.location.href = "/";
      }
    };

    loginConCodigo();
  }, [propCode]);
}
