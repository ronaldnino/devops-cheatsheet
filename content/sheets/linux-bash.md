---
title: Linux Bash
slug: linux-bash
description: Comandos esenciales de Linux y Bash scripting — archivos, procesos, redes, permisos y automatización.
icon: 🐧
category: system
tags: [linux, bash, shell, cli, devops]
level: beginner
---

## Navegación y Archivos

```bash
# Listar con detalles y tamaños legibles
ls -lah

# Listar solo directorios
ls -d */

# Cambiar directorio
cd /ruta/al/directorio
cd ~          # home
cd -          # directorio anterior

# Ver directorio actual
pwd

# Crear directorio (con padres)
mkdir -p /ruta/nueva/directorio

# Crear archivo vacío / actualizar timestamp
touch archivo.txt

# Copiar archivo
cp origen.txt destino.txt

# Copiar directorio recursivamente
cp -r directorio/ destino/

# Mover o renombrar
mv archivo.txt nueva-ruta/archivo.txt

# Eliminar archivo
rm archivo.txt

# Eliminar directorio recursivo (¡cuidado!)
rm -rf directorio/

# Ver tamaño de directorio
du -sh /ruta/directorio

# Ver espacio en disco
df -h
```

## Visualizar Contenido

```bash
# Ver archivo completo
cat archivo.txt

# Ver con numeración de líneas
cat -n archivo.txt

# Ver primeras 20 líneas
head -n 20 archivo.txt

# Ver últimas 50 líneas
tail -n 50 archivo.txt

# Seguir archivo en tiempo real (logs)
tail -f /var/log/app.log

# Ver archivo paginado
less archivo.txt

# Contar líneas, palabras, caracteres
wc -l archivo.txt
```

## Búsqueda

```bash
# Buscar archivos por nombre
find /ruta -name "*.log"

# Buscar archivos modificados en últimas 24h
find /var/log -mtime -1 -type f

# Buscar archivos mayores a 100MB
find / -size +100M -type f

# Buscar texto en archivos
grep -r "ERROR" /var/log/

# Buscar ignorando mayúsculas
grep -i "error" archivo.log

# Mostrar líneas con contexto (3 antes y 3 después)
grep -C 3 "CRITICAL" app.log

# Buscar y contar ocurrencias
grep -c "404" access.log

# Buscar con regex extendida
grep -E "ERROR|WARN|CRITICAL" app.log
```

## Procesos

```bash
# Ver procesos activos
ps aux

# Buscar proceso específico
ps aux | grep nginx

# Ver árbol de procesos
pstree

# Monitor interactivo de procesos
top
htop    # versión mejorada

# Ver uso de memoria
free -h

# Terminar proceso por PID
kill <PID>

# Forzar terminación
kill -9 <PID>

# Terminar por nombre
pkill nginx

# Ejecutar proceso en background
comando &

# Ver jobs en background
jobs

# Traer job a foreground
fg %1

# Ejecutar comando que sobrevive al logout
nohup comando &
```

## Permisos

```bash
# Ver permisos
ls -la

# Cambiar permisos (octal)
chmod 755 script.sh
chmod 644 archivo.txt

# Cambiar permisos (simbólico)
chmod +x script.sh          # agregar ejecución
chmod u+w,g-w archivo.txt  # propietario +write, grupo -write
chmod -R 750 directorio/    # recursivo

# Cambiar propietario
chown usuario:grupo archivo.txt
chown -R www-data:www-data /var/www/

# Tabla de permisos octal
# 7 = rwx | 6 = rw- | 5 = r-x | 4 = r-- | 0 = ---
```

## Redirección y Pipes

```bash
# Redirigir stdout a archivo (sobrescribe)
comando > output.txt

# Append a archivo existente
comando >> output.txt

# Redirigir stderr
comando 2> errores.txt

# Redirigir stdout y stderr
comando > output.txt 2>&1

# Descartar output
comando > /dev/null 2>&1

# Pipe: pasar output de un comando a otro
cat access.log | grep "404" | wc -l

# tee: escribir a archivo Y mostrar en pantalla
comando | tee output.txt
```

## Bash Scripting

```bash
#!/bin/bash
# Encabezado obligatorio

# Variables
NOMBRE="DevOps"
FECHA=$(date +%Y-%m-%d)
RUTA="/var/log"

# Variables de entorno
export MI_VAR="valor"

# Condicionales
if [ -f "$RUTA/app.log" ]; then
  echo "El log existe"
elif [ -d "$RUTA" ]; then
  echo "Solo existe el directorio"
else
  echo "No existe nada"
fi

# Comparaciones numéricas
if [ $REPLICAS -gt 0 ]; then
  echo "Hay réplicas activas"
fi

# Bucle for
for SERVIDOR in web01 web02 web03; do
  echo "Revisando $SERVIDOR..."
  ssh $SERVIDOR "uptime"
done

# Bucle while
CONTADOR=0
while [ $CONTADOR -lt 5 ]; do
  echo "Intento $CONTADOR"
  ((CONTADOR++))
done

# Funciones
verificar_servicio() {
  local SERVICIO=$1
  systemctl is-active --quiet $SERVICIO
  if [ $? -eq 0 ]; then
    echo "✅ $SERVICIO activo"
  else
    echo "❌ $SERVICIO inactivo"
  fi
}

verificar_servicio nginx
verificar_servicio postgresql

# Manejo de errores
set -e  # Salir si algún comando falla
set -u  # Error en variables no definidas
set -o pipefail  # Error si falla algún pipe

# Captura de errores
trap 'echo "Error en línea $LINENO"' ERR
```

## Redes

```bash
# Ver interfaces de red
ip addr show
ip a  # versión corta

# Ver tabla de ruteo
ip route

# Ver conexiones activas
ss -tulpn

# Equivalente antiguo
netstat -tulpn

# Probar conectividad
ping -c 4 google.com

# Trazar ruta
traceroute google.com

# Consultar DNS
dig google.com
nslookup google.com

# Descargar archivo
curl -O https://ejemplo.com/archivo.zip

# Descargar con seguimiento de redirects
curl -L -o archivo.zip https://ejemplo.com/archivo

# Hacer request HTTP
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}' \
  https://api.ejemplo.com/endpoint

# Ver puertos en escucha
ss -tlnp | grep LISTEN
```

## Texto y Procesamiento

```bash
# Ordenar líneas
sort archivo.txt

# Ordenar numéricamente
sort -n archivo.txt

# Eliminar duplicados
sort archivo.txt | uniq

# Contar ocurrencias únicas
sort archivo.txt | uniq -c | sort -rn

# Extraer columnas (delimitador :)
cut -d: -f1 /etc/passwd

# Reemplazar texto
sed 's/viejo/nuevo/g' archivo.txt

# Reemplazar en archivo (in-place)
sed -i 's/localhost/0.0.0.0/g' config.conf

# Procesar columnas con awk
awk '{print $1, $3}' archivo.txt

# Sumar columna con awk
awk '{sum += $1} END {print sum}' numeros.txt
```

## Administración del Sistema

```bash
# Ver uptime del sistema
uptime

# Ver info del sistema
uname -a

# Ver logs del sistema
journalctl -f                        # tiempo real
journalctl -u nginx                  # servicio específico
journalctl --since "1 hour ago"     # últimas horas

# Gestionar servicios (systemd)
systemctl status nginx
systemctl start nginx
systemctl stop nginx
systemctl restart nginx
systemctl enable nginx   # arranque automático
systemctl disable nginx

# Variables de entorno
env              # ver todas
printenv PATH    # ver una específica
export VAR=val   # definir en sesión actual

# Historial de comandos
history
history | grep docker
!123             # ejecutar comando número 123
!!               # ejecutar último comando
```
