import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Seo } from "@/seo/Seo";
import { authService } from "@/services/authService";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.login(email, password);
      navigate("/admin");
    } catch {
      setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Seo
        title="Admin | Depredador Plus"
        description="Panel de administración"
        noindex
      />
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-xl border border-black/5 bg-white p-8 shadow-sm"
        >
          <h1 className="font-display text-2xl font-bold text-verde">
            Administración
          </h1>
          <p className="mt-1 text-sm text-gris">
            Ingresa tus credenciales para continuar.
          </p>

          {error && (
            <p className="mt-4 rounded-lg bg-rojo/10 px-3 py-2 text-sm text-rojo">
              {error}
            </p>
          )}

          <label className="mt-6 block">
            <span className="text-sm font-medium text-carbon">Correo</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none transition focus:border-verde focus:ring-1 focus:ring-verde"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-carbon">Contraseña</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none transition focus:border-verde focus:ring-1 focus:ring-verde"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-verde py-2.5 font-medium text-white transition hover:bg-verde-oscuro disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </>
  );
}

export default LoginPage;
