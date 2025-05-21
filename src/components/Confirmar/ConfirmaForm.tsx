import { useEffect, useState } from "react";
import { db } from "@js/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import ConfirmarInvitadosForm from "./ConfirmarInvitadosForm.tsx";
import AddInvitadosForm from "./AddInvitadosForm.tsx";
import { ToastProvider, useToast } from "./ToastContext.tsx";

interface AcompananteEditable {
  id: string;
  nombre: string;
  apellido1: string;
  asiste: boolean | null;
  alergia: boolean;
  tipo_alergia: string;
}

function ConfirmarFormContent() {
  const { showToast } = useToast();
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [guestConfirmation, setGuestConfirmation] = useState({
    asiste: null as boolean | null,
    alergia: false,
    tipoAlergia: ""
  });
  const [acompanantesEditables, setAcompanantesEditables] = useState<AcompananteEditable[]>([]);
  const [numAcompanantes, setNumAcompanantes] = useState(0);
  const [hasMapAcompanantes, setHasMapAcompanantes] = useState(false);
  // showAddForm is removed

  useEffect(() => {
    const stored = localStorage.getItem("invitado");
    if (!stored) return;

    const { code, nombre } = JSON.parse(stored);
    setNombre(nombre);
    setCode(code);

    const fetchData = async () => {
      const ref = doc(db, "invitados", code);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setGuestConfirmation({
          asiste: data.asiste ?? null,
          alergia: data.alergia ?? false,
          tipoAlergia: data.tipo_alergia ?? ""
        });
        setNumAcompanantes(data.num_acompanante ?? 0);

        if (data.acompanante) {
          setHasMapAcompanantes(true); // This state might also be derivable or incorporated elsewhere if appropriate
          const acompKeys = Object.keys(data.acompanante);
          const acompRefs = acompKeys.map((key) => data.acompanante[key]);
          const acompData = await Promise.all(
            acompRefs.map(async (refDoc: any) => { // Explicitly type refDoc if possible, or use 'any' cautiously
              const snapDoc = await getDoc(refDoc);
              if (!snapDoc.exists()) return null;
              const dataDoc = snapDoc.data() ?? {};
              return { id: refDoc.id, ...dataDoc };
            })
          );
          const acompanantesEnMap = acompData.filter(Boolean).length;
          setAcompanantesEditables(
            acompData.filter(Boolean).map((a: any) => ({ // Explicitly type 'a' if possible
              id: a.id,
              nombre: a.nombre ?? "",
              apellido1: a.apellido1 ?? "",
              asiste: a.asiste ?? null,
              alergia: a.alergia ?? false,
              tipo_alergia: a.tipo_alergia ?? ""
            }))
          );
          // setShowAddForm(acompanantesEnMap < (data.num_acompanante ?? 0)); // Removed state setter
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleConfirm = async (respuesta: boolean) => {
    if (!code) return;
    const ref = doc(db, "invitados", code);
    await updateDoc(ref, { asiste: respuesta });
    setGuestConfirmation(prev => ({ ...prev, asiste: respuesta }));
    showToast("¡Gracias por confirmar tu asistencia!", "ok");
  };

  const handleGuardarAlergia = async () => {
    if (!code) return;
  
    if (guestConfirmation.alergia && guestConfirmation.tipoAlergia.trim().length < 3) {
      showToast("Por favor, indica el tipo de alergia con al menos 3 caracteres.", "error");
      return;
    }
  
    const ref = doc(db, "invitados", code);
    await updateDoc(ref, {
      alergia: guestConfirmation.alergia,
      tipo_alergia: guestConfirmation.alergia ? guestConfirmation.tipoAlergia : ""
    });
    showToast("¡Información adicional guardada!", "ok");
  };
  
  const pendientesPorAsignar = numAcompanantes - acompanantesEditables.length;
  const shouldShowAddForm = numAcompanantes > acompanantesEditables.length; // Derived state

  if (loading) {
    return <p className="py-20 text-center text-stone-600">Cargando...</p>;
  }

  return (
    // <section className="bg-neutral-50 py-20 px-4"> // This will be wrapped by ToastProvider
      <div className="site-container max-w-xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-stone-800 mb-4">Confirmar asistencia</h2>
        <p className="text-stone-600 mb-6">Hola, {nombre}. ¿Podrás acompañarnos en nuestro día especial?</p>

        <div className="flex justify-center gap-6 mb-6">
          <button
            onClick={() => handleConfirm(true)}
            className={`py-3 px-6 rounded-xl text-white text-lg font-semibold transition ${guestConfirmation.asiste === true ? "bg-green-600" : "bg-green-500 hover:bg-green-600"}`}
          >
            Sí, asistiré
          </button>
          <button
            onClick={() => handleConfirm(false)}
            disabled={guestConfirmation.asiste === true}
            className={`py-3 px-6 rounded-xl text-white text-lg font-semibold transition ${guestConfirmation.asiste === false ? "bg-red-600" : guestConfirmation.asiste === true ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}
          >
            No podré asistir
          </button>
        </div>

        {guestConfirmation.asiste === true && (
          <div className="mt-8 text-left">
            <p className="mb-4 text-stone-700">¿Tienes alguna alergia alimentaria o régimen especial?</p>

            <div className="flex items-center gap-4 mb-6">
              <label className="relative inline-flex items-center w-14 h-8 cursor-pointer">
                <input
                  type="checkbox"
                  checked={guestConfirmation.alergia}
                  onChange={() => setGuestConfirmation(prev => ({ ...prev, alergia: !prev.alergia }))}
                  className="sr-only peer"
                />
                <div className="w-full h-full bg-red-500 peer-checked:bg-green-500 rounded-full transition-colors duration-300" />
                <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6" />
              </label>
              <span className={`text-sm font-medium ${guestConfirmation.alergia ? "text-green-600" : "text-red-600"}`}>
                {guestConfirmation.alergia ? "Sí" : "No"}
              </span>
            </div>

            {guestConfirmation.alergia && (
              <div className="mb-6">
                <textarea
                  value={guestConfirmation.tipoAlergia}
                  onChange={(e) => setGuestConfirmation(prev => ({ ...prev, tipoAlergia: e.target.value }))}
                  className={`w-full border px-4 py-2 rounded-md ${
                    guestConfirmation.tipoAlergia.trim().length < 3 ? "border-red-500" : "border-stone-300"
                  }`}
                  placeholder="Ej: Frutos secos, vegetariano, sin gluten..."
                />
              </div>
            )}


            <div className="text-center">
              <button
                onClick={handleGuardarAlergia}
                className="mt-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-6 rounded-md"
              >
                Guardar información
              </button>
            </div>
          </div>
        )}

        {/* Render dinámico de acompañantes */}
        {numAcompanantes > 0 && (
          <>
            {/* Mostrar los ya asignados */}
            {acompanantesEditables.length > 0 && (
              <ConfirmarInvitadosForm
                acompanantes={acompanantesEditables}
                setAcompanantes={setAcompanantesEditables}
                // setMensaje and setToastTipo removed
              />
            )}

            {/* Mostrar formulario de añadir si aún faltan */}
            {shouldShowAddForm && ( // Use derived state
              <AddInvitadosForm
                code={code}
                numAcompanantes={numAcompanantes}
                pendientesPorAsignar={pendientesPorAsignar}
                setNumAcompanantes={setNumAcompanantes}
                // setMensaje removed
              />
            )}
          </>
        )}

        {/* The old {mensaje && <p... an toast UI are removed */}

        <a href="/privado" className="mt-10 inline-block text-primary-500 hover:underline text-sm">← Volver a la zona privada</a>
      </div>
    // </section>
  );
}

export default function ConfirmarForm() {
  return (
    <ToastProvider>
      <section className="bg-neutral-50 py-20 px-4">
        <ConfirmarFormContent />
      </section>
    </ToastProvider>
  );
}
