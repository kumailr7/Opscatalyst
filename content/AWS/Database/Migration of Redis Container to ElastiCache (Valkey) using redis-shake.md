---
Author:
  - Kumail Rizvi
Author Profile:
  - https://linkedin.com/in/kumail-rizvi
tags:
  - aws
  - redis
  - elasticache
  - valkey
  - migration
  - database
Creation Date: 2026-05-15T00:00:00
Last Date: 2026-05-15T00:00:00
DocID: MI-26
drafts:
References:
  - https://github.com/tair-opensource/RedisShake
  - https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html
  - https://valkey.io
description: Step-by-step guide to migrate a self-hosted Redis container to AWS ElastiCache (Valkey engine) using redis-shake with minimal downtime.
Github Link:
---

---

## Overview

Running Redis in a self-managed container means you own patching, persistence, HA, and backups. **AWS ElastiCache** — now supporting **Valkey**, the open-source Redis fork — offloads all of that operational burden. This guide walks through a live, near-zero-downtime migration from a Redis container to ElastiCache Valkey using **redis-shake**, an open-source tool that performs real-time data replication between Redis-compatible instances.

---

## Architecture Diagram

![[redis-to-elasticache-arch.png]]

> Source draw.io file: `content/AWS/assets/redis-to-elasticache-arch.drawio`

The migration follows three sequential phases:

| Phase | What happens |
|-------|-------------|
| **① PSYNC** | redis-shake connects to the source Redis as a replica and pulls the full RDB snapshot |
| **② Incremental sync** | All new write commands are streamed in real-time (AOF replication) to ElastiCache |
| **③ Cutover** | Application connection string is updated; redis-shake is stopped; source container is decommissioned |

---

## What is Valkey?

**Valkey** is an open-source, high-performance key-value store forked from Redis 7.2.x, maintained by the Linux Foundation. AWS ElastiCache adopted Valkey as a first-class engine option, offering:

- Full Redis API compatibility (RESP2/RESP3)
- Serverless and provisioned cluster modes
- Automatic failover and Multi-AZ support
- No proprietary licensing concerns (BSD 3-Clause)

Valkey is a **drop-in replacement** — your existing Redis clients and commands work without modification. Only the connection string changes (adding TLS).

---

## What is redis-shake?

**redis-shake** is a data migration and synchronization tool for Redis-compatible databases. It supports multiple modes:

| Mode | Description |
|------|-------------|
| `sync` | Live replication — RDB snapshot + ongoing commands via PSYNC (best for near-zero downtime) |
| `restore` | One-time restore from an RDB dump file |
| `scan` | Key-by-key migration using SCAN (no replication stream; use when PSYNC is blocked) |
| `rump` | Offline migration using DUMP/RESTORE commands |

For production migrations, **`sync` mode** is the right choice — it replicates the full dataset first (RDB), then continuously streams new writes until you cut over.

---

## Prerequisites

Before starting, ensure the following are in place:

- **AWS CLI** configured with IAM permissions for ElastiCache, EC2, and VPC
- **ElastiCache Valkey cluster** created and reachable from a migration host inside the same VPC
- **redis-shake** binary on a migration EC2 host that has network access to both source Redis and ElastiCache endpoint
- Source Redis allows replication (`PSYNC` / `REPLCONF` not ACL-blocked)
- **Security Groups** allow the migration host to reach the source on port `6379` and ElastiCache on port `6379` (TLS)

---

## Step 1: Create the ElastiCache Cluster (Valkey Engine)

### Via AWS Console

1. Navigate to **ElastiCache → Caches → Create Cache**.
2. Select **Valkey** as the engine and version **7.2**.
3. Choose **Provisioned** (or Serverless for auto-scaling).
4. Configure:
   - **Cluster name**: `valkey-prod`
   - **Multi-AZ**: Enabled
   - **Encryption in transit**: Enabled (TLS required)
   - **Auth token**: Set a strong token — note it for later
   - **Subnet group**: Private subnet within your VPC

### Via AWS CLI

```bash
aws elasticache create-replication-group \
  --replication-group-id valkey-prod \
  --description "Production Valkey cluster" \
  --engine valkey \
  --engine-version 7.2 \
  --cache-node-type cache.r7g.large \
  --num-cache-clusters 2 \
  --automatic-failover-enabled \
  --at-rest-encryption-enabled \
  --transit-encryption-enabled \
  --auth-token "YourStrongAuthToken123!" \
  --region ap-southeast-1
```

Wait for the cluster to become `available`:

```bash
aws elasticache describe-replication-groups \
  --replication-group-id valkey-prod \
  --query 'ReplicationGroups[0].Status'
```

---

## Step 2: Launch the Migration EC2 Host

Launch a small EC2 instance (t3.medium) inside the same VPC. This instance will run redis-shake. Ensure its security group allows:

- **Outbound** to source Redis on port `6379`
- **Outbound** to ElastiCache on port `6379` (TLS)

Install redis-shake:

```bash
REDIS_SHAKE_VERSION=v3.1.11
wget https://github.com/tair-opensource/RedisShake/releases/download/${REDIS_SHAKE_VERSION}/redis-shake-linux-amd64.tar.gz

tar -xzf redis-shake-linux-amd64.tar.gz
chmod +x redis-shake

./redis-shake --version
```

---

## Step 3: Configure redis-shake (sync mode)

Create the configuration file `sync.toml` on the migration host:

```toml
[function]
function = ""

[source]
type     = "standalone"
address  = "redis-source.internal:6379"
password = "your-source-redis-password"
# tls = true   # uncomment if source uses TLS

[target]
type     = "cluster"
address  = "valkey-prod.xxxxxx.clustercfg.apse1.cache.amazonaws.com:6379"
password = "YourStrongAuthToken123!"
tls      = true

[advanced]
pipeline_count_limit = 1024
log_level            = "info"
exit_when_sync_done  = false
```

> **Source type**: Use `"standalone"` for a single Redis container. Use `"cluster"` if the source is Redis Cluster mode.
>
> **Target type**: Always `"cluster"` for ElastiCache — even single-node, as ElastiCache uses the cluster config endpoint.

---

## Step 4: Validate Connectivity Before Running

Test both endpoints from the migration host before starting the sync:

```bash
# Test source Redis
redis-cli -h redis-source.internal -p 6379 \
  -a your-source-redis-password PING

# Check source replication role
redis-cli -h redis-source.internal -p 6379 \
  -a your-source-redis-password INFO replication

# Test ElastiCache (TLS)
redis-cli -h valkey-prod.xxxxxx.clustercfg.apse1.cache.amazonaws.com \
  -p 6379 --tls -a YourStrongAuthToken123! PING
```

Expected output for all three: `PONG`. The `INFO replication` output should show `role:master`.

---

## Step 5: Run redis-shake

Start the sync process:

```bash
nohup ./redis-shake sync.toml > redis-shake.log 2>&1 &
tail -f redis-shake.log
```

You will see output progressing through three phases:

```
[INFO] source: standalone, address: redis-source.internal:6379
[INFO] target: cluster, address: valkey-prod.xxx.cache.amazonaws.com:6379
[INFO] sending PSYNC to source...
[INFO] RDB transfer started, size: 512MB
[INFO] RDB transfer done. keys migrated: 2,400,000        ← Phase 1 complete
[INFO] entering incremental sync mode (streaming AOF commands)...
[INFO] lag: 3ms                                           ← Phase 2: live sync
[INFO] lag: 0ms
```

Once you see `lag: 0ms` (or consistently low lag), the live sync is caught up and you are ready to cut over.

---

## Step 6: Validate Data Integrity

While redis-shake is streaming, spot-check key counts and sample values:

```bash
# Key count on source
redis-cli -h redis-source.internal -p 6379 -a <password> DBSIZE

# Key count on ElastiCache
redis-cli -h valkey-prod.xxx.cache.amazonaws.com \
  -p 6379 --tls -a <token> DBSIZE

# Spot-check a specific key
redis-cli -h redis-source.internal -a <password> GET "session:user:12345"
redis-cli -h valkey-prod.xxx.cache.amazonaws.com --tls -a <token> GET "session:user:12345"
```

Both values should match. Keys with TTLs that expired during migration will differ by a small count — this is expected and correct.

---

## Step 7: Application Cutover

Once lag is at `0ms` and data is verified:

1. **Put the application in maintenance mode** (or throttle writes) for 30–60 seconds.
2. Wait for redis-shake lag to reach `0ms`.
3. **Update the application's Redis connection string**:

   ```bash
   # Before
   REDIS_URL=redis://redis-source.internal:6379

   # After  
   REDIS_URL=rediss://valkey-prod.xxx.clustercfg.apse1.cache.amazonaws.com:6379
   ```

   Note the `rediss://` scheme (`rediss` = Redis over TLS).

4. Restart the application pods/services.
5. **Stop redis-shake**: `kill $(pgrep redis-shake)`
6. Remove maintenance mode.
7. Decommission the source Redis container.

---

## Step 8: Post-Migration Verification

Monitor the following CloudWatch metrics for 48 hours after cutover:

| Metric | Healthy baseline |
|--------|-----------------|
| `CacheHits` / `CacheMisses` | Hit rate matches pre-migration |
| `CurrConnections` | Confirms application connected |
| `EngineCPUUtilization` | Below 60% under normal load |
| `DatabaseMemoryUsagePercentage` | Sufficient headroom remaining |
| `ReplicationLag` | 0 on primary shard |

```bash
# Quick check via CLI
aws cloudwatch get-metric-statistics \
  --namespace AWS/ElastiCache \
  --metric-name CurrItems \
  --dimensions Name=ReplicationGroupId,Value=valkey-prod \
  --start-time $(date -u -d '10 minutes ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 60 \
  --statistics Average
```

---

## Troubleshooting

### `NOAUTH` error connecting to ElastiCache

ElastiCache enforces the auth token when in-transit encryption is enabled. Confirm the token was set:

```bash
aws elasticache describe-replication-groups \
  --replication-group-id valkey-prod \
  --query 'ReplicationGroups[0].AuthTokenEnabled'
```

### Source Redis denies `PSYNC` / `REPLCONF`

Some containers run with renamed or ACL-blocked replication commands. Grant the connecting user replication access:

```bash
redis-cli ACL SETUSER shake on >password ~* +@all +@replication
```

Then update `sync.toml` with username:

```toml
[source]
username = "shake"
password = "password"
```

### Key count mismatch after RDB phase

Expected — keys that expired between the RDB snapshot and sync completion will not appear on the destination. Verify with:

```bash
redis-cli INFO keyspace   # compare expired_keys counter
```

### TLS handshake error connecting to ElastiCache

Download the Amazon Root CA and reference it in the config:

```bash
wget https://www.amazontrust.com/repository/AmazonRootCA1.pem
```

Add to `sync.toml`:

```toml
[target]
ca_cert_file = "/path/to/AmazonRootCA1.pem"
```

---

## Key Points to Remember

- **Network path**: redis-shake must have direct network access to both source and destination. Deploy it inside the same VPC as ElastiCache (public subnet with outbound access to source).
- **TLS on ElastiCache**: Always use `rediss://` (double-s) in your application and pass the auth token. The Amazon Root CA must be trusted by your client.
- **Cluster mode mismatch**: If the source is Redis Cluster and target is ElastiCache Cluster, both `[source]` and `[target]` must be set to `type = "cluster"` with the respective config endpoints.
- **Auth token is immutable**: The ElastiCache auth token cannot be changed after cluster creation without recreation. Set it correctly at creation time.
- **Valkey vs Redis OSS**: Valkey is fully API-compatible. No application code changes are required — only the connection string (host, port, TLS, auth token).

---

## Takeaways

- **redis-shake sync mode** enables near-zero-downtime migration by continuously replicating writes while the full dataset transfers — cutting over requires only a 30–60 second maintenance window.
- **ElastiCache Valkey** delivers the same Redis API surface with managed HA, automatic patching, Multi-AZ failover, and native CloudWatch integration.
- The entire cutover window (Step 7) can be as short as **30–60 seconds**, making this safe even for latency-sensitive production workloads.
- After migration, monitor CloudWatch for at least **48 hours** before decommissioning the source container to catch any unexpected memory growth or connection saturation.
