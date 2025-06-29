import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { auth } from "@js/firebase";

const db = getFirestore();

type Filtro = "todos" | "asiste_si" | "asiste_no" | "asiste_sin" | "alergia_si" | "alergia_no";

export default function InfoInvitadosIsland() {
  const [invitados, setInvitados] = useState<any[]>([]);
  const [datosOriginales, setDatosOriginales] = useState<any[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [invitadoSeleccionado, setInvitadoSeleccionado] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.warn("Usuario no autenticado");
        setLoading(false);
        return;
      }
  
      try {
        const snapshot = await getDocs(collection(db, "invitados"));
        const allDocs = snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            ...data,
            id: doc.id,
            codigo: data.codigo || doc.id,
          };
        });
  
        const esNovio = allDocs.find(
          (inv) => inv.email?.toLowerCase() === user.email?.toLowerCase() && inv.zona_novios === true
        );
  
        if (!esNovio) {
          console.warn("No autorizado para ver la lista de invitados");
          setInvitados([]);
          return;
        }
  
        setDatosOriginales(allDocs);
  
        const datos = allDocs
          .map((data) => ({
            nombre: `${data.nombre || ""} ${data.apellido1 || ""} ${data.apellido2 || ""}`.trim(),
            asiste: data.asiste === true ? "Sí" : data.asiste === false ? "No" : "Sin confirmar",
            alergia: data.alergia === true ? data.tipo_alergia || "Sin especificar" : "No",
            codigo: data.codigo || data.id || "",
          }))
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
  
        setInvitados(datos);
      } catch (e) {
        console.error("Error cargando invitados", e);
      } finally {
        setLoading(false);
      }
    });
  
    return () => unsubscribe();
  }, []);

  const compartirCodigo = async (codigo: string) => {
    const url = `${window.location.origin}/code/?code=${codigo}`;
    const mensaje = `Puedes acceder a la web de Noelia y Juanjo desde este enlace:\n\n${url}\n\nTu código de acceso es:\n${codigo}`;

    if (navigator.share) {
      try {
        await navigator.share({ text: mensaje });
      } catch (err) {
        console.error("Error al compartir:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(mensaje);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2000);
      } catch {
        alert("Tu navegador no soporta compartir. Copia este mensaje:\n\n" + mensaje);
      }
    }
  };

  const invitadosFiltrados = invitados.filter((inv) => {
    switch (filtro) {
      case "asiste_si":
        return inv.asiste === "Sí";
      case "asiste_no":
        return inv.asiste === "No";
      case "asiste_sin":
        return inv.asiste === "Sin confirmar";
      case "alergia_si":
        return inv.alergia !== "No";
      case "alergia_no":
        return inv.alergia === "No";
      default:
        return true;
    }
  });

  if (loading) return <p className="text-center text-stone-500 mt-8">Cargando invitados...</p>;

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-20">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-6 w-full max-w-4xl relative">
        <h1 className="text-2xl font-bold text-stone-700 mb-2">Lista de invitados</h1>
        <p className="text-stone-500 text-sm mb-4">
          Aquí puedes consultar quién ha confirmado asistencia y si tiene alergias.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {["todos", "asiste_si", "asiste_no", "asiste_sin", "alergia_si", "alergia_no"].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltro(tipo as Filtro)}
              className={`px-3 py-1 rounded-full text-sm border ${
                filtro === tipo ? "bg-purple-100 border-purple-300 text-purple-700" : "border-stone-300 text-stone-600"
              }`}
            >
              {tipo === "todos" && "Todos"}
              {tipo === "asiste_si" && "Asisten"}
              {tipo === "asiste_no" && "No asisten"}
              {tipo === "asiste_sin" && "Sin confirmar"}
              {tipo === "alergia_si" && "Con alergia"}
              {tipo === "alergia_no" && "Sin alergia"}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="min-w-full border border-stone-300 rounded-xl overflow-hidden">
            <thead className="bg-stone-100 text-stone-700 text-sm">
              <tr>
                <th className="px-4 py-2 text-left border-b">Nombre</th>
                <th className="px-4 py-2 text-left border-b">Asiste</th>
                <th className="px-4 py-2 text-left border-b">Alergia</th>
                <th className="px-4 py-2 text-left border-b text-center">Enviar código</th>
              </tr>
            </thead>
            <tbody>
              {invitadosFiltrados.map((invitado, i) => (
                <tr
                  key={i}
                  className="hover:bg-stone-50 text-stone-600 text-sm cursor-pointer"
                  onClick={() => {
                    const full = datosOriginales.find((d) => {
                      const code = invitado.codigo || "";
                      return d.codigo === code || d.id === code;
                    });
                    if (full) {
                      setEditando(full);
                      setInvitadoSeleccionado(full);
                    } else {
                      alert("No se pudo encontrar el invitado completo.");
                    }
                  }}
                >
                  <td className="px-4 py-2 border-b">{invitado.nombre}</td>              
                  <td className="px-4 py-2 border-b">{invitado.asiste}</td>
                  <td className="px-4 py-2 border-b">{invitado.alergia}</td>
                  <td className="px-4 py-2 border-b text-center">
                    {invitado.codigo && (
                      <button
                        type="button"
                        onClick={() => compartirCodigo(invitado.codigo)}
                        title="Compartir código"
                        className="text-stone-500 hover:text-stone-800"
                      >
                        <img src="/favicons/share.png" alt="Compartir" className="w-4 h-4 inline" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {invitadosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-stone-400 py-4 italic">
                    No hay invitados que cumplan ese filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {editando && invitadoSeleccionado && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full relative">
              <h2 className="text-xl font-bold text-stone-700 mb-4">Editar invitado</h2>
              <input value={editando.nombre || ""} onChange={(e) => setEditando({ ...editando, nombre: e.target.value })} placeholder="Nombre" className="input input-bordered w-full mb-2" />
              <input value={editando.apellido1 || ""} onChange={(e) => setEditando({ ...editando, apellido1: e.target.value })} placeholder="Apellido 1" className="input input-bordered w-full mb-2" />
              <input value={editando.apellido2 || ""} onChange={(e) => setEditando({ ...editando, apellido2: e.target.value })} placeholder="Apellido 2" className="input input-bordered w-full mb-2" />
              <select value={editando.asiste ?? ""} onChange={(e) => setEditando({ ...editando, asiste: e.target.value === "true" ? true : e.target.value === "false" ? false : null })} className="input input-bordered w-full mb-2">
                <option value="">Sin confirmar</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
              <select value={editando.alergia ? "true" : "false"} onChange={(e) => setEditando({ ...editando, alergia: e.target.value === "true" })} className="input input-bordered w-full mb-2">
                <option value="false">Sin alergia</option>
                <option value="true">Con alergia</option>
              </select>
              {editando.alergia && <input value={editando.tipo_alergia || ""} onChange={(e) => setEditando({ ...editando, tipo_alergia: e.target.value })} placeholder="Tipo de alergia" className="input input-bordered w-full mb-2" />}

              <div className="flex justify-between mt-4">
              <button
                onClick={async () => {
                  if (!editando || !invitadoSeleccionado?.codigo) return;

                  const cambios: Record<string, any> = {};
                  for (const key in editando) {
                    const nuevoValor = editando[key];
                    const valorOriginal = invitadoSeleccionado[key];

                    // Si cambió y no es undefined, lo añadimos
                    if (nuevoValor !== valorOriginal && nuevoValor !== undefined) {
                      cambios[key] = nuevoValor;
                    }
                  }

                  if (Object.keys(cambios).length === 0) {
                    console.log("No hay cambios que guardar.");
                    setEditando(null);
                    setInvitadoSeleccionado(null);
                    return;
                  }

                  console.log("Guardando solo cambios:", cambios);

                  await setDoc(doc(db, "invitados", invitadoSeleccionado.codigo), cambios, { merge: true });

                  setEditando(null);
                  setInvitadoSeleccionado(null);
                  location.reload();
                }}
                className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition"
              >
                Guardar
              </button>

                <button
                  onClick={async () => {
                    try {
                      if (!confirm("¿Seguro que quieres borrar este invitado?")) return;

                      if (!invitadoSeleccionado?.codigo) {
                        console.warn("Invitado sin código, no se puede borrar");
                        return;
                      }

                      console.log("Intentando borrar:", invitadoSeleccionado.codigo);

                      await deleteDoc(doc(db, "invitados", invitadoSeleccionado.codigo));

                      console.log("Borrado correcto");

                      setEditando(null);
                      setInvitadoSeleccionado(null);

                      location.reload();
                    } catch (err) {
                      console.error("Error eliminando invitado:", err);
                      alert("No se pudo borrar el invitado. Consulta la consola.");
                    }
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
                >
                  Borrar
                </button>

                <button onClick={() => {
                  setEditando(null);
                  setInvitadoSeleccionado(null);
                }} className="text-stone-500 hover:text-stone-700 text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {toastVisible && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">
            Mensaje copiado al portapapeles
          </div>
        )}

        <div className="mt-8 text-center">
          <a href="/novios" className="inline-block text-primary-500 hover:underline text-sm">
            ← Volver a la zona de novios
          </a>
        </div>
      </div>
    </div>
  );
}
