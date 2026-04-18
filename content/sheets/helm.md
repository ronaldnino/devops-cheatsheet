---
title: Helm
slug: helm
description: Gestor de paquetes para Kubernetes — instalación, actualización, rollback y creación de charts.
icon: ⛵
category: orchestration
tags: [helm, kubernetes, k8s, packages, devops]
level: intermediate
tips:
  - type: tip
    text: Usa --dry-run antes de instalar o actualizar para ver qué recursos se crearán
  - type: warning
    text: Cuidado al usar --force en un upgrade, ya que reemplaza recursos y puede causar downtime
  - type: info
    text: Los valores pasados con --set tienen mayor prioridad que los del archivo values.yaml
  - type: success
    text: Siempre guarda tu archivo values.yaml personalizado en control de versiones
---

## Comandos esenciales

### Repositorios y búsquedas

```bash
# Basic repository management
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update                           # Update local index
helm repo list                             # List configured repos
helm search repo nginx                     # Search in local repos
helm search hub wordpress                  # Search in Artifact Hub
```

```bash
# Detailed example — adding and updating multiple repositories
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

## Instalar y gestionar releases

### Instalación básica y configuración

```bash
# Basic installation
helm install my-app bitnami/nginx          # Install with auto-generated name
helm install my-app bitnami/nginx -n prod  # Install in specific namespace
helm install my-app bitnami/nginx --create-namespace -n prod

# Configuration
helm install my-app bitnami/nginx --set replicaCount=3
helm install my-app bitnami/nginx -f values.yaml

# Release management
helm list                                  # List releases in current namespace
helm list -A                               # List releases across all namespaces
helm status my-app                         # Show status of release
helm get values my-app                     # Show user-supplied values
```

```bash
# Detailed example — production installation
helm install my-prod-db bitnami/postgresql \
  --namespace database \
  --create-namespace \
  --version 12.1.5 \
  -f custom-values.yaml \
  --set global.postgresql.auth.postgresPassword=supersecret \
  --wait \
  --timeout 10m
```

## Actualizar y rollback

### Upgrades y desinstalación

```bash
# Upgrading
helm upgrade my-app bitnami/nginx --set image.tag=1.19.2
helm upgrade my-app bitnami/nginx -f new-values.yaml

# Idempotent install/upgrade
helm upgrade --install my-app bitnami/nginx -f values.yaml

# History and Rollback
helm history my-app                        # View release history
helm rollback my-app                       # Rollback to previous version
helm rollback my-app 2                     # Rollback to specific revision

# Uninstalling
helm uninstall my-app
helm uninstall my-app --keep-history       # Remove resources but keep release record
```

```bash
# Detailed example — safe upgrade process
# 1. Preview changes
helm diff upgrade my-app bitnami/nginx -f values.yaml

# 2. Perform upgrade and wait for ready state
helm upgrade my-app bitnami/nginx \
  -f values.yaml \
  --atomic \
  --timeout 5m

# 3. If it fails, --atomic will automatically rollback
```

## Inspeccionar charts

### Dry-run y valores por defecto

```bash
# Inspecting chart contents
helm show chart bitnami/nginx              # View Chart.yaml
helm show readme bitnami/nginx             # View README
helm show values bitnami/nginx             # View default values.yaml
helm show all bitnami/nginx                # View all of the above

# Dry runs and templating
helm install my-app bitnami/nginx --dry-run
helm template my-app bitnami/nginx -f values.yaml # Render manifests locally
```

```bash
# Detailed example — extracting defaults for customization
# Save default values to a file to modify them
helm show values bitnami/nginx > my-values.yaml

# Edit my-values.yaml, then install with it
helm install my-custom-nginx bitnami/nginx -f my-values.yaml
```

## Crear charts propios

### Estructura base

```bash
# Chart creation
helm create my-chart                       # Scaffold new chart
helm lint ./my-chart                       # Validate chart structure
```

```yaml
# Detailed example — Chart.yaml and values.yaml structure
# Chart.yaml
apiVersion: v2
name: my-chart
description: A Helm chart for Kubernetes
type: application
version: 0.1.0
appVersion: "1.16.0"
dependencies:
  - name: postgresql
    version: 12.1.5
    repository: https://charts.bitnami.com/bitnami
```

### Plantillas (Templates)

```yaml
# templates/deployment.yaml (Basic)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "my-chart.fullname" . }}
```

```yaml
# Detailed example — deployment.yaml template snippet
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "my-chart.fullname" . }}
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
```

## Empaquetar y publicar

### Package & Push

```bash
# Packaging
helm package ./my-chart                    # Creates my-chart-0.1.0.tgz
helm package ./my-chart --sign --key "my-key" # Sign the package

# Publishing to registry (OCI)
helm push my-chart-0.1.0.tgz oci://ghcr.io/my-org/charts

# Publishing to HTTP repository
helm repo index ./charts/ --url https://my-org.github.io/charts
```

```bash
# Detailed example — full packaging and pushing workflow
export HELM_EXPERIMENTAL_OCI=1

# Authenticate to registry
echo $CR_PAT | helm registry login ghcr.io -u my-user --password-stdin

# Package and push
helm package ./my-chart
helm push my-chart-0.1.0.tgz oci://ghcr.io/my-org/charts

# Install from OCI
helm install my-app oci://ghcr.io/my-org/charts/my-chart --version 0.1.0
```

## Plugins útiles

### Gestión de plugins

```bash
# Plugin management
helm plugin install <url>                  # Install a plugin
helm plugin list                           # List installed plugins
helm plugin update <name>                  # Update a plugin
helm plugin uninstall <name>               # Uninstall a plugin
```

```bash
# Detailed example — essential plugins
# helm-diff: View differences before upgrade
helm plugin install https://github.com/databus23/helm-diff
helm diff upgrade my-app bitnami/nginx -f new-values.yaml

# helm-secrets: Manage secrets using Mozilla SOPS
helm plugin install https://github.com/jkroepke/helm-secrets
helm secrets upgrade my-app ./chart -f secrets.yaml
```
