"use client";

import { useEffect, useRef, useState } from "react";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import yaml from "highlight.js/lib/languages/yaml";
import ini from "highlight.js/lib/languages/ini";
import nginx from "highlight.js/lib/languages/nginx";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("ini", ini);
hljs.registerLanguage("nginx", nginx);
hljs.registerLanguage("sh", bash);

interface Tip {
  type: "tip" | "warning" | "info" | "success";
  text: string;
}

interface Section {
  h2: string;
  h2id: string;
  subsections: {
    h3: string;
    h3id: string;
    blocks: { quick: string; detailed: string; lang: string }[];
  }[];
}

const TIP_CONFIG = {
  tip:     { icon: "💡", label: "Tip",     bg: "rgba(79,209,197,0.08)", border: "#2c7a7b",  text: "#4fd1c5" },
  warning: { icon: "⚠️", label: "Aviso",   bg: "rgba(245,158,11,0.08)", border: "#b45309",  text: "#f59e0b" },
  info:    { icon: "📌", label: "Nota",    bg: "rgba(59,130,246,0.08)", border: "#1d4ed8",  text: "#60a5fa" },
  success: { icon: "✅", label: "Buena práctica", bg: "rgba(34,197,94,0.08)", border: "#15803d", text: "#4ade80" },
};

function parseSections(html: string): Section[] {
  const sections: Section[] = [];
  const h2blocks = html.split(/<h2[^>]*id="([^"]+)"[^>]*>(.*?)<\/h2>/i);

  for (let i = 1; i < h2blocks.length; i += 3) {
    const h2id = h2blocks[i];
    const h2 = h2blocks[i + 1]?.replace(/<[^>]+>/g, "") ?? "";
    const body = h2blocks[i + 2] ?? "";

    const subsections: Section["subsections"] = [];
    const h3parts = body.split(/<h3[^>]*id="([^"]+)"[^>]*>(.*?)<\/h3>/i);

    for (let j = 1; j < h3parts.length; j += 3) {
      const h3id = h3parts[j];
      const h3 = h3parts[j + 1]?.replace(/<[^>]+>/g, "") ?? "";
      const content = h3parts[j + 2] ?? "";

      // Extract code blocks
      const codeMatches = [...content.matchAll(/<pre><code(?:\s+class="language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/gi)];
      const blocks: { quick: string; detailed: string; lang: string }[] = [];

      for (let k = 0; k < codeMatches.length; k += 2) {
        const lang = codeMatches[k]?.[1] ?? "bash";
        const quick = codeMatches[k]?.[2] ?? "";
        const detailed = codeMatches[k + 1]?.[2] ?? codeMatches[k]?.[2] ?? "";
        blocks.push({ quick, detailed, lang });
      }

      subsections.push({ h3, h3id, blocks });
    }

    sections.push({ h2, h2id, subsections });
  }
  return sections;
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!codeRef.current) return;
    const raw = code.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    const highlighted = hljs.highlight(raw, { language: lang === "nginx" ? "nginx" : lang === "yaml" ? "yaml" : lang === "ini" ? "ini" : "bash" });
    codeRef.current.innerHTML = highlighted.value;
  }, [code, lang]);

  function copy() {
    const raw = code.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    navigator.clipboard.writeText(raw).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ position: "relative" }}>
      {/* lang badge */}
      <div style={{
        position: "absolute", top: "10px", left: "14px",
        fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.08em", color: "var(--text-dim)",
        background: "var(--border)", padding: "2px 8px", borderRadius: "4px",
        zIndex: 2,
      }}>
        {lang}
      </div>
      {/* copy button */}
      <button onClick={copy} style={{
        position: "absolute", top: "8px", right: "12px",
        background: copied ? "var(--accent-dim)" : "var(--border)",
        border: "none", borderRadius: "6px",
        color: copied ? "#fff" : "var(--text-muted)",
        padding: "4px 12px", fontSize: "0.72rem", fontWeight: 600,
        cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
        transition: "all 0.15s", zIndex: 2,
      }}>
        {copied ? "✓ Copiado" : "⧉ Copiar"}
      </button>
      <pre style={{
        background: "var(--code-bg)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "42px 20px 20px",
        overflowX: "auto",
        margin: 0,
      }}>
        <code ref={codeRef} style={{
          fontFamily: '"JetBrains Mono","Fira Code","Cascadia Code",ui-monospace,monospace',
          fontSize: "0.82rem",
          lineHeight: 1.75,
        }} />
      </pre>
    </div>
  );
}

function SubsectionTabs({ sub }: { sub: Section["subsections"][0] }) {
  const [tab, setTab] = useState<"quick" | "detailed">("quick");
  if (!sub.blocks.length) return null;
  const block = sub.blocks[0];

  return (
    <div style={{ marginBottom: "28px" }}>
      {/* Tab bar */}
      <div style={{
        display: "flex", gap: 0,
        borderBottom: "1px solid var(--border)",
        marginBottom: "14px",
      }}>
        {(["quick", "detailed"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 18px",
            fontSize: "0.82rem",
            fontWeight: tab === t ? 600 : 400,
            color: tab === t ? "var(--accent)" : "var(--text-muted)",
            background: "none",
            border: "none",
            borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
            cursor: "pointer",
            transition: "all 0.15s",
            marginBottom: "-1px",
          }}>
            {t === "quick" ? "⚡ Quick Reference" : "📖 Ejemplo detallado"}
          </button>
        ))}
      </div>

      <CodeBlock
        code={tab === "quick" ? block.quick : block.detailed}
        lang={block.lang}
      />
    </div>
  );
}

export default function SheetContent({
  html,
  tips,
}: {
  html: string;
  tips?: Tip[];
}) {
  const sections = parseSections(html);

  return (
    <div>
      {/* Tips banner */}
      {tips && tips.length > 0 && (
        <div style={{ marginBottom: "28px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {tips.map((tip, i) => {
            const cfg = TIP_CONFIG[tip.type];
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "12px",
                background: cfg.bg,
                borderLeft: `3px solid ${cfg.border}`,
                borderRadius: "0 8px 8px 0",
                padding: "10px 16px",
              }}>
                <span style={{ fontSize: "1rem", flexShrink: 0 }}>{cfg.icon}</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text)" }}>{tip.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Sections */}
      {sections.map((sec) => (
        <div key={sec.h2id} style={{ marginBottom: "40px" }}>
          {/* H2 */}
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            borderLeft: "3px solid var(--accent)",
            paddingLeft: "14px",
            marginBottom: "24px",
          }}>
            <h2 id={sec.h2id} style={{
              fontSize: "1.3rem", fontWeight: 800,
              color: "var(--text)", margin: 0,
              letterSpacing: "-0.02em",
            }}>
              {sec.h2}
            </h2>
          </div>

          {/* H3 subsections */}
          {sec.subsections.map((sub) => (
            <div key={sub.h3id} style={{ marginBottom: "32px" }}>
              <h3 id={sub.h3id} style={{
                fontSize: "1rem", fontWeight: 700,
                color: "var(--text-muted)", marginBottom: "14px",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <span style={{
                  display: "inline-block", width: "6px", height: "6px",
                  borderRadius: "50%", background: "var(--accent)",
                  flexShrink: 0,
                }} />
                {sub.h3}
              </h3>
              <SubsectionTabs sub={sub} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
