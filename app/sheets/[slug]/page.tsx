import Image from "next/image";
import Link from "next/link";
import { getSheetBySlug, getAllSlugs, getAllSheets, LEVEL_COLORS } from "@/lib/sheets";
import { notFound } from "next/navigation";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import ThemeToggle from "@/components/ThemeToggle";
import RelatedSheets from "@/components/RelatedSheets";
import SheetContent from "@/components/SheetContent";

interface Props { params: Promise<{ slug: string }>; }

async function markdownToHtml(md: string) {
  const r = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(md);
  return r.toString();
}

function addIds(html: string) {
  return html.replace(/<h([23])>(.*?)<\/h[23]>/gi, (_, lvl, content) => {
    const text = content.replace(/<[^>]+>/g, "");
    const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    return `<h${lvl} id="${id}">${content}</h${lvl}>`;
  });
}

function extractHeadings(html: string) {
  const out: { id: string; text: string; level: number }[] = [];
  const re = /<h([23])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h[23]>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push({ level: parseInt(m[1]), id: m[2], text: m[3].replace(/<[^>]+>/g, "") });
  }
  return out;
}

function countCommands(content: string) {
  const blocks = content.match(/```[\s\S]*?```/g) ?? [];
  return blocks.reduce((sum, b) => {
    const lines = b.split("\n").filter((l) => l.trim() && !l.startsWith("```") && !l.trim().startsWith("#"));
    return sum + lines.length;
  }, 0);
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function SheetPage({ params }: Props) {
  const { slug } = await params;
  const sheet = getSheetBySlug(slug);
  if (!sheet) notFound();

  const allSheets = getAllSheets();
  const related = allSheets
    .filter((s) => s.slug !== slug && (s.category === sheet.category || s.tags.some((t) => sheet.tags.includes(t))))
    .slice(0, 3);

  const rawHtml = await markdownToHtml(sheet.content);
  const html = addIds(rawHtml);
  const headings = extractHeadings(html);
  const commandCount = countCommands(sheet.content);

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
          maxWidth: "1280px", margin: "0 auto", padding: "0 24px",
          height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Image
              src="/isotipo.png"
              alt="Ronald Niño"
              width={28}
              height={28}
              style={{ borderRadius: "6px", objectFit: "contain" }}
            />
            <span style={{ fontWeight: 800, color: "var(--text)", fontSize: "0.95rem" }}>
              DevOps Cheatsheet
            </span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link href="/" className="back-link">← Todas</Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div style={{
        maxWidth: "1280px", margin: "0 auto",
        padding: "32px 24px 80px",
        display: "flex", gap: "28px",
      }}>

        {/* ── Sidebar ToC ── */}
        <aside style={{ width: "240px", flexShrink: 0, display: "none" }} className="lg-sidebar">
          <div style={{
            position: "sticky", top: "72px",
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "12px", padding: "18px",
            maxHeight: "calc(100vh - 90px)", overflowY: "auto",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              marginBottom: "16px", paddingBottom: "12px",
              borderBottom: "1px solid var(--border)",
            }}>
              <span style={{ color: "var(--accent)", fontSize: "14px" }}>☰</span>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>
                Table of Contents
              </span>
            </div>
            <nav style={{ display: "flex", flexDirection: "column" }}>
              {headings.map((h) => (
                <a key={h.id} href={`#${h.id}`} style={{
                  display: "flex", alignItems: "flex-start", gap: "8px",
                  padding: h.level === 2 ? "6px 0" : "4px 0 4px 8px",
                  fontSize: h.level === 2 ? "0.82rem" : "0.77rem",
                  color: h.level === 2 ? "var(--text)" : "var(--text-muted)",
                  fontWeight: h.level === 2 ? 600 : 400,
                  lineHeight: 1.4, textDecoration: "none",
                  borderLeft: h.level === 3 ? "1px solid var(--border)" : "none",
                }}>
                  {h.level === 3 && (
                    <span style={{
                      flexShrink: 0, width: "5px", height: "5px",
                      borderRadius: "50%", background: "var(--text-dim)", marginTop: "5px",
                    }} />
                  )}
                  {h.text}
                </a>
              ))}
            </nav>

            {/* Brand en sidebar */}
            <div style={{
              marginTop: "24px", paddingTop: "16px",
              borderTop: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <Image
                src="/isotipo.png"
                alt="Ronald Niño"
                width={24}
                height={14}
                style={{ objectFit: "contain", opacity: 0.7 }}
              />
              <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                por Ronald Niño
              </span>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={{ flex: 1, minWidth: 0 }}>

          {/* Breadcrumb */}
          <div style={{
            fontSize: "0.78rem", color: "var(--text-dim)",
            marginBottom: "20px",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            <Link href="/" style={{ color: "var(--text-muted)" }}>Home</Link>
            <span>›</span>
            <span style={{ color: "var(--text-muted)" }}>DevOps</span>
            <span>›</span>
            <span style={{ color: "var(--text)", fontWeight: 600 }}>{sheet.title}</span>
          </div>

          {/* Sheet header */}
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "12px", padding: "24px", marginBottom: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "3.2rem", lineHeight: 1 }}>{sheet.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
                  <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
                    {sheet.title}
                  </h1>
                  <span className={LEVEL_COLORS[sheet.level]} style={{
                    fontSize: "0.72rem", fontWeight: 600,
                    padding: "2px 10px", borderRadius: "99px",
                  }}>
                    {sheet.level}
                  </span>
                </div>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "12px", lineHeight: 1.6 }}>
                  {sheet.description}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                  {sheet.tags.map((tag) => (
                    <span key={tag} style={{
                      fontSize: "0.72rem", padding: "2px 10px", borderRadius: "99px",
                      background: "var(--tag-bg)", color: "var(--accent)",
                    }}>{tag}</span>
                  ))}
                  <span style={{
                    marginLeft: "auto", fontSize: "0.72rem", color: "var(--text-dim)",
                    padding: "2px 10px", border: "1px solid var(--border)", borderRadius: "99px",
                  }}>
                    ~{commandCount} comandos
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sheet content */}
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "12px", padding: "28px",
          }}>
            <SheetContent html={html} tips={sheet.tips} />
          </div>

          <RelatedSheets sheets={related} />

          <div style={{ marginTop: "28px" }}>
            <Link href="/" style={{ fontSize: "0.85rem", color: "var(--accent)" }}>
              ← Ver todas las herramientas
            </Link>
          </div>
        </main>
      </div>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px" }}>
        <div style={{
          maxWidth: "1280px", margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Image
              src="/isotipo.png"
              alt="Ronald Niño"
              width={32}
              height={18}
              style={{ objectFit: "contain", opacity: 0.8 }}
            />
            <div>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>Ronald Niño</p>
              <p style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: "2px" }}>Cloud &amp; DevOps Engineer</p>
            </div>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
            © {new Date().getFullYear()} Ronald Niño · Construido con Next.js · GitHub Pages
          </p>
        </div>
      </footer>
    </div>
  );
}
