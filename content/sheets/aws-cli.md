---
title: AWS CLI
slug: aws-cli
description: Comandos esenciales de AWS CLI para EC2, S3, IAM, RDS, y servicios de seguridad.
icon: ☁️
category: cloud
tags: [aws, cloud, cli, devops]
level: intermediate
tips:
  - type: tip
    text: Usa --output table para visualizar resultados en consola y --output json para scripting
  - type: warning
    text: Nunca configures credenciales de root — crea usuarios IAM con permisos mínimos necesarios
  - type: info
    text: Usa --profile para alternar entre cuentas sin sobreescribir tus credenciales por defecto
  - type: success
    text: Combina --query con JMESPath para filtrar output y evitar parsear JSON manualmente
---

## Configuración

### Credenciales y perfiles

```bash
# Initial setup (interactive)
aws configure

# Named profile
aws configure --profile produccion

# List all profiles
aws configure list-profiles

# Use specific profile
aws s3 ls --profile produccion

# Verify current identity
aws sts get-caller-identity
```

```bash
# Detailed example — multi-account setup
# Configure three environments
aws configure --profile dev
aws configure --profile staging
aws configure --profile prod

# Verify each identity
for profile in dev staging prod; do
  echo "=== $profile ==="
  aws sts get-caller-identity --profile $profile \
    --query '[Account,Arn]' --output text
done

# Set default profile for session
export AWS_PROFILE=prod

# Override region for one command
aws ec2 describe-instances --region eu-west-1 --profile prod

# Use IAM role via assume-role (cross-account)
aws sts assume-role \
  --role-arn arn:aws:iam::123456789:role/DeployRole \
  --role-session-name deploy-session \
  --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' \
  --output text
```

## EC2

### Instancias

```bash
# List instances with key fields
aws ec2 describe-instances \
  --query 'Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType,PublicIpAddress]' \
  --output table

# Start / stop / reboot / terminate
aws ec2 start-instances     --instance-ids i-0123456789abcdef0
aws ec2 stop-instances      --instance-ids i-0123456789abcdef0
aws ec2 reboot-instances    --instance-ids i-0123456789abcdef0
aws ec2 terminate-instances --instance-ids i-0123456789abcdef0

# Filter by tag
aws ec2 describe-instances \
  --filters "Name=tag:Environment,Values=production" \
  --query 'Reservations[*].Instances[*].[InstanceId,State.Name]' \
  --output table
```

```bash
# Detailed example — find and stop all non-prod instances
# List all running instances with Name tag
aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --query 'Reservations[*].Instances[*].{
    ID:InstanceId,
    Name:Tags[?Key==`Name`]|[0].Value,
    Type:InstanceType,
    IP:PublicIpAddress,
    AZ:Placement.AvailabilityZone
  }' \
  --output table

# Stop all instances tagged Environment=dev
INSTANCE_IDS=$(aws ec2 describe-instances \
  --filters "Name=tag:Environment,Values=dev" \
             "Name=instance-state-name,Values=running" \
  --query 'Reservations[*].Instances[*].InstanceId' \
  --output text)

aws ec2 stop-instances --instance-ids $INSTANCE_IDS

# Wait until stopped
aws ec2 wait instance-stopped --instance-ids $INSTANCE_IDS
echo "All dev instances stopped"
```

### Security Groups

```bash
# List security groups
aws ec2 describe-security-groups \
  --query 'SecurityGroups[*].[GroupId,GroupName,Description]' \
  --output table

# Add inbound rule
aws ec2 authorize-security-group-ingress \
  --group-id sg-0123456789 \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# Revoke inbound rule
aws ec2 revoke-security-group-ingress \
  --group-id sg-0123456789 \
  --protocol tcp --port 22 --cidr 0.0.0.0/0
```

```bash
# Detailed example — audit overly permissive security groups
# Find all SGs with port 22 open to the world (0.0.0.0/0)
aws ec2 describe-security-groups \
  --filters "Name=ip-permission.from-port,Values=22" \
            "Name=ip-permission.cidr,Values=0.0.0.0/0" \
  --query 'SecurityGroups[*].[GroupId,GroupName,VpcId]' \
  --output table

# Find all SGs with ANY port open to 0.0.0.0/0
aws ec2 describe-security-groups \
  --query 'SecurityGroups[?IpPermissions[?IpRanges[?CidrIp==`0.0.0.0/0`]]].[GroupId,GroupName]' \
  --output table

# Add restrictive rule — allow SSH only from office IP
aws ec2 authorize-security-group-ingress \
  --group-id sg-0123456789 \
  --protocol tcp \
  --port 22 \
  --cidr 203.0.113.10/32 \
  --tag-specifications 'ResourceType=security-group-rule,Tags=[{Key=Description,Value=Office-SSH}]'
```

## S3

### Operaciones básicas

```bash
# List buckets / objects
aws s3 ls
aws s3 ls s3://mi-bucket/
aws s3 ls s3://mi-bucket/ --recursive --human-readable

# Copy and move
aws s3 cp archivo.txt s3://mi-bucket/ruta/
aws s3 cp s3://mi-bucket/archivo.txt ./local/
aws s3 mv s3://mi-bucket/viejo.txt s3://mi-bucket/nuevo.txt

# Sync local → S3 (--delete removes files not in source)
aws s3 sync ./dist/ s3://mi-bucket/ --delete

# Remove objects
aws s3 rm s3://mi-bucket/archivo.txt
aws s3 rm s3://mi-bucket/carpeta/ --recursive
```

```bash
# Detailed example — deploy static site + cache headers
# Sync with proper cache headers per file type
# HTML — no cache (always fresh)
aws s3 sync ./dist/ s3://mi-sitio/ \
  --exclude "*" --include "*.html" \
  --cache-control "no-cache,no-store,must-revalidate" \
  --delete

# Assets (JS/CSS/images) — 1 year cache (hashed filenames)
aws s3 sync ./dist/ s3://mi-sitio/ \
  --exclude "*.html" \
  --cache-control "public,max-age=31536000,immutable"

# Invalidate CloudFront after deploy
aws cloudfront create-invalidation \
  --distribution-id E1234ABCD5678 \
  --paths "/*"

echo "Deploy complete"
```

### Gestión de buckets

```bash
# Create bucket
aws s3 mb s3://mi-nuevo-bucket --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket mi-bucket \
  --versioning-configuration Status=Enabled

# Block all public access
aws s3api put-public-access-block \
  --bucket mi-bucket \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Get bucket size
aws s3api list-objects-v2 --bucket mi-bucket \
  --query 'sum(Contents[].Size)' --output text | numfmt --to=iec
```

```bash
# Detailed example — secure bucket with lifecycle policy
# 1. Block public access
aws s3api put-public-access-block \
  --bucket mi-bucket \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# 2. Enable versioning
aws s3api put-bucket-versioning \
  --bucket mi-bucket \
  --versioning-configuration Status=Enabled

# 3. Enable server-side encryption (SSE-S3)
aws s3api put-bucket-encryption \
  --bucket mi-bucket \
  --server-side-encryption-configuration '{
    "Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]
  }'

# 4. Set lifecycle — move to IA after 30d, Glacier after 90d, delete after 365d
aws s3api put-bucket-lifecycle-configuration \
  --bucket mi-bucket \
  --lifecycle-configuration '{
    "Rules":[{
      "ID":"archive-rule",
      "Status":"Enabled",
      "Filter":{"Prefix":"logs/"},
      "Transitions":[
        {"Days":30,"StorageClass":"STANDARD_IA"},
        {"Days":90,"StorageClass":"GLACIER"}
      ],
      "Expiration":{"Days":365}
    }]
  }'
```

## IAM

### Usuarios y accesos

```bash
# List users and roles
aws iam list-users \
  --query 'Users[*].[UserName,CreateDate]' --output table
aws iam list-roles \
  --query 'Roles[*].[RoleName,Arn]' --output table

# Create user and attach policy
aws iam create-user --user-name deploy-user
aws iam attach-user-policy \
  --user-name deploy-user \
  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess

# Create and rotate access keys
aws iam create-access-key --user-name deploy-user
aws iam update-access-key \
  --user-name deploy-user \
  --access-key-id AKIAIOSFODNN7EXAMPLE \
  --status Inactive
```

```bash
# Detailed example — create least-privilege deploy user
# 1. Create user
aws iam create-user --user-name ci-deploy

# 2. Create custom policy (S3 + ECR deploy only)
aws iam create-policy \
  --policy-name CiDeployPolicy \
  --policy-document '{
    "Version":"2012-10-17",
    "Statement":[
      {
        "Sid":"S3Deploy",
        "Effect":"Allow",
        "Action":["s3:PutObject","s3:GetObject","s3:DeleteObject","s3:ListBucket"],
        "Resource":["arn:aws:s3:::mi-sitio","arn:aws:s3:::mi-sitio/*"]
      },
      {
        "Sid":"ECRPush",
        "Effect":"Allow",
        "Action":["ecr:GetAuthorizationToken","ecr:BatchCheckLayerAvailability",
                  "ecr:PutImage","ecr:InitiateLayerUpload","ecr:UploadLayerPart",
                  "ecr:CompleteLayerUpload"],
        "Resource":"*"
      }
    ]
  }'

# 3. Attach policy to user
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws iam attach-user-policy \
  --user-name ci-deploy \
  --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/CiDeployPolicy

# 4. Create access key for CI
aws iam create-access-key --user-name ci-deploy \
  --query '[AccessKey.AccessKeyId,AccessKey.SecretAccessKey]' \
  --output text
```

### Roles y políticas

```bash
# List attached policies for a user
aws iam list-attached-user-policies --user-name mi-usuario

# List all policies in account
aws iam list-policies --scope Local --output table

# Get policy document (current version)
aws iam get-policy-version \
  --policy-arn arn:aws:iam::123456789:policy/MiPolitica \
  --version-id v1

# Simulate policy (check what actions are allowed)
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::123456789:user/mi-usuario \
  --action-names s3:PutObject ec2:StartInstances \
  --resource-arns arn:aws:s3:::mi-bucket/*
```

```bash
# Detailed example — audit unused IAM credentials
# Find users with access keys not used in 90 days
aws iam generate-credential-report
aws iam get-credential-report \
  --query 'Content' --output text | base64 -d | \
  awk -F',' 'NR>1 && $10!="N/A" {
    cmd="date -d \""$10"\" +%s"
    cmd | getline last_used
    close(cmd)
    now=systime()
    days_ago=(now-last_used)/86400
    if(days_ago>90) print $1, "last used:", int(days_ago), "days ago"
  }'

# List all users with console access (have login profile)
aws iam list-users --query 'Users[*].UserName' --output text | \
  tr '\t' '\n' | while read user; do
    aws iam get-login-profile --user-name "$user" 2>/dev/null \
      && echo "  → $user has console access"
  done
```

## RDS

### Instancias y snapshots

```bash
# List RDS instances
aws rds describe-db-instances \
  --query 'DBInstances[*].[DBInstanceIdentifier,DBInstanceStatus,Engine,MultiAZ,DBInstanceClass]' \
  --output table

# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier mi-base-prod \
  --db-snapshot-identifier snap-$(date +%Y%m%d-%H%M)

# List snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier mi-base-prod \
  --query 'DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime,Status,AllocatedStorage]' \
  --output table

# Delete old snapshot
aws rds delete-db-snapshot \
  --db-snapshot-identifier snap-20240101-1200
```

```bash
# Detailed example — automated daily backup script
#!/bin/bash
DB_ID="mi-base-prod"
RETENTION_DAYS=7
SNAP_ID="auto-${DB_ID}-$(date +%Y%m%d)"

# Create snapshot
echo "Creating snapshot: $SNAP_ID"
aws rds create-db-snapshot \
  --db-instance-identifier $DB_ID \
  --db-snapshot-identifier $SNAP_ID \
  --tags Key=CreatedBy,Value=automation Key=Retention,Value=${RETENTION_DAYS}d

# Wait until available
aws rds wait db-snapshot-completed \
  --db-snapshot-identifier $SNAP_ID
echo "Snapshot ready: $SNAP_ID"

# Delete snapshots older than retention period
CUTOFF=$(date -d "${RETENTION_DAYS} days ago" +%Y-%m-%d)
aws rds describe-db-snapshots \
  --db-instance-identifier $DB_ID \
  --query "DBSnapshots[?SnapshotCreateTime<'${CUTOFF}'].DBSnapshotIdentifier" \
  --output text | tr '\t' '\n' | while read old_snap; do
    echo "Deleting old snapshot: $old_snap"
    aws rds delete-db-snapshot --db-snapshot-identifier "$old_snap"
  done
```

### Configuración y mantenimiento

```bash
# Modify instance (enable Multi-AZ, backup retention)
aws rds modify-db-instance \
  --db-instance-identifier mi-base-prod \
  --backup-retention-period 7 \
  --multi-az \
  --apply-immediately

# Check pending maintenance
aws rds describe-pending-maintenance-actions \
  --query 'PendingMaintenanceActions[*].[ResourceIdentifier,PendingMaintenanceActionDetails[*].Action]' \
  --output table

# List parameter groups
aws rds describe-db-parameter-groups \
  --query 'DBParameterGroups[*].[DBParameterGroupName,DBParameterGroupFamily]' \
  --output table
```

```bash
# Detailed example — restore instance from snapshot to new environment
SNAP_ID="auto-mi-base-prod-20240115"
NEW_DB_ID="mi-base-staging"
SUBNET_GROUP="staging-subnet-group"
SG_ID="sg-0staging123"

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier $NEW_DB_ID \
  --db-snapshot-identifier $SNAP_ID \
  --db-instance-class db.t3.medium \
  --db-subnet-group-name $SUBNET_GROUP \
  --vpc-security-group-ids $SG_ID \
  --no-publicly-accessible \
  --tags Key=Environment,Value=staging Key=RestoredFrom,Value=$SNAP_ID

# Wait until available (can take 10-20 min)
echo "Waiting for restore to complete..."
aws rds wait db-instance-available \
  --db-instance-identifier $NEW_DB_ID

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier $NEW_DB_ID \
  --query 'DBInstances[0].Endpoint.[Address,Port]' \
  --output text
```

## Seguridad y Auditoría

### CloudTrail y GuardDuty

```bash
# CloudTrail — search recent events
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=ConsoleLogin \
  --start-time $(date -d '24 hours ago' --iso-8601=seconds) \
  --query 'Events[*].[EventTime,Username,SourceIPAddress]' \
  --output table

# GuardDuty — list high severity findings
aws guardduty list-detectors --query 'DetectorIds[0]' --output text | \
  xargs -I{} aws guardduty list-findings \
    --detector-id {} \
    --finding-criteria '{"Criterion":{"severity":{"Gte":7}}}' \
    --query 'FindingIds' --output text

# Inspector v2 — critical vulnerabilities
aws inspector2 list-findings \
  --filter-criteria '{"severity":[{"comparison":"EQUALS","value":"CRITICAL"}]}' \
  --query 'findings[*].[title,severity,status,packageVulnerabilityDetails.vulnerablePackages[0].name]' \
  --output table
```

```bash
# Detailed example — security incident investigation
# Scenario: suspicious API activity detected

# 1. Find all API calls from a suspicious IP in last 24h
SUSPICIOUS_IP="203.0.113.99"
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=SourceIPAddress,AttributeValue=$SUSPICIOUS_IP \
  --start-time $(date -d '24 hours ago' --iso-8601=seconds) \
  --query 'Events[*].[EventTime,EventName,Username,ErrorCode]' \
  --output table

# 2. Check all IAM changes in last 7 days
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventSource,AttributeValue=iam.amazonaws.com \
  --start-time $(date -d '7 days ago' --iso-8601=seconds) \
  --query 'Events[?!ErrorCode].[EventTime,EventName,Username]' \
  --output table

# 3. Get GuardDuty finding details
DETECTOR_ID=$(aws guardduty list-detectors --query 'DetectorIds[0]' --output text)
FINDING_ID="abc123def456"

aws guardduty get-findings \
  --detector-id $DETECTOR_ID \
  --finding-ids $FINDING_ID \
  --query 'Findings[0].{
    Title:Title,
    Severity:Severity,
    Type:Type,
    AccountId:AccountId,
    Description:Description
  }'

# 4. Block suspicious IP in WAF
aws wafv2 update-ip-set \
  --name BlockedIPs \
  --scope REGIONAL \
  --id <ip-set-id> \
  --lock-token <lock-token> \
  --addresses "${SUSPICIOUS_IP}/32"
```

### Config y WAF

```bash
# AWS Config — list non-compliant resources
aws configservice describe-compliance-by-resource \
  --compliance-types NON_COMPLIANT \
  --query 'ComplianceByResources[*].[ResourceType,ResourceId]' \
  --output table

# WAF — list Web ACLs
aws wafv2 list-web-acls --scope REGIONAL \
  --query 'WebACLs[*].[Name,Id,ARN]' --output table

# SecurityHub — get failed controls
aws securityhub get-findings \
  --filters '{"ComplianceStatus":[{"Value":"FAILED","Comparison":"EQUALS"}]}' \
  --query 'Findings[*].[Title,Severity.Label,ProductFields.ControlId]' \
  --output table
```

```bash
# Detailed example — full compliance audit report
#!/bin/bash
REPORT_DATE=$(date +%Y-%m-%d)
echo "=== AWS Compliance Audit: $REPORT_DATE ==="

# 1. Config non-compliant resources
echo -e "\n[1] NON-COMPLIANT RESOURCES (AWS Config)"
aws configservice describe-compliance-by-resource \
  --compliance-types NON_COMPLIANT \
  --query 'ComplianceByResources[*].[ResourceType,ResourceId]' \
  --output table

# 2. SecurityHub critical findings
echo -e "\n[2] CRITICAL SECURITY FINDINGS (SecurityHub)"
aws securityhub get-findings \
  --filters '{
    "SeverityLabel":[{"Value":"CRITICAL","Comparison":"EQUALS"}],
    "RecordState":[{"Value":"ACTIVE","Comparison":"EQUALS"}]
  }' \
  --query 'Findings[*].[Title,AwsAccountId,UpdatedAt]' \
  --output table

# 3. Root account activity (should be 0)
echo -e "\n[3] ROOT ACCOUNT LOGINS (last 30 days — should be EMPTY)"
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=Username,AttributeValue=root \
  --start-time $(date -d '30 days ago' --iso-8601=seconds) \
  --query 'Events[*].[EventTime,EventName,SourceIPAddress]' \
  --output table

# 4. Public S3 buckets
echo -e "\n[4] S3 BUCKETS WITH PUBLIC ACCESS"
aws s3api list-buckets --query 'Buckets[*].Name' --output text | \
  tr '\t' '\n' | while read bucket; do
    BLOCK=$(aws s3api get-public-access-block --bucket "$bucket" \
      --query 'PublicAccessBlockConfiguration.BlockPublicAcls' \
      --output text 2>/dev/null || echo "MISSING")
    if [ "$BLOCK" != "True" ]; then
      echo "  ⚠️  $bucket — public access NOT blocked"
    fi
  done
```

## CloudWatch

### Alarmas y métricas

```bash
# List alarms in ALARM state
aws cloudwatch describe-alarms \
  --state-value ALARM \
  --query 'MetricAlarms[*].[AlarmName,StateValue,MetricName,Namespace]' \
  --output table

# CPU utilization — last hour (5-min intervals)
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-0123456789abcdef0 \
  --start-time $(date -d '1 hour ago' --iso-8601=seconds) \
  --end-time $(date --iso-8601=seconds) \
  --period 300 --statistics Average \
  --query 'sort_by(Datapoints,&Timestamp)[*].[Timestamp,Average]' \
  --output table

# List all metrics for a resource
aws cloudwatch list-metrics \
  --namespace AWS/RDS \
  --dimensions Name=DBInstanceIdentifier,Value=mi-base-prod
```

```bash
# Detailed example — create comprehensive EC2 alarm set
INSTANCE_ID="i-0123456789abcdef0"
SNS_ARN="arn:aws:sns:us-east-1:123456789:ops-alerts"

# 1. CPU > 80% for 5 minutes
aws cloudwatch put-metric-alarm \
  --alarm-name "${INSTANCE_ID}-HighCPU" \
  --alarm-description "CPU above 80% for 5 min" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --dimensions Name=InstanceId,Value=$INSTANCE_ID \
  --period 300 --evaluation-periods 1 \
  --threshold 80 --comparison-operator GreaterThanThreshold \
  --statistic Average \
  --alarm-actions $SNS_ARN \
  --ok-actions $SNS_ARN

# 2. Status check failed
aws cloudwatch put-metric-alarm \
  --alarm-name "${INSTANCE_ID}-StatusCheckFailed" \
  --metric-name StatusCheckFailed \
  --namespace AWS/EC2 \
  --dimensions Name=InstanceId,Value=$INSTANCE_ID \
  --period 60 --evaluation-periods 2 \
  --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold \
  --statistic Maximum \
  --alarm-actions $SNS_ARN

# 3. Network in/out anomaly (if < 1KB for 10 min = possible issue)
aws cloudwatch put-metric-alarm \
  --alarm-name "${INSTANCE_ID}-LowNetworkIn" \
  --metric-name NetworkIn \
  --namespace AWS/EC2 \
  --dimensions Name=InstanceId,Value=$INSTANCE_ID \
  --period 600 --evaluation-periods 1 \
  --threshold 1024 --comparison-operator LessThanThreshold \
  --statistic Sum \
  --alarm-actions $SNS_ARN

echo "All alarms created for $INSTANCE_ID"
```

### Logs

```bash
# List log groups
aws logs describe-log-groups \
  --query 'logGroups[*].[logGroupName,retentionInDays,storedBytes]' \
  --output table

# Tail log group in real time
aws logs tail /aws/lambda/mi-funcion --follow

# Search logs (last 1 hour)
aws logs filter-log-events \
  --log-group-name /var/log/app \
  --start-time $(($(date +%s) - 3600))000 \
  --filter-pattern "ERROR" \
  --query 'events[*].[timestamp,message]' \
  --output text

# Set retention policy
aws logs put-retention-policy \
  --log-group-name /aws/ec2/app \
  --retention-in-days 30
```

```bash
# Detailed example — CloudWatch Logs Insights query
# Run query for error analysis (last 24h)
START_TIME=$(($(date +%s) - 86400))
END_TIME=$(date +%s)

QUERY_ID=$(aws logs start-query \
  --log-group-name /aws/ec2/app \
  --start-time $START_TIME \
  --end-time $END_TIME \
  --query-string '
    fields @timestamp, @message, @logStream
    | filter @message like /ERROR|EXCEPTION|FATAL/
    | stats count(*) as error_count by bin(1h) as hour
    | sort hour desc
    | limit 24
  ' \
  --query 'queryId' --output text)

# Wait and get results
sleep 5
aws logs get-query-results \
  --query-id $QUERY_ID \
  --query 'results[*][*].[field,value]' \
  --output table
```
