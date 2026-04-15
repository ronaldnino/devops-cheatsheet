# ⚡ DevOps Cheatsheet

Sitio de referencia rápida para equipos de infraestructura y DevOps. Construido con **Next.js + Tailwind CSS**, 100% estático, alojado en **GitHub Pages**. Sin base de datos — todo el contenido vive en archivos Markdown.

🌐 **Demo:** `https://<tu-usuario>.github.io/devops-cheatsheet`

## Herramientas cubiertas

| Herramienta | Categoría | Nivel |
|-------------|-----------|-------|
| 🐳 Docker | Containers | Intermediate |
| ☁️ AWS CLI | Cloud | Intermediate |
| ⚙️ Kubernetes | Orchestration | Advanced |
| 🏗️ Terraform | IaC | Intermediate |
| 🌿 Git | Tools | Beginner |
| 🐧 Linux Bash | System | Beginner |

## Stack técnico

- **Framework:** Next.js 15 (App Router, static export)
- **Estilos:** Tailwind CSS
- **Contenido:** Markdown con frontmatter YAML (gray-matter)
- **Deploy:** GitHub Pages via GitHub Actions
- **Sin base de datos** — todo en archivos `.md`

## Instalación local

```bash
git clone https://github.com/<tu-usuario>/devops-cheatsheet.git
cd devops-cheatsheet
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Agregar un nuevo cheat sheet

1. Crear archivo `content/sheets/mi-herramienta.md`
2. Agregar frontmatter YAML:

```yaml
---
title: Mi Herramienta
slug: mi-herramienta
description: Descripción breve de la herramienta.
icon: 🔧
category: tools
tags: [herramienta, devops]
level: beginner  # beginner | intermediate | advanced
---
```

3. Escribir el contenido en Markdown estándar con bloques de código
4. Hacer `git push` — el sitio se republica automáticamente

## Deploy en GitHub Pages

1. Subir el repositorio a GitHub
2. Ir a **Settings → Pages → Source → GitHub Actions**
3. Cada `git push` a `main` dispara el workflow automáticamente

## Estructura del proyecto

```
devops-cheatsheet/
├── .github/workflows/deploy.yml   # CI/CD automático
├── app/
│   ├── layout.tsx                 # Layout raíz
│   ├── page.tsx                   # Homepage (grid de cards)
│   ├── globals.css                # Estilos globales (dark theme)
│   └── sheets/[slug]/page.tsx     # Página de detalle
├── components/
│   └── CopyButtons.tsx            # Botones copy en bloques de código
├── content/sheets/                # ← Aquí vive TODO el contenido
│   ├── docker.md
│   ├── aws-cli.md
│   ├── kubernetes.md
│   ├── terraform.md
│   ├── git.md
│   └── linux-bash.md
├── lib/
│   └── sheets.ts                  # Utilidades de lectura de Markdown
└── next.config.ts                 # Configurado para static export
```
