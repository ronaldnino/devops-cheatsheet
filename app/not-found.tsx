import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6" style={{ background: "var(--bg)" }}>
      <span className="text-6xl mb-6">🔍</span>
      <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--text)" }}>Cheat sheet no encontrado</h1>
      <p className="mb-8" style={{ color: "var(--text-muted)" }}>
        El archivo solicitado no existe en el repositorio.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-lg font-medium transition-colors"
        style={{ background: "var(--accent)", color: "#0f1117" }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}
