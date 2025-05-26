import { useEffect, useState } from "react";
import { db } from "@js/firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { navigate } from "astro:transitions/client";

export default function FotosUploadIsland() {
  const [usuario, setUsuario] = useState<any>(null);
  const [permitidas, setPermitidas] = useState(0);
  const [subidas, setSubidas] = useState(0);
  const [fotos, setFotos] = useState<File[]>([]);
  const [estado, setEstado] = useState<"inicio" | "subiendo" | "completado">("inicio");
  const [progreso, setProgreso] = useState(0);
  const [errores, setErrores] = useState<string[]>([]);
  const storage = getStorage();

  useEffect(() => {
    const datos = localStorage.getItem("invitado");
    if (!datos) {
      navigate("/login");
      return;
    }

    const data = JSON.parse(datos);
    if (!data.code) {
      console.error("❌ El invitado no tiene campo 'code'");
      return;
    }

    setUsuario(data);
    setPermitidas(data.max_fotos_subir || 0);
    setSubidas(data.num_fotos_subidas || 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const nuevas = Array.from(e.target.files);
    const restantes = permitidas - subidas;
    const seleccionadas = nuevas.slice(0, restantes);
    setFotos(seleccionadas);
    setErrores([]);
    setEstado("inicio");
    setProgreso(0);
  };

  const subirFotos = async () => {
    if (!usuario || fotos.length === 0) return;
    setEstado("subiendo");
    const nuevasURLs: string[] = [];

    for (let i = 0; i < fotos.length; i++) {
      const foto = fotos[i];
      const path = `fotos/${usuario.code}/${Date.now()}_${foto.name}`;
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, foto);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progresoActual = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setProgreso(progresoActual);
          },
          (error) => {
            console.error("❌ Error al subir imagen:", error);
            reject(error);
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            nuevasURLs.push(url);
            resolve();
          }
        );
      });
    }

    const nuevas = subidas + nuevasURLs.length;

    await updateDoc(doc(db, "invitados", usuario.code), {
      num_fotos_subidas: nuevas,
    });

    const actualizado = { ...usuario, num_fotos_subidas: nuevas };
    localStorage.setItem("invitado", JSON.stringify(actualizado));
    setUsuario(actualizado);
    setSubidas(nuevas);
    setFotos([]);
    setEstado("completado");
    setProgreso(0);
  };

  if (!usuario) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <h2 className="text-3xl font-bold text-stone-800 mb-4">📸 Sube tus fotos favoritas</h2>
        <p className="text-stone-500">Cargando invitado...</p>
      </div>
    );
  }

  const restantes = permitidas - subidas;

  return (
    <section className="bg-neutral-50 pt-32 pb-20 px-4 min-h-screen">
      <div className="site-container max-w-xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-stone-800 mb-2">📸 Sube tus fotos favoritas</h2>
        <p className="text-stone-600 mb-6">
          Puedes subir <strong>{restantes}</strong> foto{restantes !== 1 && "s"} más.
        </p>

        {estado === "completado" ? (
          <div className="space-y-6 text-center mt-10">
            <div className="bg-green-100 text-green-800 p-4 rounded-xl shadow text-lg font-medium">
              ¡Fotos subidas correctamente! 🎉
            </div>
          
            {restantes - fotos.length > 0 && (
              <button
                onClick={() => setEstado("inicio")}
                className="text-sm text-primary-500 hover:underline"
              >
                + Subir más fotos
              </button>
            )}
          
            <a
              href="/privado"
              className="text-sm text-primary-500 hover:underline block"
            >
              ← Volver a la zona privada
            </a>
          </div>        
        ) : (
          <>
            {restantes > 0 ? (
              <>
                <label className="block cursor-pointer mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-stone-300 p-6 rounded-xl hover:bg-stone-100 transition">
                    Arrastra tus fotos o haz clic aquí para seleccionarlas
                  </div>
                </label>

                {fotos.length > 0 && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
                      {fotos.map((foto, i) => (
                        <div key={i} className="relative">
                          <img
                            src={URL.createObjectURL(foto)}
                            alt="preview"
                            className="rounded-xl shadow"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={subirFotos}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl font-semibold transition"
                    >
                      Subir {fotos.length} foto{fotos.length > 1 && "s"}
                    </button>

                    {estado === "subiendo" && (
                      <div className="mt-4">
                        <p className="text-sm text-stone-500 mb-1">Subiendo...</p>
                        <div className="h-2 w-full bg-stone-200 rounded">
                          <div
                            className="h-2 bg-primary-500 rounded transition-all"
                            style={{ width: `${progreso}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <p className="text-stone-500">Ya has subido el número máximo de fotos permitidas. 🙌</p>
            )}
          </>
        )}

        {errores.length > 0 && (
          <div className="mt-4 text-red-600 text-sm space-y-1">
            {errores.map((e, i) => (
              <p key={i}>❌ {e}</p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
