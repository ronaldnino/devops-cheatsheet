---
title: Ansible
slug: ansible
description: Automatización de configuración e infraestructura — playbooks, roles, inventarios y módulos esenciales.
icon: 🤖
category: iac
tags: [ansible, automation, devops, configuration]
level: intermediate
---

## Comandos básicos

```bash
# Verificar conectividad con todos los hosts
ansible all -m ping

# Verificar con inventario específico
ansible all -i inventario.ini -m ping

# Ejecutar comando ad-hoc en grupo
ansible webservers -m command -a "uptime"

# Ejecutar como usuario root
ansible all -m command -a "whoami" --become

# Ver información del sistema
ansible all -m setup | grep ansible_os_family

# Listar hosts de un grupo
ansible webservers --list-hosts
```

## Playbooks

### Ejecutar playbooks

```bash
# Ejecutar playbook básico
ansible-playbook site.yml

# Con inventario específico
ansible-playbook -i produccion.ini site.yml

# Limitar a hosts específicos
ansible-playbook site.yml --limit webservers

# Dry-run (sin cambios reales)
ansible-playbook site.yml --check

# Ver diff de cambios
ansible-playbook site.yml --check --diff

# Con variables extra
ansible-playbook site.yml -e "env=production version=2.1"

# Ejecutar desde tarea específica
ansible-playbook site.yml --start-at-task="Instalar nginx"

# Solo ejecutar tareas con tag
ansible-playbook site.yml --tags "deploy"

# Saltar tareas con tag
ansible-playbook site.yml --skip-tags "test"

# Verbose (más detalle)
ansible-playbook site.yml -vvv
```

### Estructura de playbook

```yaml
---
- name: Configurar servidores web
  hosts: webservers
  become: true
  vars:
    app_port: 8080
    app_user: www-data

  pre_tasks:
    - name: Actualizar caché de paquetes
      apt:
        update_cache: yes
        cache_valid_time: 3600

  tasks:
    - name: Instalar nginx
      package:
        name: nginx
        state: present

    - name: Copiar configuración
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
        owner: root
        mode: '0644'
      notify: Reiniciar nginx

    - name: Asegurar que nginx está activo
      service:
        name: nginx
        state: started
        enabled: yes

  handlers:
    - name: Reiniciar nginx
      service:
        name: nginx
        state: restarted

  post_tasks:
    - name: Verificar servicio
      uri:
        url: "http://localhost:{{ app_port }}"
        status_code: 200
```

## Inventarios

```ini
# inventario.ini

# Host individual
servidor1.empresa.com

# Grupo de hosts
[webservers]
web01.empresa.com
web02.empresa.com ansible_port=2222

[dbservers]
db01.empresa.com ansible_user=admin

# Variables por grupo
[webservers:vars]
http_port=80
ansible_python_interpreter=/usr/bin/python3

# Grupo de grupos
[produccion:children]
webservers
dbservers
```

```yaml
# inventario.yml (formato YAML)
all:
  children:
    webservers:
      hosts:
        web01:
          ansible_host: 192.168.1.10
          app_port: 8080
        web02:
          ansible_host: 192.168.1.11
    dbservers:
      hosts:
        db01:
          ansible_host: 192.168.1.20
          ansible_user: postgres
```

## Módulos esenciales

```yaml
# Gestión de paquetes
- apt:
    name: [nginx, curl, git]
    state: present
    update_cache: yes

# Gestión de archivos
- copy:
    src: ./archivos/config.conf
    dest: /etc/app/config.conf
    owner: root
    group: root
    mode: '0644'
    backup: yes

# Templates Jinja2
- template:
    src: app.conf.j2
    dest: /etc/app/app.conf

# Servicios
- service:
    name: nginx
    state: started
    enabled: yes

# Usuarios
- user:
    name: deploy
    shell: /bin/bash
    groups: sudo
    append: yes

# Directorios
- file:
    path: /var/app/logs
    state: directory
    owner: www-data
    mode: '0755'

# Variables de entorno en archivo
- lineinfile:
    path: /etc/environment
    regexp: '^APP_ENV='
    line: 'APP_ENV=production'

# Ejecutar comandos (con idempotencia)
- command:
    cmd: /usr/bin/migrate
    creates: /var/app/.migrated

# Git clone/pull
- git:
    repo: https://github.com/empresa/app.git
    dest: /var/www/app
    version: main
    force: yes
```

## Roles

```bash
# Crear estructura de rol
ansible-galaxy init mi-rol

# Instalar rol desde Galaxy
ansible-galaxy install geerlingguy.nginx

# Instalar desde requirements.yml
ansible-galaxy install -r requirements.yml

# Listar roles instalados
ansible-galaxy list
```

```yaml
# requirements.yml
- name: geerlingguy.nginx
  version: "3.1.4"

- src: https://github.com/empresa/ansible-rol-app
  name: app-deploy
```

```
# Estructura de un rol
roles/
  mi-rol/
    tasks/
      main.yml        # Tareas principales
    handlers/
      main.yml        # Handlers
    templates/
      app.conf.j2     # Templates Jinja2
    files/
      script.sh       # Archivos estáticos
    vars/
      main.yml        # Variables del rol
    defaults/
      main.yml        # Variables por defecto (sobreescribibles)
    meta/
      main.yml        # Metadata y dependencias
```

## Variables y Facts

```yaml
# Definir variables en playbook
vars:
  app_version: "2.1.0"
  db_host: "{{ hostvars['db01']['ansible_host'] }}"

# Usar variables de entorno del host
- debug:
    msg: "SO: {{ ansible_distribution }} {{ ansible_distribution_version }}"

# Registrar output de comando
- command: cat /etc/app/version
  register: app_version

- debug:
    msg: "Versión: {{ app_version.stdout }}"

# Condicionales
- name: Instalar paquete solo en Debian
  apt:
    name: curl
  when: ansible_os_family == "Debian"

# Loops
- name: Crear usuarios
  user:
    name: "{{ item.name }}"
    shell: "{{ item.shell }}"
  loop:
    - { name: "deploy", shell: "/bin/bash" }
    - { name: "monitor", shell: "/sbin/nologin" }
```

## Vault (secretos)

```bash
# Crear archivo cifrado
ansible-vault create secrets.yml

# Editar archivo cifrado
ansible-vault edit secrets.yml

# Cifrar archivo existente
ansible-vault encrypt vars/passwords.yml

# Descifrar archivo
ansible-vault decrypt vars/passwords.yml

# Ejecutar playbook con vault
ansible-playbook site.yml --ask-vault-pass
ansible-playbook site.yml --vault-password-file .vault_pass

# Cifrar string individual
ansible-vault encrypt_string 'mi_password_secreto' --name 'db_password'
```
