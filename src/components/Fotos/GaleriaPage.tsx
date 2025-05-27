import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db } from "@js/firebase";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";

interface FotoData {
  url: string;
  code: string;
  timestamp: number;
  likes?: number;
  liked_by?: string[];
  id: string;
}

interface InvitadoData {
  nombre: string;
  apellido1: string;
}

export default function GaleriaPage() {
  const [fotos, setFotos] = useState<FotoData[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [nombres, setNombres] = useState<Record<string, InvitadoData>>({});
  const [usuarioCode, setUsuarioCode] = useState<string>("");

  useEffect(() => {
    const fetchFotos = async () => {
      try {
        const local = localStorage.getItem("invitado");
        if (local) {
          const parsed = JSON.parse(local);
          setUsuarioCode(parsed.code);
        }

        const galeriaRef = collection(db, "galeria");
        const q = query(galeriaRef, orderBy("timestamp", "desc"));
        const snap = await getDocs(q);
        const datos = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as FotoData);
        setFotos(datos);

        const codigos = [...new Set(datos.map(f => f.code))];
        const nombreMap: Record<string, InvitadoData> = {};

        for (const code of codigos) {
          const ref = doc(db, "invitados", code);
          const invitadoSnap = await getDoc(ref);
          if (invitadoSnap.exists()) {
            const data = invitadoSnap.data();
            nombreMap[code] = {
              nombre: data.nombre || "",
              apellido1: data.apellido1 || "",
            };
          }
        }

        setNombres(nombreMap);
      } catch (error) {
        console.error("Error al cargar imágenes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFotos();
  }, []);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = "auto";
  };

  const nextFoto = () => {
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex + 1) % fotos.length);
  };
  const prevFoto = () => {
    if (lightboxIndex !== null) setLightboxIndex((lightboxIndex - 1 + fotos.length) % fotos.length);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => nextFoto(),
    onSwipedRight: () => prevFoto(),
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const invitadosUnicos: Record<string, FotoData[]> = {};
  fotos.forEach((foto) => {
    if (!invitadosUnicos[foto.code]) invitadosUnicos[foto.code] = [];
    invitadosUnicos[foto.code].push(foto);
  });

  const formatFecha = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const darLike = async (foto: FotoData, index: number) => {
    if (!usuarioCode || foto.liked_by?.includes(usuarioCode)) return;

    const ref = doc(db, "galeria", foto.id);
    await updateDoc(ref, {
      likes: increment(1),
      liked_by: arrayUnion(usuarioCode),
    });

    const nuevasFotos = [...fotos];
    nuevasFotos[index].likes = (foto.likes || 0) + 1;
    nuevasFotos[index].liked_by = [...(foto.liked_by || []), usuarioCode];
    setFotos(nuevasFotos);
  };

  return (
    <section className="min-h-screen bg-neutral-50 px-4 py-20 relative">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 text-stone-800">
          Galería de fotos 📸
        </h1>

        {loading ? (
          <p className="text-center text-stone-500">Cargando imágenes...</p>
        ) : (
          <>
            <div className="flex overflow-x-auto gap-4 mb-8 px-2 pb-2 items-center">
              <div className="flex flex-col items-center">
                <a
                  href="/fotos"
                  className="flex flex-col items-center justify-center bg-primary-500 text-white w-16 h-16 rounded-full text-2xl font-bold shadow hover:bg-primary-600 transition shrink-0"
                  title="Subir fotos"
                >
                  ➕
                </a>
                <span className="text-xs mt-1 text-stone-600">Añadir</span>
              </div>
              {Object.entries(invitadosUnicos).map(([code, fotos]) => (
                <button
                  key={code}
                  className="flex flex-col items-center"
                  onClick={() => openLightbox(fotos.findIndex(f => f.code === code))}
                >
                  <img
                    src={fotos[0].url}
                    className="w-16 h-16 rounded-full border-4 border-primary-500 object-cover"
                    alt={code}
                  />
                  <span className="text-xs mt-1 text-stone-600 truncate max-w-[70px]">
                    {code.substring(3)}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-10 px-2">
              {fotos.map((foto, i) => (
                <div key={i} className="bg-white rounded-xl shadow p-2">
                  <div className="text-sm text-stone-500 mb-2">
                    {nombres[foto.code]?.nombre} {nombres[foto.code]?.apellido1} — {formatFecha(foto.timestamp)}
                  </div>
                  <img
                    src={foto.url}
                    alt={`foto-${i}`}
                    className="w-full rounded-lg cursor-pointer hover:opacity-80 transition"
                    onClick={() => openLightbox(i)}
                  />
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => darLike(foto, i)}
                      disabled={foto.liked_by?.includes(usuarioCode)}
                      className={`text-xl transition ${foto.liked_by?.includes(usuarioCode) ? "text-red-500" : "text-stone-400"}`}
                    >❤️</button>
                    <span className="text-sm text-stone-600">
                      {foto.likes || 0} like{(foto.likes || 0) !== 1 && "s"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {lightboxIndex !== null && (
                <motion.div
                  className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center touch-none"
                  onClick={closeLightbox}
                  {...swipeHandlers}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.img
                    key={fotos[lightboxIndex].url}
                    src={fotos[lightboxIndex].url}
                    alt="foto ampliada"
                    className="max-w-full max-h-full rounded-lg z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      const bounds = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - bounds.left;
                      const width = bounds.width;
                      if (clickX > width / 2) {
                        nextFoto();
                      } else {
                        prevFoto();
                      }
                    }}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <button
                    onClick={closeLightbox}
                    className="absolute top-4 right-4 text-white text-3xl z-20"
                  >
                    ✕
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  );
}
