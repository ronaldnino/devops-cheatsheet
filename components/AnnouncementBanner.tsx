"use client";
import { useState } from "react";
import Image from "next/image";

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      margin: "0 0 40px 0",
      borderRadius: "16px",
      border: "1px solid var(--accent-dim)",
      background: "var(--bg-card)",
    }}>

      {/* ── Grid pattern ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(var(--accent-soft) 1px, transparent 1px),
          linear-gradient(90deg, var(--accent-soft) 1px, transparent 1px)
        `,
        backgroundSize: "32px 32px",
      }} />

      {/* ── Glow blobs ── */}
      <div style={{
        position: "absolute", top: "-60px", right: "10%",
        width: "280px", height: "280px", borderRadius: "50%",
        background: "radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-40px", left: "5%",
        width: "200px", height: "200px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(9,105,218,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ── Dismiss ── */}
      <button
        onClick={() => setVisible(false)}
        aria-label="Cerrar anuncio"
        style={{
          position: "absolute", top: "14px", right: "16px",
          background: "var(--border)", border: "1px solid var(--border)",
          borderRadius: "6px", width: "28px", height: "28px",
          color: "var(--text-muted)", fontSize: "16px", lineHeight: 1,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s", zIndex: 10,
        }}
      >×</button>

      {/* ── Content ── */}
      <div style={{
        position: "relative",
        padding: "32px 40px",
        display: "flex", alignItems: "center",
        gap: "36px", flexWrap: "wrap",
      }}>

        {/* Left — logo + badge */}
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: "10px", flexShrink: 0,
        }}>
          <div style={{
            background: "var(--accent-soft)",
            border: "1px solid var(--accent-dim)",
            borderRadius: "16px", padding: "16px 20px",
          }}>
            <Image
              src="/isotipo.png"
              alt="Ronald Niño"
              width={100} height={56}
              style={{ objectFit: "contain", display: "block" }}
            />
          </div>

          {/* Pulse badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "var(--accent-soft)",
            border: "1px solid var(--accent-dim)",
            borderRadius: "99px", padding: "4px 12px",
          }}>
            <span style={{
              width: "7px", height: "7px", borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 6px var(--accent)",
              animation: "pulse-dot 2s ease-in-out infinite",
              display: "inline-block", flexShrink: 0,
            }} />
            <span style={{
              fontSize: "0.68rem", fontWeight: 700,
              color: "var(--accent)",
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              En construcción activa
            </span>
          </div>
        </div>

        {/* Right — text */}
        <div style={{ flex: 1, minWidth: "260px" }}>

          {/* Tag line */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            marginBottom: "12px",
            background: "var(--bg-card-hover)",
            border: "1px solid var(--border)",
            borderRadius: "99px", padding: "3px 12px",
          }}>
            <span style={{
              fontSize: "0.68rem", color: "var(--text-muted)",
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              🚀 Anuncio de la comunidad
            </span>
          </div>

          {/* Headline */}
          <h2 style={{
            fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
            fontWeight: 800, lineHeight: 1.2,
            marginBottom: "12px", letterSpacing: "-0.02em",
            color: "var(--text)",
          }}>
            Construyendo la referencia DevOps{" "}
            <span style={{ color: "var(--accent)" }}>
              que todos necesitamos
            </span>{" "}
            💙
          </h2>

          {/* Body */}
          <p style={{
            fontSize: "0.9rem", color: "var(--text-muted)",
            lineHeight: 1.75, marginBottom: "20px", maxWidth: "520px",
          }}>
            Este proyecto nace de mi experiencia diaria como Cloud &amp; DevOps Engineer.
            Cada cheat sheet es creado con dedicación real — comandos probados, ejemplos de producción
            y contexto que marca la diferencia. Mi compromiso: seguir expandiendo esta biblioteca
            semana a semana para que tú y toda la comunidad tengan siempre a la mano lo que necesitan.
          </p>

          {/* Tool pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
            {[
              { icon: "🐳", label: "Docker"     },
              { icon: "☁️", label: "AWS CLI"    },
              { icon: "⚙️", label: "Kubernetes" },
              { icon: "🏗️", label: "Terraform"  },
              { icon: "🤖", label: "Ansible"    },
              { icon: "⛵", label: "Helm"        },
              { icon: "➕", label: "Más próximamente..." },
            ].map((item) => {
              const isComingSoon = item.label.includes("próx");
              return (
                <span key={item.label} style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  fontSize: "0.75rem", fontWeight: isComingSoon ? 400 : 600,
                  padding: "4px 12px", borderRadius: "99px",
                  background: isComingSoon ? "transparent" : "var(--accent-soft)",
                  border: isComingSoon
                    ? "1px dashed var(--border)"
                    : "1px solid var(--accent-dim)",
                  color: isComingSoon ? "var(--text-dim)" : "var(--accent)",
                }}>
                  <span style={{ fontSize: "0.85rem" }}>{item.icon}</span>
                  {item.label}
                </span>
              );
            })}
          </div>

          {/* CTA row */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              background: "var(--bg-card-hover)",
              border: "1px solid var(--border)",
              borderRadius: "10px", padding: "10px 16px",
            }}>
              <Image
                src="/isotipo.png" alt="Ronald Niño"
                width={28} height={16}
                style={{ objectFit: "contain" }}
              />
              <div>
                <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>
                  Ronald Niño
                </p>
                <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Cloud &amp; DevOps Engineer
                </p>
              </div>
            </div>

            <p style={{
              fontSize: "0.78rem", color: "var(--text-muted)",
              fontStyle: "italic", maxWidth: "280px", lineHeight: 1.5,
            }}>
              "Hecho con esfuerzo genuino para que tu trabajo diario sea más fluido."
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
