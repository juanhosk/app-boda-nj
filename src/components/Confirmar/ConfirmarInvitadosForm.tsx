import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@js/firebase";

interface AcompananteEditable {
  id: string;
  nombre: string;
  apellido1: string;
  asiste: boolean | null;
  alergia: boolean;
  tipo_alergia: string;
}

interface Props {
  acompanantes: AcompananteEditable[];
  setAcompanantes: (acomps: AcompananteEditable[]) => void;
  setMensaje: (msg: string) => void;
  setToastTipo: (tipo: "ok" | "error") => void;
}

export default function ConfirmarInvitadosForm({ acompanantes, setAcompanantes, setMensaje, setToastTipo}: Props) {
  const [confirmado, setConfirmado] = useState<boolean[]>(acompanantes.map(() => false));
  const [erroresAlergia, setErroresAlergia] = useState<boolean[]>(acompanantes.map(() => false));


  const manejarConfirmacion = (idx: number, valor: boolean) => {
    const copia = [...acompanantes];
    copia[idx].asiste = valor;
    setAcompanantes(copia);

    const copiaConfirmado = [...confirmado];
    copiaConfirmado[idx] = true;
    setConfirmado(copiaConfirmado);
  };

  return (
    <div className="mt-12">
      <h3 className="text-xl font-semibold text-stone-800 mb-4">
        Tienes {acompanantes.length} acompañante{acompanantes.length > 1 ? "s" : ""} asociado{acompanantes.length > 1 ? "s" : ""} a tu invitación
      </h3>

      {acompanantes.map((acomp, idx) => (
        <div key={acomp.id} className="mb-8 border border-stone-200 rounded-md p-6 bg-white text-left">
          <p className="font-medium text-stone-800 mb-2">👤 {acomp.nombre} {acomp.apellido1}</p>

          <div className="flex gap-4 mb-4">
            <button
              onClick={() => manejarConfirmacion(idx, true)}
              disabled={confirmado[idx] && acomp.asiste === false}
              className={`py-2 px-4 rounded-xl text-white font-medium transition text-sm ${
                acomp.asiste === true
                  ? "bg-green-600"
                  : confirmado[idx] && acomp.asiste === false
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              Sí asistirá
            </button>

            <button
              onClick={() => manejarConfirmacion(idx, false)}
              disabled={confirmado[idx] && acomp.asiste === true}
              className={`py-2 px-4 rounded-xl text-white font-medium transition text-sm ${
                acomp.asiste === false
                  ? "bg-red-600"
                  : confirmado[idx] && acomp.asiste === true
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              No asistirá
            </button>
          </div>

          {acomp.asiste === true && (
            <>
              <div className="flex items-center gap-4 mb-4">
                <label className="block text-sm font-medium text-stone-700 mb-1">¿Tiene alguna alergia?</label>
                <label className="relative inline-flex items-center w-14 h-8 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acomp.alergia}
                    onChange={() => {
                      const copia = [...acompanantes];
                      copia[idx].alergia = !copia[idx].alergia;
                      if (!copia[idx].alergia) copia[idx].tipo_alergia = "";
                      setAcompanantes(copia);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-full h-full bg-red-500 peer-checked:bg-green-500 rounded-full transition-colors duration-300" />
                  <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6" />
                </label>
                <span className={`text-sm font-medium ${acomp.alergia ? "text-green-600" : "text-red-600"}`}>
                  {acomp.alergia ? "Sí" : "No"}
                </span>
              </div>

              {acomp.alergia && (
                <textarea
                    value={acomp.tipo_alergia}
                    onChange={(e) => {
                    const copia = [...acompanantes];
                    copia[idx].tipo_alergia = e.target.value;
                    setAcompanantes(copia);
                
                    // limpiar error si empieza a corregir
                    if (erroresAlergia[idx] && e.target.value.trim().length >= 3) {
                        const nuevoErrores = [...erroresAlergia];
                        nuevoErrores[idx] = false;
                        setErroresAlergia(nuevoErrores);
                    }
                    }}
                    className={`w-full rounded-md px-4 py-2 text-sm border ${
                    erroresAlergia[idx] ? "border-red-500" : "border-stone-300"
                    }`}
                    placeholder="Ej: Frutos secos, sin gluten, vegetariano..."
                />
              )}
            </>
          )}
        </div>
      ))}

      <div className="text-center">
        <button
          className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-6 rounded-md"
          onClick={async () => {
            let errorDetectado = false;
            const nuevosErrores = acompanantes.map((a) => {
              if (a.alergia && a.tipo_alergia.trim().length < 3) {
                errorDetectado = true;
                return true;
              }
              return false;
            });
          
            setErroresAlergia(nuevosErrores);
          
            if (errorDetectado) {
              setToastTipo("error");
              setMensaje("Por favor, completa las alergias con al menos 3 caracteres.");
              return;
            }
          
            await Promise.all(
              acompanantes.map((a) => {
                const ref = doc(db, "invitados", a.id);
                return updateDoc(ref, {
                  asiste: a.asiste,
                  alergia: a.alergia,
                  tipo_alergia: a.alergia ? a.tipo_alergia : ""
                });
              })
            );
            setToastTipo("ok");
            setMensaje("¡Información de acompañantes guardada!");
          }}
        >
          Guardar información de acompañantes
        </button>
      </div>
    </div>
  );
}
