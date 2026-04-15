---
title: Git
slug: git
description: Referencia completa de Git — branching, merging, rebase, stash y flujos de trabajo colaborativos.
icon: 🌿
category: tools
tags: [git, version-control, devops, collaboration]
level: beginner
---

## Configuración Inicial

```bash
# Identidad global
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Editor por defecto
git config --global core.editor vim

# Ver toda la configuración
git config --list

# Ver configuración de un repositorio
git config --local --list
```

## Repositorios

```bash
# Inicializar nuevo repositorio
git init

# Clonar repositorio remoto
git clone https://github.com/usuario/repo.git

# Clonar rama específica
git clone -b main --single-branch https://github.com/usuario/repo.git

# Ver remotos configurados
git remote -v

# Agregar remoto
git remote add origin https://github.com/usuario/repo.git
```

## Commits y Staging

```bash
# Ver estado del repositorio
git status

# Agregar archivo al staging
git add archivo.txt

# Agregar todos los cambios
git add .

# Agregar interactivamente (por hunks)
git add -p

# Commit con mensaje
git commit -m "feat: agregar función de autenticación"

# Commit y add en un paso (solo archivos rastreados)
git commit -am "fix: corregir bug en login"

# Modificar último commit (antes de push)
git commit --amend --no-edit

# Ver historial
git log --oneline --graph --decorate

# Ver cambios no staged
git diff

# Ver cambios staged
git diff --staged
```

## Branches

```bash
# Listar ramas locales
git branch

# Listar todas (incluyendo remotas)
git branch -a

# Crear rama
git branch feature/nueva-funcionalidad

# Crear y cambiar a nueva rama
git checkout -b feature/nueva-funcionalidad

# Cambiar de rama (moderno)
git switch main

# Crear y cambiar (moderno)
git switch -c feature/nueva-funcionalidad

# Eliminar rama local
git branch -d feature/completada

# Eliminar rama remota
git push origin --delete feature/completada

# Renombrar rama actual
git branch -m nuevo-nombre
```

## Merge y Rebase

```bash
# Merge de rama a main
git checkout main
git merge feature/mi-feature

# Merge sin fast-forward (mantiene historial de merge)
git merge --no-ff feature/mi-feature

# Rebase de rama sobre main
git checkout feature/mi-feature
git rebase main

# Rebase interactivo (últimos 3 commits)
git rebase -i HEAD~3

# Abortar merge/rebase con conflictos
git merge --abort
git rebase --abort

# Continuar después de resolver conflictos
git rebase --continue
```

## Stash

```bash
# Guardar cambios en stash
git stash

# Guardar con descripción
git stash push -m "trabajo en progreso: auth"

# Listar stashes
git stash list

# Aplicar último stash (mantiene en lista)
git stash apply

# Aplicar y eliminar del stash
git stash pop

# Aplicar stash específico
git stash apply stash@{2}

# Eliminar stash específico
git stash drop stash@{0}

# Limpiar todos los stashes
git stash clear
```

## Remote y Sincronización

```bash
# Descargar cambios sin merge
git fetch origin

# Pull (fetch + merge)
git pull origin main

# Pull con rebase en lugar de merge
git pull --rebase origin main

# Push rama al remoto
git push origin feature/mi-feature

# Push con tracking
git push -u origin feature/mi-feature

# Push forzado (con cuidado en ramas compartidas)
git push --force-with-lease origin feature/mi-feature
```

## Deshacer Cambios

```bash
# Descartar cambios en archivo (no staged)
git restore archivo.txt

# Quitar archivo del staging
git restore --staged archivo.txt

# Revertir commit (crea nuevo commit que deshace)
git revert HEAD

# Reset al commit anterior (mantiene cambios en staging)
git reset --soft HEAD~1

# Reset al commit anterior (mantiene cambios sin staging)
git reset HEAD~1

# Reset destructivo (¡elimina cambios!)
git reset --hard HEAD~1

# Recuperar archivo de otro commit
git checkout <commit-hash> -- archivo.txt
```

## Tags y Versiones

```bash
# Crear tag anotado
git tag -a v1.0.0 -m "Release version 1.0.0"

# Crear tag ligero
git tag v1.0.0

# Listar tags
git tag -l "v1.*"

# Push de tags al remoto
git push origin --tags

# Eliminar tag local
git tag -d v1.0.0

# Eliminar tag remoto
git push origin --delete v1.0.0
```

## Cherry-pick y Búsqueda

```bash
# Aplicar commit específico a rama actual
git cherry-pick <commit-hash>

# Cherry-pick rango de commits
git cherry-pick A..B

# Buscar texto en historial
git log --all --grep="bug fix"

# Buscar quién modificó una línea (blame)
git blame archivo.txt

# Buscar commit que introdujo un bug (bisect)
git bisect start
git bisect bad HEAD
git bisect good v1.0.0
```
