"use client";
import { useState } from "react";
import Link from "next/link";
import SearchBar from "./SearchBar";
import FilterBar from "./FilterBar";
import { CATEGORY_LABELS, LEVEL_COLORS } from "@/lib/types";

interface Sheet {
  title: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  level: string;
}

export default function SheetGrid({ sheets }: { sheets: Sheet[] }) {
  const [filtered, setFiltered] = useState<Sheet[]>(sheets);

  const grouped = filtered.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, Sheet[]>);

  return (
    <>
      {/* Search */}
      <div style={{ marginBottom: "20px" }}>
        <SearchBar sheets={sheets} />
      </div>

      {/* Filters */}
      <FilterBar sheets={sheets} onFilter={setFiltered} />

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🔍</div>
          <p style={{ fontWeight: 600, marginBottom: "6px", color: "var(--text)" }}>Sin resultados</p>
          <p style={{ fontSize: "0.875rem" }}>Intente con otros filtros</p>
        </div>
      )}

      {/* Grid by category */}
      {Object.entries(grouped).map(([category, catSheets]) => (
        <section key={category} style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <h3 style={{
              fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.1em", color: "var(--text-dim)",
            }}>
              {CATEGORY_LABELS[category] ?? category}
            </h3>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
              {catSheets.length} {catSheets.length === 1 ? "sheet" : "sheets"}
            </span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "14px",
          }}>
            {catSheets.map((sheet, i) => (
              <Link
                key={sheet.slug}
                href={`/sheets/${sheet.slug}`}
                className="animate-in"
                style={{
                  display: "block",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "20px",
                  transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
                  animationDelay: `${i * 40}ms`,
                  textDecoration: "none",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.3)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <span style={{ fontSize: "2rem" }}>{sheet.icon}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_COLORS[sheet.level]}`}
                    style={{ fontSize: "0.7rem" }}>
                    {sheet.level}
                  </span>
                </div>

                {/* Title & desc */}
                <h4 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)", marginBottom: "6px" }}>
                  {sheet.title}
                </h4>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "14px" }}>
                  {sheet.description}
                </p>

                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {sheet.tags.slice(0, 4).map((tag) => (
                    <span key={tag} style={{
                      fontSize: "0.7rem", padding: "2px 8px", borderRadius: "99px",
                      background: "var(--tag-bg)", color: "var(--accent)",
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
