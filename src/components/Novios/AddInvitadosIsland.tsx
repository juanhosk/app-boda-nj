import { useState } from "react";
import { db } from "@js/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { nanoid } from "nanoid";
import { Switch } from "@headlessui/react";

function generarCodigo(nombre: string, apellido1: string): string {
  const random = Math.floor(100 + Math.random() * 900);
  return `${random}${nombre}${apellido1}`.toLowerCase().replace(/\s/g, "");
}

export default function AddInvitadoIsland() {
  const [nombre, setNombre] = useState("");
  const [apellido1, setApellido1] = useState("");
  const [apellido2, setApellido2] = useState("");
  const [subirFotos, setSubirFotos] = useState(false);
  const [maxFotos, setMaxFotos] = useState(1);
  const [tieneAcompanantes, setTieneAcompanantes] = useState(false);
  const [anadirAhora, setAnadirAhora] = useState(false);
  const [acompanantes, setAcompanantes] = useState<any[]>([]);
  const [numAcompanantes, setNumAcompanantes] = useState(0);
  const [modal, setModal] = useState(false);

  const handleAddAcompanante = (index: number, field: string, value: string) => {
    setAcompanantes((prev) => {
      const nuevos = [...prev];
      nuevos[index] = {
        ...nuevos[index],
        [field]: value
      };
      return nuevos;
    });
  };


  const handleCrear = async () => {
    const codigoPrincipal = generarCodigo(nombre, apellido1);

    try {
      const acompRefs: Record<string, any> = {};
      console.log("tiene acopanantes: ", tieneAcompanantes, "anadir ahora: ", anadirAhora);  ;

      if (tieneAcompanantes && anadirAhora) {
        console.log("añadiendo acompañantes ahora");
        for (let i = 0; i < acompanantes.length; i++) {
          const a = acompanantes[i];
          const nombreA = (a?.nombre || "").trim();
          const apellido1A = (a?.apellido1 || "").trim();
          const apellido2A = (a?.apellido2 || "").trim();

          if (!nombreA || !apellido1A) {
            throw new Error(`Acompañante ${i + 1} está incompleto`);
          }

          const cod = generarCodigo(nombreA, apellido1A);

          acompRefs[`acom${i + 1}`] = doc(db, "invitados", cod);
          await setDoc(doc(db, "invitados", cod), {
            nombre: nombreA,
            apellido1: apellido1A,
            apellido2: apellido2A,
            is_acompanante: true,
            subir_fotos: true,
            max_fotos_subir: 10,
            num_fotos_subidas: 0,
          });
        }
      }

      const nombreClean = nombre.trim();
      const apellido1Clean = apellido1.trim();
      const apellido2Clean = apellido2.trim();

      if (!nombreClean || !apellido1Clean) {
        alert("Nombre y primer apellido del invitado son obligatorios.");
        return;
      }

      await setDoc(doc(db, "invitados", codigoPrincipal), {
        nombre: nombreClean,
        apellido1: apellido1Clean,
        apellido2: apellido2Clean,
        ...(subirFotos ? {
          subir_fotos: true,
          max_fotos_subir: Math.max(1, maxFotos),
          num_fotos_subidas: 0,
        } : {}),
        ...(tieneAcompanantes ? {
          ...(Object.keys(acompRefs).length > 0 ? { acompanante: acompRefs } : {}),
          num_acompanante: numAcompanantes,
        } : {})
      });


      setModal(true);
    } catch (e) {
      alert("Error al guardar: " + e);
    }
  };

  const handleReset = () => {
    setNombre("");
    setApellido1("");
    setApellido2("");
    setSubirFotos(false);
    setMaxFotos(1);
    setTieneAcompanantes(false);
    setAnadirAhora(false);
    setAcompanantes([]);
    setNumAcompanantes(0);
    setModal(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow border border-stone-200 mt-20">
      <h2 className="text-xl font-bold mb-4 text-stone-700">Añadir Invitado</h2>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm text-stone-600 mb-1">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Juan"
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label className="block text-sm text-stone-600 mb-1">Primer Apellido</label>
          <input
            value={apellido1}
            onChange={(e) => setApellido1(e.target.value)}
            placeholder="Ej: García"
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label className="block text-sm text-stone-600 mb-1">Segundo Apellido</label>
          <input
            value={apellido2}
            onChange={(e) => setApellido2(e.target.value)}
            placeholder="Ej: López"
            className="input input-bordered w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={subirFotos}
            onChange={(val) => {
              setSubirFotos(val);
              if (!val) setMaxFotos(1);
            }}
            className="tw-switch"
          />
          <span className="text-stone-600">¿Puede subir fotos?</span>
        </div>

        {subirFotos && (
          <div>
            <label className="block text-sm text-stone-600 mb-1">Máximo de fotos a subir</label>
            <input
              type="number"
              min={1}
              value={maxFotos}
              onChange={(e) => setMaxFotos(+e.target.value)}
              className="input input-bordered w-full"
              placeholder="Ej: 10"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Switch
            checked={tieneAcompanantes}
            onChange={(val) => {
              setTieneAcompanantes(val);
              if (!val) {
                setAnadirAhora(false);
                setAcompanantes([]);
                setNumAcompanantes(0);
              }
            }}
            className="tw-switch"
          />
          <span className="text-stone-600">¿Tiene acompañantes?</span>
        </div>

        {tieneAcompanantes && (
          <div className="flex flex-col gap-2">
            <div>
              <label className="block text-sm text-stone-600 mb-1">Número de acompañantes</label>
              <input
                type="number"
                min={1}
                value={numAcompanantes}
                onChange={(e) => {
                  const cantidad = +e.target.value;
                  setNumAcompanantes(cantidad);
                  if (anadirAhora) {
                    setAcompanantes(
                      Array.from({ length: cantidad }, () => ({
                        nombre: "",
                        apellido1: "",
                        apellido2: "",
                      }))
                    );
                  }
                }}
                placeholder="Ej: 2"
                className="input input-bordered w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={anadirAhora}
                onChange={(val) => {
                  setAnadirAhora(val);
                  if (!val) {
                    setAcompanantes([]);
                  } else {
                    setAcompanantes(
                      Array.from({ length: numAcompanantes }, () => ({
                        nombre: "",
                        apellido1: "",
                        apellido2: "",
                      }))
                    );
                  }
                }}
                className="tw-switch"
              />
              <span className="text-stone-600">¿Añadir acompañantes ahora?</span>
            </div>

            {anadirAhora && acompanantes.map((a, i) => (
              <div key={i} className="flex flex-col gap-2 border-t border-stone-200 pt-4 mt-4">
                <p className="text-sm font-semibold text-stone-600">Acompañante {i + 1}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-stone-600 mb-1">Nombre</label>
                    <input
                      value={a?.nombre || ""}
                      onChange={(e) => handleAddAcompanante(i, "nombre", e.target.value)}
                      placeholder="Ej: Ana"
                      className="input input-bordered"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-stone-600 mb-1">Apellido 1</label>
                    <input
                      value={a?.apellido1 || ""}
                      onChange={(e) => handleAddAcompanante(i, "apellido1", e.target.value)}
                      placeholder="Ej: Ruiz"
                      className="input input-bordered"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-stone-600 mb-1">Apellido 2</label>
                    <input
                      value={a?.apellido2 || ""}
                      onChange={(e) => handleAddAcompanante(i, "apellido2", e.target.value)}
                      placeholder="Ej: Torres"
                      className="input input-bordered"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}


        <button
          onClick={handleCrear}
          className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition"
        >
          Crear invitado
        </button>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center">
            <p className="text-stone-700 mb-4">Invitado creado correctamente</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleReset}
                className="bg-stone-200 px-4 py-2 rounded-xl hover:bg-stone-300 transition"
              >
                Crear otro
              </button>
              <a
                href="/novios"
                className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition"
              >
                Volver a zona novios
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
