"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    const initial = saved ?? "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Cambiar tema"
      title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        padding: "6px 10px",
        cursor: "pointer",
        color: "var(--text-muted)",
        fontSize: "1rem",
        lineHeight: 1,
        transition: "all 0.15s",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <span>{theme === "dark" ? "☀️" : "🌙"}</span>
      <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>
        {theme === "dark" ? "Claro" : "Oscuro"}
      </span>
    </button>
  );
}
