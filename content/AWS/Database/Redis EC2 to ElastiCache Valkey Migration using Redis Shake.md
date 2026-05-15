---
Author:
  - Kumail Rizvi
Author Profile:
  - https://linkedin.com/in/kumail-rizvi
tags:
  - AWS
  - Database
  - Redis
  - ElastiCache
  - Valkey
Creation Date: 2026-05-16T00:00:00
Last Date: 2026-05-16T00:00:00
DocID: DB-26
drafts: false
References:
  - https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/valkey-migration.html
  - https://github.com/tair-opensource/RedisShake
  - https://valkey.io/
description: Step-by-step guide to migrate a self-managed Redis cluster on EC2 to Amazon ElastiCache for Valkey using Redis Shake — with zero data loss and minimal downtime.
Github Link:
---

## Abstract
---

Running Redis on EC2 means you own everything — patching, failover, replication, backups. **Amazon ElastiCache for Valkey** hands all of that to AWS while giving you a Redis-compatible, open-source-backed cache engine at lower cost than ElastiCache for Redis.

This guide walks through a live migration from a **self-managed Redis 7.x on EC2** to **ElastiCache Valkey 8.x** using **Redis Shake** — a battle-tested open-source tool that replicates data in real time via Redis's own replication protocol.

> [!tip] Why Valkey?
> Valkey is the Linux Foundation fork of Redis, fully compatible with Redis 7.2 API. ElastiCache for Valkey is up to **33% cheaper** than ElastiCache for Redis OSS on equivalent node types.

---

## Architecture Diagram
---

![[redis-ec2-to-valkey-migration.png]]

**Flow:**
1. Redis Shake connects to source EC2 Redis as a replica (SYNC command)
2. It streams RDB snapshot + live AOF commands to ElastiCache Valkey
3. CloudWatch captures migration metrics and logs
4. Secrets Manager holds the ElastiCache AUTH token

---

## Prerequisites
---

| Requirement | Detail |
|-------------|--------|
| Source | Redis 7.x on EC2, `requirepass` or no auth |
| Destination | ElastiCache Valkey cluster (cluster mode disabled or enabled) |
| Migration Host | EC2 instance with network access to both endpoints |
| Tool | Redis Shake v4+ |
| Security Groups | Migration EC2 → port 6379 (source), port 6380 TLS (ElastiCache) |

> [!caution] Cluster Mode
> If your EC2 Redis uses cluster mode, set `cluster_mode: true` in Redis Shake config and target an ElastiCache Valkey cluster-mode-enabled replication group.

---

## Step 1 — Provision ElastiCache for Valkey
---

```bash
# Create a Valkey 8.x replication group (cluster mode disabled)
aws elasticache create-replication-group \
  --replication-group-id valkey-prod \
  --replication-group-description "Production Valkey" \
  --engine valkey \
  --engine-version 8.0 \
  --cache-node-type cache.r7g.large \
  --num-cache-clusters 2 \
  --automatic-failover-enabled \
  --at-rest-encryption-enabled \
  --transit-encryption-enabled \
  --auth-token "$(aws secretsmanager get-secret-value \
      --secret-id valkey/auth-token \
      --query SecretString --output text)" \
  --cache-subnet-group-name your-subnet-group \
  --security-group-ids sg-xxxxxxxx
```

Wait for status `available`:

```bash
aws elasticache describe-replication-groups \
  --replication-group-id valkey-prod \
  --query 'ReplicationGroups[0].Status'
```

> [!note] TLS Required
> ElastiCache Valkey enforces TLS (`transit-encryption-enabled`). Redis Shake will connect on port **6380** with `--tls` flags.

---

## Step 2 — Prepare Source EC2 Redis
---

Redis Shake connects to source Redis as a **replica** using the `SYNC`/`PSYNC` protocol. Ensure:

```bash
# On source Redis EC2 — check replication is not blocked
redis-cli -h localhost -p 6379 CONFIG GET repl-backlog-size
# Recommend >= 512mb for large datasets
redis-cli -h localhost -p 6379 CONFIG SET repl-backlog-size 536870912

# Check bind address — must be reachable from migration EC2
redis-cli -h localhost -p 6379 CONFIG GET bind
```

Update Security Group of source EC2 to allow inbound 6379 from the **migration EC2's private IP**.

---

## Step 3 — Launch Migration EC2 and Install Redis Shake
---

```bash
# Launch a migration EC2 in the same VPC (Amazon Linux 2023)
# t3.medium is sufficient for most datasets

# Install Redis Shake
curl -Lo redis-shake.tar.gz \
  https://github.com/tair-opensource/RedisShake/releases/download/v4.3.0/redis-shake-linux-amd64.tar.gz

tar -xzf redis-shake.tar.gz
chmod +x redis-shake
```

---

## Step 4 — Configure Redis Shake
---

Create `shake.toml`:

```toml
[function]
# sync = live replication (RDB + AOF stream)
# restore = one-shot RDB only
mode = "sync"

[source]
type = "standalone"
address = "10.0.1.50:6379"        # source EC2 Redis private IP
password = ""                      # leave empty if no auth
# username = ""                   # Redis 6+ ACL username if needed

[target]
type = "standalone"
address = "valkey-prod.xxxxxx.ng.0001.use1.cache.amazonaws.com:6380"
password = "your-auth-token"       # ElastiCache AUTH token
tls = true
tls_skip_verify = false            # set true only for testing

[advanced]
# Parallel workers for RDB restore phase
ncpu = 4

# Key filter — migrate all keys (default)
# key_exists = "rewrite"          # overwrite existing keys at target

[log]
level = "info"
```

> [!warning] TLS Certificate
> ElastiCache uses AWS-signed certificates. If you hit TLS verification errors, download the AWS CA bundle:
> ```bash
> curl -o /etc/ssl/certs/aws-ca.pem \
>   https://www.amazontrust.com/repository/AmazonRootCA1.pem
> ```
> Then set `tls_ca_cert = "/etc/ssl/certs/aws-ca.pem"` in `[target]`.

---

## Step 5 — Run Redis Shake
---

```bash
# Start in screen / tmux so it survives SSH disconnection
screen -S redis-shake

./redis-shake shake.toml
```

**Phase 1 — RDB sync (initial full copy):**

```
[INFO] 2026/05/16 source: standalone, address: 10.0.1.50:6379
[INFO] 2026/05/16 RDB file size: 2.3 GB
[INFO] 2026/05/16 RDB restore: 100% (2.3GB/2.3GB) — elapsed: 4m12s
```

**Phase 2 — AOF live streaming:**

```
[INFO] 2026/05/16 entering live replication mode
[INFO] 2026/05/16 replication lag: 0ms
[INFO] 2026/05/16 commands/sec: 3420 | keys synced: 18,432,100
```

Once lag hits **0ms** and commands/sec stabilises, the target is caught up.

---

## Step 6 — Validate Data
---

Run key count and spot-check comparison before cutover:

```bash
# Source key count
redis-cli -h 10.0.1.50 -p 6379 DBSIZE

# Target key count (via TLS)
redis-cli -h valkey-prod.xxxxxx.ng.0001.use1.cache.amazonaws.com \
  -p 6380 --tls -a "your-auth-token" DBSIZE

# Spot-check a known key
redis-cli -h 10.0.1.50 -p 6379 GET "session:user:12345"

redis-cli -h valkey-prod.xxxxxx.ng.0001.use1.cache.amazonaws.com \
  -p 6380 --tls -a "your-auth-token" GET "session:user:12345"
```

> [!tip] Full Validation
> For a thorough diff, use `redis-shake verify` mode or pipe `SCAN` + `GET` across both endpoints via a comparison script.

---

## Step 7 — Cutover
---

1. **Put application in maintenance mode** (or use feature flag to pause writes)
2. Wait for Redis Shake lag to reach **0ms**
3. Update application config / environment variables:
   ```bash
   REDIS_HOST=valkey-prod.xxxxxx.ng.0001.use1.cache.amazonaws.com
   REDIS_PORT=6380
   REDIS_TLS=true
   REDIS_PASSWORD=your-auth-token
   ```
4. Deploy / restart application pods / services
5. Verify application is reading/writing to Valkey
6. Stop Redis Shake (`Ctrl+C`)
7. Decommission source EC2 Redis after soak period (1–2 days)

---

## Key Considerations
---

| Aspect | Detail |
|--------|--------|
| **Downtime** | Near-zero — only app restart at cutover |
| **Data integrity** | Redis Shake uses native PSYNC — no data transformation |
| **Cluster mode** | Supported — set `type = "cluster"` in `[source]` and `[target]` |
| **Large datasets** | Increase `repl-backlog-size` on source to avoid full resync on lag spike |
| **Key TTLs** | Replicated accurately via RDB + AOF |
| **AUTH migration** | Source no-auth → target AUTH token is fully supported |
| **Lua scripts** | Loaded scripts not replicated — re-register `SCRIPT LOAD` on target |
| **ElastiCache limits** | Max item size 512 MB, max key length 250 bytes |

---

## Rollback Plan
---

If issues arise post-cutover:

1. Revert application config to source EC2 Redis endpoint
2. Restart application — source Redis was never modified, data is intact
3. Investigate Valkey issue before re-attempting migration

> [!caution] Do NOT stop source Redis until soak period is complete and you are confident in the migration.

---

## References
---
- [AWS ElastiCache — Migrating to Valkey](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/valkey-migration.html)
- [Redis Shake GitHub](https://github.com/tair-opensource/RedisShake)
- [Valkey Official Site](https://valkey.io/)
- [ElastiCache Valkey Pricing](https://aws.amazon.com/elasticache/pricing/)
