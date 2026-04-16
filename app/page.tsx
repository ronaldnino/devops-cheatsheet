import Image from "next/image";
import { getAllSheets } from "@/lib/sheets";
import ThemeToggle from "@/components/ThemeToggle";
import SheetGrid from "@/components/SheetGrid";
import AnnouncementBanner from "@/components/AnnouncementBanner";

export default function HomePage() {
  const sheets = getAllSheets();
  const categories = new Set(sheets.map((s) => s.category)).size;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-card)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          maxWidth: "1100px", margin: "0 auto", padding: "0 24px",
          height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Image src="isotipo.png" alt="Ronald Niño" width={32} height={32}
              style={{ borderRadius: "6px", objectFit: "contain" }} />
            <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text)", letterSpacing: "-0.02em" }}>
              DevOps Cheatsheet
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="gh-link">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "56px 24px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "40px", flexWrap: "wrap" }}>

          {/* Text */}
          <div style={{ flex: 1, minWidth: "280px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "var(--accent-soft)", border: "1px solid var(--accent-dim)",
              borderRadius: "99px", padding: "4px 14px", marginBottom: "20px",
            }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                por Ronald Niño
              </span>
            </div>
            <h1 style={{
              fontSize: "clamp(1.9rem, 4vw, 2.8rem)", fontWeight: 800,
              color: "var(--text)", lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: "14px",
            }}>
              Referencia rápida para{" "}
              <span style={{ color: "var(--accent)" }}>DevOps</span>
            </h1>
            <p style={{ fontSize: "1rem", color: "var(--text-muted)", maxWidth: "480px", lineHeight: 1.75, marginBottom: "32px" }}>
              Comandos esenciales organizados por herramienta — Docker, Kubernetes,
              Terraform, AWS CLI y más. Sin anuncios, sin ruido.
            </p>

            {/* Stats */}
            <div style={{ display: "flex", gap: "28px", flexWrap: "wrap" }}>
              {[
                { value: sheets.length, label: "Herramientas" },
                { value: categories,    label: "Categorías"   },
                { value: "1",           label: "Anuncios"     },
                { value: "Open",        label: "Source"       },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent)", lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logo card */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: "16px",
            padding: "28px 32px",
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "20px", position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at center, rgba(79,209,197,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <Image src="isotipo.png" alt="Ronald Niño — Cloud & DevOps Engineer"
              width={160} height={90} style={{ objectFit: "contain", position: "relative" }} priority />
            <div style={{ textAlign: "center", position: "relative" }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", marginBottom: "2px" }}>Ronald Niño</p>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Cloud &amp; DevOps Engineer</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── Main content ── */}
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Announcement banner */}
        <AnnouncementBanner />

        <SheetGrid sheets={sheets} />
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 24px" }}>
        <div style={{
          maxWidth: "1100px", margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "20px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Image src="isotipo.png" alt="Ronald Niño" width={36} height={20}
              style={{ objectFit: "contain", opacity: 0.8 }} />
            <div>
              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>Ronald Niño</p>
              <p style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "2px" }}>Cloud &amp; DevOps Engineer</p>
            </div>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", textAlign: "center" }}>
            Construido con Next.js · Tailwind CSS · Alojado en GitHub Pages
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
            © {new Date().getFullYear()} Ronald Niño. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
