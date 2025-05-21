# 💍 Web de la Boda de Noelia & Juanjo

Bienvenidos al repositorio de la página oficial de nuestra boda. Este sitio web está diseñado para que nuestros invitados puedan confirmar su asistencia, gestionar sus acompañantes, compartir fotos, y mantenerse informados de todos los detalles importantes.

🔗 **Accede a la web en:**
👉 [https://bodanoeliajuanjo.es](https://bodanoeliajuanjo.es)

---

## 📸 ¿Qué encontrarás en la web?

* Confirmación de asistencia personalizada
* Gestión de acompañantes
* Información sobre la finca y el evento
* Subida de fotos el día de la boda
* Acceso mediante código único para cada invitado

---

## 🚀 Tecnologías utilizadas

* [Astro](https://astro.build/)
* [React](https://reactjs.org/) (con islands para interactividad)
* [Firebase](https://firebase.google.com/) (Hosting + Firestore + Auth)
* Tailwind CSS (usando colores personalizados)
* Deploy 100% estático (sin SSR)

---

## 🧑‍💻 Desarrollo local

```bash
# Instalar dependencias
npm install

# Ejecutar el servidor local
npm run dev

# Compilar para producción
npm run build

# Previsualizar el build
npm run preview
```

---

## 🔑 Variables de Entorno

Para configurar la conexión con Firebase, necesitarás crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
PUBLIC_FIREBASE_API_KEY=your_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
PUBLIC_FIREBASE_PROJECT_ID=your_project_id
PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
PUBLIC_FIREBASE_APP_ID=your_app_id
```

Asegúrate de reemplazar `your_...` con tus credenciales reales de Firebase. Este archivo `.env` está ignorado por Git por seguridad. Para el despliegue (por ejemplo, en Firebase Hosting), estas variables de entorno deberán configurarse en el respectivo servicio.

Puedes copiar el archivo `.env.example` (si existe) a `.env` para empezar.

---

## 🗂 Estructura de carpetas

```
├── public/
│   └── favicons/        # Iconos e imágenes como rings.png o share.png
├── src/
│   ├── components/      # Islands de React y componentes Astro
│   ├── pages/           # Páginas de la web
│   └── js/firebase.ts   # Configuración de Firebase
├── astro.config.mjs     # Configuración de Astro
├── firebase.json        # Configuración del hosting en Firebase
└── package.json
```

---

## ❤️ Licencia

Este proyecto es privado y fue desarrollado con mucho mimo para un evento único. Si quieres crear algo similar, ¡inspírate libremente!

---

Gracias por visitar
✨ [bodanoeliajuanjo.es](https://bodanoeliajuanjo.es) ✨
