---
title: Terraform
slug: terraform
description: Comandos y patrones esenciales de Terraform para IaC — init, plan, apply, state y módulos.
icon: 🏗️
category: iac
tags: [terraform, iac, aws, cloud, devops]
level: intermediate
---

## Comandos del Ciclo de Vida

```bash
# Inicializar directorio (descarga providers y módulos)
terraform init

# Reinicializar forzando actualización de providers
terraform init -upgrade

# Formatear código según convención HCL
terraform fmt

# Formatear recursivamente todos los archivos
terraform fmt -recursive

# Validar sintaxis y coherencia
terraform validate

# Generar plan de cambios
terraform plan

# Guardar plan en archivo
terraform plan -out=tfplan

# Aplicar cambios (con confirmación)
terraform apply

# Aplicar plan guardado (sin confirmación)
terraform apply tfplan

# Aplicar sin confirmación interactiva (CI/CD)
terraform apply -auto-approve

# Destruir toda la infraestructura
terraform destroy

# Destruir recurso específico
terraform destroy -target=aws_instance.mi_servidor
```

## Variables y Outputs

```bash
# Pasar variable por CLI
terraform plan -var="environment=production"

# Usar archivo de variables
terraform plan -var-file="prod.tfvars"

# Ver outputs del state actual
terraform output

# Ver output específico
terraform output vpc_id

# Output en formato JSON (para scripting)
terraform output -json
```

## State

```bash
# Listar recursos en el state
terraform state list

# Ver detalle de recurso en state
terraform state show aws_instance.mi_servidor

# Mover recurso en el state (refactoring)
terraform state mv \
  aws_instance.viejo_nombre \
  aws_instance.nuevo_nombre

# Importar recurso existente al state
terraform import aws_instance.mi_servidor i-0123456789abcdef0

# Eliminar recurso del state (sin destruirlo)
terraform state rm aws_instance.mi_servidor

# Descargar state a archivo local
terraform state pull > terraform.tfstate.backup

# Forzar unlock de state bloqueado
terraform force-unlock <LOCK_ID>
```

## Workspace

```bash
# Listar workspaces
terraform workspace list

# Crear workspace
terraform workspace new staging

# Cambiar de workspace
terraform workspace select production

# Ver workspace actual
terraform workspace show

# Eliminar workspace
terraform workspace delete staging
```

## Estructura Recomendada

```hcl
# variables.tf
variable "environment" {
  description = "Ambiente de despliegue"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "El ambiente debe ser dev, staging o prod."
  }
}

variable "instance_type" {
  description = "Tipo de instancia EC2"
  type        = string
  default     = "t3.micro"
}
```

```hcl
# main.tf
terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "mi-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

resource "aws_instance" "app" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type
  
  tags = {
    Name = "${var.environment}-app-server"
  }
}
```

```hcl
# outputs.tf
output "instance_id" {
  description = "ID de la instancia EC2"
  value       = aws_instance.app.id
}

output "public_ip" {
  description = "IP pública de la instancia"
  value       = aws_instance.app.public_ip
  sensitive   = false
}
```

## Módulos

```hcl
# Usar módulo local
module "vpc" {
  source = "./modules/vpc"
  
  environment  = var.environment
  cidr_block   = "10.0.0.0/16"
}

# Usar módulo del Terraform Registry
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"
  
  cluster_name    = "${var.environment}-eks"
  cluster_version = "1.29"
}
```

```bash
# Comandos de módulos
terraform get          # Descargar módulos
terraform init         # Init también descarga módulos
```

## Data Sources

```hcl
# Obtener AMI más reciente de Amazon Linux
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

# Obtener VPC por tag
data "aws_vpc" "main" {
  tags = {
    Environment = var.environment
  }
}

# Obtener subnets privadas
data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }
  
  tags = {
    Tier = "private"
  }
}
```

## Debugging

```bash
# Habilitar logs detallados
export TF_LOG=DEBUG
terraform plan

# Niveles de log: TRACE, DEBUG, INFO, WARN, ERROR
export TF_LOG=INFO

# Guardar logs en archivo
export TF_LOG_PATH=./terraform.log

# Ver graph de dependencias
terraform graph | dot -Tpng > graph.png
```
