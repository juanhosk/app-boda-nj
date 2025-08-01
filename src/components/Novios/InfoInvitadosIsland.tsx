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

type Invitado = {
  id: string;
  codigo: string;
  nombre?: string;
  apellido1?: string;
  apellido2?: string;
  asiste?: boolean;
  alergia?: boolean;
  tipo_alergia?: string;
  email?: string;
  zona_novios?: boolean;
  is_acompanante?: boolean;
  acompanante?: Record<string, string>; // ej. { acom1: "/invitados/xxx" }
  num_acompanante?: number; // Número esperado de acompañantes
};

type InvitadoVista = {
  nombre: string;
  asiste: string;
  alergia: string;
  codigo: string;
  grupoIndex?: number; // Para agrupar acompañantes
};


export default function InfoInvitadosIsland() {
  const [datosOriginales, setDatosOriginales] = useState<any[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [invitadoSeleccionado, setInvitadoSeleccionado] = useState<any | null>(null);
  const [invitados, setInvitados] = useState<InvitadoVista[]>([]);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.warn("Usuario no autenticado");
        setLoading(false);
        return;
      }
  
      try {
        const snapshot = await getDocs(collection(db, "invitados"));
        const allDocs: Invitado[] = snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            ...data,
            id: doc.id,
            codigo: data.codigo || doc.id,
          };
        });

        console.log("✅ Todos los invitados:", allDocs);

        const esNovio = allDocs.find(
          (inv) => inv.email?.toLowerCase() === user.email?.toLowerCase() && inv.zona_novios === true
        );

        if (!esNovio) {
          console.warn("No autorizado para ver la lista de invitados");
          setInvitados([]);
          return;
        }

        setDatosOriginales(allDocs);

        // --- NUEVO: Separamos y preparamos acompañantes ---
        const principales: Invitado[] = [];
        const mapAcompanantes = new Map<string, Invitado>();

        allDocs.forEach((data) => {
          if (data.is_acompanante === true) {
            mapAcompanantes.set(data.codigo || data.id, data);
          } else {
            principales.push(data);
          }
        });

        console.log("Principales:", principales.map((p) => p.codigo));
        console.log("Mapa de acompañantes:", [...mapAcompanantes.keys()]);

        // Ordenamos los principales por nombre completo
        principales.sort((a, b) => {
          const nombreA = `${a.nombre || ''} ${a.apellido1 || ''} ${a.apellido2 || ''}`.trim().toLowerCase();
          const nombreB = `${b.nombre || ''} ${b.apellido1 || ''} ${b.apellido2 || ''}`.trim().toLowerCase();
          return nombreA.localeCompare(nombreB);
        });

        // Creamos la lista final con acompañantes debajo de su principal
        const listaFinal: (Invitado & { grupoIndex: number })[] = [];

        let grupoIndex = 0;

        principales.forEach((principal) => {
          listaFinal.push({ ...principal, grupoIndex });

          const refs = principal.acompanante || {};
          const acompRefs = Object.values(refs).map((ref: any) => ref.id);
          const nombrePrincipal = `${principal.nombre || ""} ${principal.apellido1 || ""}`.trim();

          // Añadir acompañantes existentes
          acompRefs.forEach((codigo) => {
            const acomp = mapAcompanantes.get(codigo);
            if (acomp) {
              listaFinal.push({ ...acomp, grupoIndex });
            }
          });

          // Añadir acompañantes ficticios si faltan
          const numActual = acompRefs.length;
          const numEsperado = principal.num_acompanante ?? 0;
          const faltan = Math.max(0, numEsperado - numActual);

          for (let i = 0; i < faltan; i++) {
            listaFinal.push({
              id: `ficticio-${principal.codigo}-${i}`,
              codigo: `ficticio-${principal.codigo}-${i}`,
              nombre: `Acompañante de ${nombrePrincipal}`,
              asiste: undefined,
              alergia: false,
              tipo_alergia: "",
              grupoIndex,
            });
          }

          grupoIndex++;
        });


        // Mapeamos como antes para mostrar en UI
        const datos: InvitadoVista[] = listaFinal.map((data) => ({
          nombre: `${data.nombre || ""} ${data.apellido1 || ""} ${data.apellido2 || ""}`.trim(),
          asiste: data.asiste === true ? "Sí" : data.asiste === false ? "No" : "Sin confirmar",
          alergia: data.alergia === true ? data.tipo_alergia || "Sin especificar" : "No",
          codigo: data.codigo || data.id || "",
          grupoIndex: data.grupoIndex ?? 0,
        }));


        setInvitados(datos);
      } catch (e) {
        console.error("Error cargando invitados", e);
      } finally {
        setLoading(false);
      }

    });
  
    return () => unsubscribe();
  }, []);

  const compartirCodigo = async (inv: Invitado) => {
    const url = `${window.location.origin}/code/?code=${inv.codigo}`;
    const nombreInv = `${inv.nombre || ""}`.trim();

    // Buscar nombres de acompañantes si los tiene
    const acompanantesNombres = (() => {
      if (!inv.acompanante || Object.keys(inv.acompanante).length === 0) return "";

      const acompIds = Object.values(inv.acompanante).map((ref: any) => ref.id);
      const acompNombres = datosOriginales
        .filter((d) => acompIds.includes(d.id))
        .map((a) => `${a.nombre || "Acompañante"}`.trim());

      if (acompNombres.length === 1) return ` junto a ${acompNombres[0]}`;
      if (acompNombres.length > 1) {
        const [primero, ...resto] = acompNombres;
        return ` junto a ${primero} y ${resto.join(", ")}`;
      }

      return "";
    })();

    const mensaje = `¡Hola ${nombreInv}! 💌

Nos hace muchísima ilusión que puedas acompañarnos el día de nuestra boda${acompanantesNombres} 🥰

Puedes acceder a todos los detalles desde este enlace:
${url}

Y este es tu código de acceso personal:
${inv.codigo}

Desde aquí podrás confirmar tu asistencia, contarnos si tienes alguna alergia o necesitas un menú especial…  
¡Y también subir tus fotos el día del evento para que podamos revivir juntos cada momento! 📸💞

Gracias por formar parte de un día tan especial para nosotros.
Con cariño,
Noelia & Juanjo 💖`;


    try {
      if (navigator.share) {
        await navigator.share({ text: mensaje });
      } else {
        await navigator.clipboard.writeText(mensaje);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2000);
      }
    } catch (err) {
      console.error("Error al compartir:", err);
      alert("No se pudo compartir. Aquí tienes tu mensaje para copiar:\n\n" + mensaje);
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

        <p className="text-sm text-stone-500 mt-2">
          Total: <strong>{invitadosFiltrados.length}</strong> invitado{invitadosFiltrados.length !== 1 && "s"}
        </p>

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
              {invitadosFiltrados.map((invitado, i) => {
                const colorGrupo =
                  (invitado.grupoIndex ?? 0) % 2 === 0 ? "bg-stone-100" : "bg-stone-200";

                return (
                  <tr
                    key={i}
                    className={`${colorGrupo} hover:bg-stone-50 text-stone-600 text-sm cursor-pointer`}
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
                          onClick={() => {
                            const full = datosOriginales.find((d) => d.codigo === invitado.codigo || d.id === invitado.codigo);
                            if (full) compartirCodigo(full);
                          }}
                          title="Compartir código"
                          className="text-stone-500 hover:text-stone-800"
                        >
                          <img src="/favicons/share.png" alt="Compartir" className="w-4 h-4 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
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
