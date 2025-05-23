import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { auth } from "@js/firebase";

const db = getFirestore();

type Filtro = "todos" | "asiste_si" | "asiste_no" | "asiste_sin" | "alergia_si" | "alergia_no";

export default function InfoInvitadosIsland() {
  const [invitados, setInvitados] = useState<any[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const fetchInvitados = async () => {
      try {
        const user = auth.currentUser;
        const snapshot = await getDocs(collection(db, "invitados"));
        const allDocs = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));

        const esNovio = allDocs.find(
          (inv) => inv.email?.toLowerCase() === user?.email?.toLowerCase() && inv.zona_novios === true
        );

        if (!esNovio) {
          console.warn("No autorizado para ver la lista de invitados");
          setInvitados([]);
          return;
        }

        const datos = allDocs
          .map((data) => ({
            nombre: `${data.nombre || ""} ${data.apellido1 || ""} ${data.apellido2 || ""}`.trim(),
            asiste: data.asiste === true ? "Sí" : data.asiste === false ? "No" : "Sin confirmar",
            alergia: data.alergia === true ? data.tipo_alergia || "Sin especificar" : "No",
            codigo: data.codigo || data.id || ""
          }))
          .sort((a, b) => a.nombre.localeCompare(b.nombre));

        setInvitados(datos);
      } catch (e) {
        console.error("Error cargando invitados", e);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitados();
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
                <tr key={i} className="hover:bg-stone-50 text-stone-600 text-sm">
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
                        <img
                          src="/favicons/share.png"
                          alt="Compartir"
                          className="w-4 h-4 inline"
                        />
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

        {toastVisible && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50">
            Mensaje copiado al portapapeles
          </div>
        )}

        <div className="mt-8 text-center">
          <a
            href="/novios"
            className="inline-block text-primary-500 hover:underline text-sm"
          >
            ← Volver a la zona de novios
          </a>
        </div>
      </div>
    </div>
  );
}
