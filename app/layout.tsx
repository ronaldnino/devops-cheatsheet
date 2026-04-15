import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevOps Cheatsheet",
  description: "Referencia rápida de comandos DevOps — Docker, AWS CLI, Kubernetes, Terraform, Git, Linux y más.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="dark">
      <head>
        {/* Evitar flash de tema incorrecto */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var t = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', t);
          })()
        `}} />
      </head>
      <body style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
