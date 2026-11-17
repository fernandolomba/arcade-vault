import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="fade-in"
      style={{ textAlign: "center", padding: "120px 24px" }}
    >
      <div
        className="pixel neon-magenta"
        style={{ fontSize: 44, marginBottom: 20 }}
      >
        404
      </div>
      <div className="pixel neon-cyan" style={{ fontSize: 14, marginBottom: 16 }}>
        JUEGO NO ENCONTRADO
      </div>
      <p style={{ color: "var(--ink-dim)", marginBottom: 32 }}>
        Ese cartucho no existe en el Vault. Vuelve a la biblioteca y elige otro
        juego.
      </p>
      <Link href="/" className="btn lg">
        VOLVER AL VAULT
      </Link>
    </div>
  );
}
