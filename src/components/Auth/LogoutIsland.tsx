export default function LogoutButton() {
    const handleLogout = () => {
      localStorage.removeItem("invitado");
      window.location.href = "/";
    };
  
    return (
      <button
        onClick={handleLogout}
        className="text-sm text-red-600 hover:underline"
      >
        Cerrar sesión
      </button>
    );
  }
  