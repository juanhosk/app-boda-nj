import { useState } from "react";
import { db } from "@js/firebase";
import { doc, setDoc, updateDoc, collection, getDoc } from "firebase/firestore";
import { increment } from "firebase/firestore";

interface Props {
  code: string;
  numAcompanantes: number;
  pendientesPorAsignar: number;
  setNumAcompanantes: (n: number) => void;
  setMensaje: (msg: string) => void;
}

export default function AddInvitadosForm({ code, numAcompanantes, pendientesPorAsignar, setNumAcompanantes, setMensaje }: Props) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState("");
  const [apellido1, setApellido1] = useState("");
  const [apellido2, setApellido2] = useState("");
  const [alergia, setAlergia] = useState(false);
  const [tipoAlergia, setTipoAlergia] = useState("");

  const handleCancelar = async () => {
    const ref = doc(db, "invitados", code);
    await updateDoc(ref, { num_acompanante: increment(-1) });
    setNumAcompanantes(numAcompanantes - 1);
    setMensaje("Has indicado que no añadirás acompañante.");
  };

  const handleCrear = async () => {
    // 1. Generar código aleatorio de 3 cifras
    const randomNumber = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
    const nombreLower = nombre.trim().toLowerCase().replace(/\s+/g, "");
    const apellidoLower = apellido1.trim().toLowerCase().replace(/\s+/g, "");
  
    // 2. Formar el código completo
    const generatedCode = `${randomNumber}${nombreLower}${apellidoLower}`;
  
    // 3. Crear documento con ese código como ID
    const newDocRef = doc(db, "invitados", generatedCode);
    await setDoc(newDocRef, {
      nombre,
      apellido1,
      apellido2,
      asiste: true,
      alergia,
      tipo_alergia: alergia ? tipoAlergia : "",
      num_fotos_subidas: 0,
      max_fotos_subir: 10,
      email: "",
      subir_fotos: true,
      is_acompanante: true,
    });
  
    // 4. Asociar al invitado principal en el campo acompañante
    const invitadoRef = doc(db, "invitados", code); // `code` del invitado principal
    const existingSnap = await getDoc(invitadoRef);
    const existingData = existingSnap.data();
    const existingMap = existingData?.acompanante || {};
    const nextKey = `acom${Object.keys(existingMap).length + 1}`;
  
    await updateDoc(invitadoRef, {
      [`acompanante.${nextKey}`]: newDocRef,
    });
  
    setMensaje(`¡Acompañante añadido correctamente con código ${generatedCode}!`);
    window.location.href = "/privado";
  };
  
  

  return (
    <div className="mt-12 text-left">
      {!mostrarFormulario ? (
        <div className="bg-white border border-stone-300 rounded-md p-6">
          <p className="text-stone-700 mb-4">
            Tienes {pendientesPorAsignar} acompañante{pendientesPorAsignar > 1 ? "s" : ""} pendiente{pendientesPorAsignar > 1 ? "s" : ""} de asignar. ¿Quieres añadir uno ahora?
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setMostrarFormulario(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md"
            >
              Sí, añadir acompañante
            </button>
            <button
              onClick={handleCancelar}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md"
            >
              No añadir
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-stone-300 rounded-md p-6">
          <h4 className="text-lg font-semibold text-stone-800 mb-4">Formulario para nuevo acompañante</h4>
          <div className="grid gap-4">
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="border border-stone-300 px-4 py-2 rounded-md"
            />
            <input
              type="text"
              placeholder="Primer apellido"
              value={apellido1}
              onChange={(e) => setApellido1(e.target.value)}
              className="border border-stone-300 px-4 py-2 rounded-md"
            />
            <input
              type="text"
              placeholder="Segundo apellido"
              value={apellido2}
              onChange={(e) => setApellido2(e.target.value)}
              className="border border-stone-300 px-4 py-2 rounded-md"
            />

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-stone-700">¿Tiene alguna alergia?</label>
              <label className="relative inline-flex items-center w-14 h-8 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alergia}
                  onChange={() => setAlergia(!alergia)}
                  className="sr-only peer"
                />
                <div className="w-full h-full bg-red-500 peer-checked:bg-green-500 rounded-full transition-colors duration-300" />
                <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6" />
              </label>
              <span className={`text-sm font-medium ${alergia ? "text-green-600" : "text-red-600"}`}>
                {alergia ? "Sí" : "No"}
              </span>
            </div>

            {alergia && (
              <textarea
                placeholder="Ej: Frutos secos, vegetariano, sin gluten..."
                value={tipoAlergia}
                onChange={(e) => setTipoAlergia(e.target.value)}
                className="border border-stone-300 px-4 py-2 rounded-md"
              />
            )}
          </div>

          <div className="text-center mt-6">
            <button
              onClick={handleCrear}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-6 rounded-md"
            >
              Guardar acompañante
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
