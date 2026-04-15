---
title: Helm
slug: helm
description: Gestor de paquetes para Kubernetes — instalación, actualización, rollback y creación de charts.
icon: ⛵
category: orchestration
tags: [helm, kubernetes, k8s, packages, devops]
level: intermediate
---

## Comandos esenciales

```bash
# Agregar repositorio
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add stable https://charts.helm.sh/stable

# Actualizar repositorios
helm repo update

# Listar repositorios
helm repo list

# Buscar chart en repositorios
helm search repo nginx

# Buscar en Artifact Hub
helm search hub wordpress
```

## Instalar y gestionar releases

```bash
# Instalar chart con nombre de release
helm install mi-nginx bitnami/nginx

# Instalar en namespace específico (crea namespace si no existe)
helm install mi-app bitnami/nginx \
  --namespace produccion \
  --create-namespace

# Instalar con valores personalizados
helm install mi-app bitnami/nginx \
  --set replicaCount=3 \
  --set service.type=ClusterIP

# Instalar con archivo de valores
helm install mi-app bitnami/nginx \
  -f valores-prod.yaml

# Instalar versión específica del chart
helm install mi-app bitnami/nginx --version 13.2.0

# Ver releases instalados
helm list
helm list -A           # todos los namespaces
helm list -n produccion

# Ver estado de un release
helm status mi-app
helm status mi-app -n produccion

# Ver valores actuales de un release
helm get values mi-app
helm get values mi-app --all
```

## Actualizar y rollback

```bash
# Actualizar release con nuevos valores
helm upgrade mi-app bitnami/nginx \
  --set replicaCount=5

# Upgrade con archivo de valores
helm upgrade mi-app bitnami/nginx -f valores-prod.yaml

# Instalar si no existe, actualizar si existe
helm upgrade --install mi-app bitnami/nginx \
  -f valores-prod.yaml \
  --namespace produccion \
  --create-namespace

# Ver historial de revisiones
helm history mi-app

# Rollback a revisión anterior
helm rollback mi-app

# Rollback a revisión específica
helm rollback mi-app 2

# Desinstalar release
helm uninstall mi-app
helm uninstall mi-app --keep-history  # mantiene historial
```

## Inspeccionar charts

```bash
# Ver información del chart
helm show chart bitnami/nginx
helm show readme bitnami/nginx

# Ver valores por defecto del chart
helm show values bitnami/nginx

# Ver todos los manifests que se generarán (dry-run)
helm install mi-app bitnami/nginx --dry-run

# Renderizar templates localmente (sin instalar)
helm template mi-app bitnami/nginx -f valores.yaml

# Verificar chart (lint)
helm lint ./mi-chart/
```

## Crear charts propios

```bash
# Crear estructura de chart
helm create mi-chart

# Estructura generada:
# mi-chart/
#   Chart.yaml          → metadatos del chart
#   values.yaml         → valores por defecto
#   charts/             → dependencias
#   templates/
#     deployment.yaml
#     service.yaml
#     ingress.yaml
#     _helpers.tpl       → funciones reutilizables
#     NOTES.txt          → mensaje post-instalación
```

```yaml
# Chart.yaml
apiVersion: v2
name: mi-chart
description: Mi aplicación en Kubernetes
type: application
version: 0.1.0        # versión del chart
appVersion: "1.0.0"   # versión de la app

dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
```

```yaml
# values.yaml
replicaCount: 1

image:
  repository: mi-imagen
  tag: "latest"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: false
  host: mi-app.ejemplo.com

resources:
  limits:
    cpu: 500m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi

postgresql:
  enabled: true
  auth:
    database: miapp
```

```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "mi-chart.fullname" . }}
  labels:
    {{- include "mi-chart.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "mi-chart.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "mi-chart.selectorLabels" . | nindent 8 }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - containerPort: {{ .Values.service.port }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          env:
            - name: DB_HOST
              value: {{ include "mi-chart.fullname" . }}-postgresql
```

## Empaquetar y publicar

```bash
# Empaquetar chart como .tgz
helm package mi-chart/

# Con firma GPG
helm package mi-chart/ --sign --key 'mi-clave'

# Publicar en GitHub Pages (OCI)
helm push mi-chart-0.1.0.tgz oci://ghcr.io/usuario/charts

# Generar índice para repositorio HTTP
helm repo index ./charts/ --url https://usuario.github.io/charts

# Instalar desde OCI registry
helm install mi-app oci://ghcr.io/usuario/charts/mi-chart --version 0.1.0
```

## Plugins útiles

```bash
# Instalar plugin
helm plugin install https://github.com/databus23/helm-diff

# Ver diferencias antes de upgrade
helm diff upgrade mi-app bitnami/nginx -f valores.yaml

# Plugin para secretos con SOPS
helm plugin install https://github.com/jkroepke/helm-secrets

# Listar plugins instalados
helm plugin list
```
