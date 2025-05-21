// src/components/Layout/LoaderIsland.tsx
import { useEffect, useState } from "react";

export default function LoaderIsland() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setLoaded(true), 1200); // dura 1.2s o hasta que todo monte
    return () => clearTimeout(timeout);
  }, []);

  if (loaded) return null;

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 50,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#fafaf9",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <img
        src="/favicons/rings.png"
        alt="Cargando"
        style={{
          width: "100px",
          height: "100px",
          marginBottom: "1.5rem",
          animation: "spin 1.5s linear infinite",
        }}
      />
      <p style={{ color: "#525252", fontSize: "1.125rem" }}>
        Cargando ...
      </p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
