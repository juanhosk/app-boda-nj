import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@js/firebase";

export default function CodeLoginIsland({ code }: { code: string }) {
  useEffect(() => {
    const loginConCodigo = async () => {
      const inicio = Date.now();
      try {
        const ref = doc(db, "invitados", code);
        const snap = await getDoc(ref);

        const esperaMinima = 1000; // 1 segundo

        if (!snap.exists()) {
          await new Promise((r) => setTimeout(r, esperaMinima));
          window.location.href = "/";
          return;
        }

        const data = snap.data();
        const nombre = data.nombre ?? "Invitado";
        localStorage.setItem("invitado", JSON.stringify({ code, nombre }));

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
  }, [code]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fafaf9", // como el fondo de la web
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <img
        src="/favicons/rings.png"
        alt="Acceso"
        style={{
          width: "100px",
          height: "100px",
          marginBottom: "1.5rem",
          animation: "spin 1.5s linear infinite",
        }}
      />
      <p style={{ color: "#525252", fontSize: "1.125rem" }}>
        Cargando acceso personalizado...
      </p>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
