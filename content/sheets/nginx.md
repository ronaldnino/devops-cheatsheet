---
title: Nginx
slug: nginx
description: Configuración de Nginx como servidor web y reverse proxy — virtual hosts, SSL, load balancing y seguridad.
icon: 🌐
category: system
tags: [nginx, web-server, proxy, ssl, devops]
level: intermediate
---

## Gestión del servicio

```bash
# Iniciar / detener / reiniciar
systemctl start nginx
systemctl stop nginx
systemctl restart nginx

# Recargar config sin downtime
systemctl reload nginx
nginx -s reload

# Verificar estado
systemctl status nginx

# Habilitar en arranque
systemctl enable nginx

# Verificar sintaxis de configuración
nginx -t
nginx -T  # imprime la configuración completa

# Ver versión y módulos compilados
nginx -V
```

## Estructura de archivos

```bash
/etc/nginx/
  nginx.conf           # Configuración principal
  conf.d/              # Configuraciones adicionales (*.conf)
  sites-available/     # Virtual hosts disponibles (Debian/Ubuntu)
  sites-enabled/       # Virtual hosts activos (symlinks)

/var/log/nginx/
  access.log           # Logs de acceso
  error.log            # Logs de errores

/var/www/html/         # Directorio raíz por defecto
```

## nginx.conf principal

```nginx
user www-data;
worker_processes auto;          # auto = 1 por CPU
pid /run/nginx.pid;

events {
    worker_connections 1024;    # conexiones por worker
    multi_accept on;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    # Logs
    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent"';
    access_log /var/log/nginx/access.log main;
    error_log  /var/log/nginx/error.log warn;

    # Performance
    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    keepalive_timeout 65;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

## Virtual hosts (Server blocks)

### Servidor estático

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name miweb.com www.miweb.com;

    root /var/www/miweb;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }

    # Caché para assets estáticos
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Logs separados por dominio
    access_log /var/log/nginx/miweb_access.log;
    error_log  /var/log/nginx/miweb_error.log;
}
```

### Reverse proxy

```nginx
server {
    listen 80;
    server_name api.miweb.com;

    location / {
        proxy_pass http://localhost:3000;

        # Headers estándar de proxy
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout    60s;
        proxy_read_timeout    60s;

        # Buffers
        proxy_buffering on;
        proxy_buffer_size   128k;
        proxy_buffers     4 256k;
    }

    # WebSockets
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### SSL con Let's Encrypt

```nginx
server {
    listen 443 ssl http2;
    server_name miweb.com www.miweb.com;

    ssl_certificate     /etc/letsencrypt/live/miweb.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/miweb.com/privkey.pem;

    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # HSTS (6 meses)
    add_header Strict-Transport-Security "max-age=15768000" always;

    root /var/www/miweb;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}

# Redirigir HTTP → HTTPS
server {
    listen 80;
    server_name miweb.com www.miweb.com;
    return 301 https://$host$request_uri;
}
```

## Load Balancing

```nginx
upstream backend {
    # Round-robin (por defecto)
    server backend1.ejemplo.com:8080;
    server backend2.ejemplo.com:8080;
    server backend3.ejemplo.com:8080 weight=2;  # doble tráfico

    # Least connections
    # least_conn;

    # IP hash (sticky sessions)
    # ip_hash;

    # Servidor de respaldo
    server backup.ejemplo.com:8080 backup;

    # Health check (requiere Nginx Plus o módulo)
    keepalive 32;
}

server {
    listen 80;
    server_name app.miweb.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Seguridad y headers

```nginx
server {
    # Ocultar versión de Nginx
    server_tokens off;

    # Headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
    }

    # Bloquear acceso a archivos ocultos
    location ~ /\. {
        deny all;
        return 404;
    }

    # Restricción por IP
    location /admin {
        allow 10.0.0.0/8;
        deny all;
        proxy_pass http://localhost:3000;
    }

    # Autenticación básica
    location /privado {
        auth_basic "Área restringida";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }
}
```

## Logs y diagnóstico

```bash
# Ver logs en tiempo real
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Filtrar errores 5xx
grep " 5[0-9][0-9] " /var/log/nginx/access.log

# IPs con más requests
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -20

# URLs más solicitadas
awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10

# Crear contraseña para auth básica
htpasswd -c /etc/nginx/.htpasswd usuario
```
