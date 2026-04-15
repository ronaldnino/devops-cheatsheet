"use client";
import Link from "next/link";
import type { SheetMeta } from "@/lib/types";

export default function RelatedSheets({ sheets }: { sheets: SheetMeta[] }) {
  if (!sheets.length) return null;

  return (
    <div style={{ marginTop: "32px" }}>
      <h2 style={{
        fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.1em", color: "var(--text-dim)", marginBottom: "14px",
      }}>
        También te puede interesar
      </h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "12px",
      }}>
        {sheets.map((s) => (
          <Link
            key={s.slug}
            href={`/sheets/${s.slug}`}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "14px 16px",
              transition: "border-color 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            <span style={{ fontSize: "1.6rem" }}>{s.icon}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)" }}>{s.title}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>{s.category}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
