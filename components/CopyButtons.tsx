"use client";

import { useEffect } from "react";

export default function CopyButtons() {
  useEffect(() => {
    const blocks = document.querySelectorAll(".prose-devops pre");

    blocks.forEach((pre) => {
      if (pre.querySelector(".copy-btn")) return;

      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.textContent = "Copiar";
      btn.style.cssText = `
        position: absolute;
        top: 0.75rem;
        right: 0.75rem;
        background: #2d3748;
        color: #718096;
        border: none;
        border-radius: 0.375rem;
        padding: 0.25rem 0.6rem;
        font-size: 0.7rem;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s;
        z-index: 10;
      `;

      btn.addEventListener("mouseenter", () => {
        btn.style.background = "#2c7a7b";
        btn.style.color = "white";
      });
      btn.addEventListener("mouseleave", () => {
        if (btn.textContent !== "✓ Copiado") {
          btn.style.background = "#2d3748";
          btn.style.color = "#718096";
        }
      });

      btn.addEventListener("click", () => {
        const code = pre.querySelector("code");
        if (!code) return;
        navigator.clipboard.writeText(code.innerText).then(() => {
          btn.textContent = "✓ Copiado";
          btn.style.background = "#2c7a7b";
          btn.style.color = "white";
          setTimeout(() => {
            btn.textContent = "Copiar";
            btn.style.background = "#2d3748";
            btn.style.color = "#718096";
          }, 2000);
        });
      });

      (pre as HTMLElement).style.position = "relative";
      pre.appendChild(btn);
    });
  }, []);

  return null;
}
