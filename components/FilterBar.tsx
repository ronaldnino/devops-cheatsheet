"use client";
import { useState } from "react";

interface Sheet {
  title: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  level: string;
}

interface Props {
  sheets: Sheet[];
  onFilter: (filtered: Sheet[]) => void;
}

const LEVELS = ["beginner", "intermediate", "advanced"];
const LEVEL_LABELS: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

export default function FilterBar({ sheets, onFilter }: Props) {
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(sheets.flatMap((s) => s.tags))).sort();

  function applyFilters(level: string | null, tag: string | null) {
    let result = sheets;
    if (level) result = result.filter((s) => s.level === level);
    if (tag) result = result.filter((s) => s.tags.includes(tag));
    onFilter(result);
  }

  function toggleLevel(l: string) {
    const next = activeLevel === l ? null : l;
    setActiveLevel(next);
    applyFilters(next, activeTag);
  }

  function toggleTag(t: string) {
    const next = activeTag === t ? null : t;
    setActiveTag(next);
    applyFilters(activeLevel, next);
  }

  function reset() {
    setActiveLevel(null);
    setActiveTag(null);
    onFilter(sheets);
  }

  const hasFilter = activeLevel || activeTag;

  const chipStyle = (active: boolean) => ({
    padding: "4px 12px",
    borderRadius: "99px",
    border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
    background: active ? "var(--accent-soft)" : "transparent",
    color: active ? "var(--accent)" : "var(--text-muted)",
    fontSize: "0.78rem",
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
    transition: "all 0.15s",
    whiteSpace: "nowrap" as const,
  });

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
      <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: "4px" }}>
        Nivel:
      </span>
      {LEVELS.map((l) => (
        <button key={l} onClick={() => toggleLevel(l)} style={chipStyle(activeLevel === l)}>
          {LEVEL_LABELS[l]}
        </button>
      ))}

      <span style={{ width: "1px", height: "20px", background: "var(--border)", margin: "0 4px" }} />

      <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: "4px" }}>
        Tag:
      </span>
      {allTags.slice(0, 8).map((t) => (
        <button key={t} onClick={() => toggleTag(t)} style={chipStyle(activeTag === t)}>
          {t}
        </button>
      ))}

      {hasFilter && (
        <button
          onClick={reset}
          style={{ ...chipStyle(false), marginLeft: "8px", color: "var(--text-dim)", borderStyle: "dashed" }}
        >
          ✕ Limpiar
        </button>
      )}
    </div>
  );
}
