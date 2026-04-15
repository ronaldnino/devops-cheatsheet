---
title: Kubernetes
slug: kubernetes
description: Comandos kubectl para gestión de pods, deployments, servicios, namespaces y troubleshooting.
icon: ⚙️
category: orchestration
tags: [kubernetes, kubectl, k8s, containers, devops]
level: advanced
---

## Contextos y Configuración

```bash
# Ver contextos disponibles
kubectl config get-contexts

# Cambiar de contexto
kubectl config use-context mi-cluster-prod

# Ver contexto actual
kubectl config current-context

# Ver configuración completa
kubectl config view

# Configurar namespace por defecto en contexto
kubectl config set-context --current --namespace=mi-namespace
```

## Pods

```bash
# Listar pods en namespace actual
kubectl get pods

# Listar en todos los namespaces
kubectl get pods -A

# Con información ampliada (nodo, IP)
kubectl get pods -o wide

# Ver logs de un pod
kubectl logs mi-pod

# Seguir logs en tiempo real
kubectl logs -f mi-pod

# Logs de contenedor específico (multi-container)
kubectl logs mi-pod -c mi-contenedor

# Ejecutar shell en pod
kubectl exec -it mi-pod -- /bin/bash

# Ejecutar comando puntual
kubectl exec mi-pod -- env | grep DB

# Describir pod (eventos incluidos)
kubectl describe pod mi-pod

# Eliminar pod
kubectl delete pod mi-pod

# Eliminar y recrear (útil para forzar redeploy)
kubectl delete pod mi-pod --force --grace-period=0
```

## Deployments

```bash
# Listar deployments
kubectl get deployments

# Describir deployment
kubectl describe deployment mi-app

# Escalar deployment
kubectl scale deployment mi-app --replicas=5

# Ver historial de rollouts
kubectl rollout history deployment/mi-app

# Ver estado del rollout
kubectl rollout status deployment/mi-app

# Hacer rollback al anterior
kubectl rollout undo deployment/mi-app

# Rollback a revisión específica
kubectl rollout undo deployment/mi-app --to-revision=2

# Actualizar imagen del deployment
kubectl set image deployment/mi-app \
  contenedor=mi-imagen:v2.0

# Reiniciar todos los pods del deployment
kubectl rollout restart deployment/mi-app
```

## Services e Ingress

```bash
# Listar servicios
kubectl get services

# Exponer deployment como servicio
kubectl expose deployment mi-app \
  --port=80 --target-port=8080 \
  --type=ClusterIP

# Port-forward para acceso local
kubectl port-forward service/mi-app 8080:80

# Port-forward a pod específico
kubectl port-forward pod/mi-pod 8080:8080

# Listar ingress
kubectl get ingress -A
```

## Namespaces

```bash
# Listar namespaces
kubectl get namespaces

# Crear namespace
kubectl create namespace staging

# Ejecutar comando en namespace específico
kubectl get pods -n kube-system

# Eliminar namespace (¡elimina todo lo que contiene!)
kubectl delete namespace staging
```

## ConfigMaps y Secrets

```bash
# Listar ConfigMaps
kubectl get configmaps

# Crear ConfigMap desde archivo
kubectl create configmap app-config \
  --from-file=config.properties

# Crear ConfigMap desde valores literales
kubectl create configmap app-config \
  --from-literal=DB_HOST=localhost \
  --from-literal=DB_PORT=5432

# Ver contenido de ConfigMap
kubectl get configmap app-config -o yaml

# Listar Secrets
kubectl get secrets

# Crear Secret
kubectl create secret generic db-creds \
  --from-literal=username=admin \
  --from-literal=password=supersecret

# Decodificar valor de Secret
kubectl get secret db-creds -o jsonpath='{.data.password}' | base64 -d
```

## Nodes

```bash
# Listar nodos con estado
kubectl get nodes -o wide

# Describir nodo
kubectl describe node mi-nodo

# Ver uso de recursos por nodo
kubectl top nodes

# Ver uso de recursos por pod
kubectl top pods

# Marcar nodo como no schedulable
kubectl cordon mi-nodo

# Drenar nodo (para mantenimiento)
kubectl drain mi-nodo \
  --ignore-daemonsets \
  --delete-emptydir-data

# Volver a marcar como schedulable
kubectl uncordon mi-nodo
```

## Manifests y Apply

```bash
# Aplicar manifest YAML
kubectl apply -f deployment.yaml

# Aplicar directorio completo
kubectl apply -f ./manifests/

# Ver diferencias antes de aplicar (dry-run)
kubectl apply -f deployment.yaml --dry-run=client

# Eliminar recursos de manifest
kubectl delete -f deployment.yaml

# Generar YAML de un recurso existente
kubectl get deployment mi-app -o yaml > backup.yaml

# Editar recurso directamente
kubectl edit deployment mi-app
```

## Troubleshooting

```bash
# Ver eventos del cluster (ordenados por tiempo)
kubectl get events --sort-by='.lastTimestamp'

# Ver eventos de un namespace
kubectl get events -n mi-namespace

# Copiar archivo desde/hacia pod
kubectl cp mi-pod:/app/logs/error.log ./error.log
kubectl cp ./config.yaml mi-pod:/app/config.yaml

# Ver recursos con labels
kubectl get pods -l app=mi-app,env=production

# Obtener output en JSON para scripting
kubectl get pods -o json | jq '.items[].metadata.name'

# Ver todos los recursos en un namespace
kubectl get all -n mi-namespace
```
