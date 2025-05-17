import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@js/firebase";

export default function RevisarForm() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [alergia, setAlergia] = useState(false);
  const [tipoAlergia, setTipoAlergia] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido1, setApellido1] = useState("");
  const [apellido2, setApellido2] = useState("");
  const [maxFotos, setMaxFotos] = useState(0);
  const [numFotos, setNumFotos] = useState(0);
  const [asiste, setAsiste] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [bloqueado, setBloqueado] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalData, setOriginalData] = useState({
    email: "",
    tipoAlergia: "",
    apellido2: "",
    asiste: true,
    alergia: false
  });

  const hasChanges = () => {
    return (
      email !== originalData.email ||
      tipoAlergia !== originalData.tipoAlergia ||
      apellido2 !== originalData.apellido2 ||
      asiste !== originalData.asiste ||
      alergia !== originalData.alergia
    );
  };

  const confirmarCambios = async () => {
    const ref = doc(db, "invitados", code);
    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 1000)); // ⏱️ Pausa artificial
      await updateDoc(ref, {
        email,
        alergia,
        tipo_alergia: alergia ? tipoAlergia : "",
        apellido2,
        asiste,
      });
      setMensaje("Datos actualizados correctamente ✨");
      setConfirmModal(false);
      setOriginalData({ email, tipoAlergia, apellido2, asiste, alergia });
    } catch (err) {
      console.error("Error al guardar en Firestore:", err);
      setError("Ocurrió un error al guardar los datos.");
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    const stored = localStorage.getItem("invitado");
    if (!stored) return;
    const { code } = JSON.parse(stored);
    setCode(code);

    const fetchData = async () => {
      const ref = doc(db, "invitados", code);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setEmail(data.email || "");
        setAlergia(data.alergia || false);
        setTipoAlergia(data.tipo_alergia || "");
        setNombre(data.nombre);
        setApellido1(data.apellido1);
        setApellido2(data.apellido2 || "");
        setMaxFotos(data.max_fotos_subir || 0);
        setNumFotos(data.num_fotos_subidas || 0);
        setAsiste(data.asiste !== false);

        const boda = new Date("2026-05-15T18:00:00");
        const hoy = new Date();
        const diff = boda.getTime() - hoy.getTime();
        const dosMesesMs = 1000 * 60 * 60 * 24 * 60;
        if (diff < dosMesesMs) setBloqueado(true);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!code) return;
  
    if (alergia && tipoAlergia.trim() === "") {
      setError("Por favor, indica el tipo de alergia si has seleccionado que tienes una.");
      return;
    }
  
    await confirmarCambios();
  };

  const cancelarAsistencia = async () => {
    const ref = doc(db, "invitados", code);
    await updateDoc(ref, { asiste: false });
    setAsiste(false);
    setShowModal(false);
    setMensaje("Has cancelado tu asistencia. Se ha enviado un aviso a los novios.");
  };

  if (loading) return <p className="py-20 text-center text-stone-600">Cargando...</p>;

  return (
    <section className="bg-neutral-50 py-20 px-4">
      <div className="site-container max-w-xl mx-auto">
        <h2 className="text-3xl font-bold text-stone-800 mb-6 text-center">Revisa y actualiza tus datos</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Nombre</label>
              <input type="text" value={nombre} readOnly className="w-full border border-stone-300 rounded-md px-4 py-2 bg-gray-100 opacity-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Apellido 1</label>
              <input type="text" value={apellido1} readOnly className="w-full border border-stone-300 rounded-md px-4 py-2 bg-gray-100 opacity-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Apellido 2</label>
              <input type="text" value={apellido2} onChange={(e) => setApellido2(e.target.value)} className="w-full border border-stone-300 rounded-md px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Fotos restantes por subir</label>
              <input type="text" value={`${maxFotos - numFotos}`} readOnly className="w-full border border-stone-300 rounded-md px-4 py-2 bg-gray-100 opacity-50" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tuemail@example.com"
              className="w-full border border-stone-300 rounded-md px-4 py-2"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="relative inline-flex items-center w-14 h-8 cursor-pointer">
              <input
                type="checkbox"
                checked={alergia}
                onChange={() => setAlergia(!alergia)}
                className="sr-only peer"
              />

              {/* FONDO del switch */}
              <div className="w-full h-full bg-red-500 peer-checked:bg-green-500 rounded-full transition-colors duration-300" />

              {/* CÍRCULO que se mueve */}
              <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6" />
            </label>

            <span className={`text-sm font-medium ${alergia ? "text-green-600" : "text-red-600"}`}>
              {alergia ? "Sí" : "No"}
            </span>
          </div>



          {alergia && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">¿Cuál?</label>
              <input
                type="text"
                value={tipoAlergia}
                onChange={(e) => setTipoAlergia(e.target.value)}
                placeholder="Ej: frutos secos"
                className={`w-full border ${tipoAlergia.trim() === "" ? "border-red-500" : "border-stone-300"} rounded-md px-4 py-2`}
              />
            </div>
          )}

          {!bloqueado && asiste && (
            <div className="bg-red-100 border border-red-400 p-4 rounded-md">
              <p className="text-red-700 text-sm mb-2 font-medium">¿Quieres cancelar tu asistencia?</p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md"
              >
                Cancelar asistencia
              </button>
            </div>
          )}

          {bloqueado && (
            <p className="text-sm text-center text-stone-600 italic">
              Si necesitas cancelar tu asistencia, por favor contacta directamente con los novios.
            </p>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={!hasChanges() || isSubmitting}
            className={`w-full ${hasChanges() ? "bg-primary-500 hover:bg-primary-600" : "bg-stone-300 cursor-not-allowed"} text-white font-semibold py-3 px-6 rounded-md flex justify-center items-center gap-2`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </button>

          {mensaje && <p className="text-primary-500 text-center mt-4">{mensaje}</p>}
        </form>

        <div className="text-center mt-10">
          <a href="/privado" className="text-sm text-primary-500 hover:underline">← Volver a la zona privada</a>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-red-600">¿Estás seguro que deseas cancelar tu asistencia?</h3>
            <p className="text-stone-600 text-sm mb-6">Se enviará un aviso a los novios notificando esta acción.</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowModal(false)} className="text-stone-500 hover:text-stone-700">Cancelar</button>
              <button onClick={cancelarAsistencia} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md">
                Confirmar cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
