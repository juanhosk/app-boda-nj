import { useEffect, useState } from "react";
import { db } from "@js/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function ConfirmarForm() {
  const [nombre, setNombre] = useState("");
  const [asiste, setAsiste] = useState<null | boolean>(null);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [alergia, setAlergia] = useState(false);
  const [tipoAlergia, setTipoAlergia] = useState("");

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
        setAsiste(data.asiste ?? null);
        setAlergia(data.alergia ?? false);
        setTipoAlergia(data.tipo_alergia ?? "");
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleConfirm = async (respuesta: boolean) => {
    if (!code) return;
    const ref = doc(db, "invitados", code);
    await updateDoc(ref, { asiste: respuesta });
    setAsiste(respuesta);
    setMensaje("¡Gracias por confirmar tu asistencia!");
  };

  const handleGuardarAlergia = async () => {
    if (!code) return;
    const ref = doc(db, "invitados", code);
    await updateDoc(ref, {
      alergia,
      tipo_alergia: alergia ? tipoAlergia : ""
    });
    setMensaje("¡Información adicional guardada!");
  };

  if (loading) {
    return <p className="py-20 text-center text-stone-600">Cargando...</p>;
  }

  return (
    <section className="bg-neutral-50 py-20 px-4">
      <div className="site-container max-w-xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-stone-800 mb-4">Confirmar asistencia</h2>
        <p className="text-stone-600 mb-6">Hola, {nombre}. ¿Podrás acompañarnos en nuestro día especial?</p>

        <div className="flex justify-center gap-6 mb-6">
          <button
            onClick={() => handleConfirm(true)}
            className={`py-3 px-6 rounded-xl text-white text-lg font-semibold transition ${asiste === true ? "bg-green-600" : "bg-green-500 hover:bg-green-600"}`}
          >
            Sí, asistiré
          </button>
          <button
            onClick={() => handleConfirm(false)}
            className={`py-3 px-6 rounded-xl text-white text-lg font-semibold transition ${asiste === false ? "bg-red-600" : "bg-red-500 hover:bg-red-600"}`}
          >
            No podré asistir
          </button>
        </div>

        {asiste === true && (
          <div className="mt-8 text-left">
            <p className="mb-4 text-stone-700">¿Tienes alguna alergia alimentaria o régimen especial?</p>
            <div className="flex items-center gap-4 mb-6">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={alergia}
                  onChange={() => setAlergia(!alergia)}
                  className="sr-only peer"
                />
                <div className="relative w-14 h-8 bg-red-500 peer-checked:bg-green-500 rounded-full transition-colors">
                  <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
                </div>
              </label>
              <span className="text-sm font-medium text-stone-700">{alergia ? "Sí" : "No"}</span>
            </div>

            {alergia && (
              <div className="mb-6">
                <textarea
                  value={tipoAlergia}
                  onChange={(e) => setTipoAlergia(e.target.value)}
                  className="w-full border border-stone-300 rounded-md px-4 py-2"
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

        {mensaje && <p className="text-primary-500 text-sm font-medium mt-4">{mensaje}</p>}

        <a href="/privado" className="mt-10 inline-block text-primary-500 hover:underline text-sm">← Volver a la zona privada</a>
      </div>
    </section>
  );
}
