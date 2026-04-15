"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

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
}

export default function SearchBar({ sheets }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = query.trim().length < 1 ? [] : sheets.filter((s) => {
    const q = query.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q)) ||
      s.category.toLowerCase().includes(q)
    );
  });

  // keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // click outside closes
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function navigate(slug: string) {
    router.push(`/sheets/${slug}`);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={ref} style={{ position: "relative", width: "100%", maxWidth: "420px" }}>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
          color: "var(--text-dim)", fontSize: "14px", pointerEvents: "none",
        }}>🔍</span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar herramienta, comando, tag... (⌘K)"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          style={{
            width: "100%",
            background: "var(--bg-input)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "9px 36px 9px 36px",
            color: "var(--text)",
            fontSize: "0.875rem",
            outline: "none",
            transition: "border-color 0.15s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--border-focus)")}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setOpen(false); }}
            style={{
              position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-dim)", fontSize: "16px", lineHeight: 1,
            }}
          >×</button>
        )}
      </div>

      {/* Dropdown */}
      {open && query.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 100,
          maxHeight: "340px", overflowY: "auto",
        }}>
          {results.length === 0 ? (
            <div style={{ padding: "16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Sin resultados para &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((s) => (
              <button
                key={s.slug}
                onClick={() => navigate(s.slug)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 14px", background: "none", border: "none",
                  borderBottom: "1px solid var(--border)", cursor: "pointer",
                  textAlign: "left", transition: "background 0.1s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "var(--accent-soft)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "none")}
              >
                <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{s.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)" }}>{s.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.description}
                  </div>
                </div>
                <span style={{
                  marginLeft: "auto", fontSize: "0.7rem", color: "var(--accent)",
                  background: "var(--tag-bg)", padding: "2px 8px", borderRadius: "99px", flexShrink: 0,
                }}>{s.category}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
