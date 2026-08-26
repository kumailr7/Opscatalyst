---
Author:
  - Kumail Rizvi
Author Profile:
  - https://linkedin.com/in/kumail-rizvi
tags:
  - Portfolio
  - About
Creation Date: 2026-08-26T00:00:00
Last Date: 2026-08-26T00:00:00
drafts: false
References:
description: Kumail Rizvi — DevOps/cloud architect. Bio, current projects, and stack.
---

<img src="./assets/kumail-rizvi.png" alt="Kumail Rizvi" style="width:140px;border-radius:8px;display:block;margin:0 0 1rem 0;" />

I'm Kumail. I've been doing DevOps for 6+ years now, mostly architecture and cloud work across AWS, Azure, and GCP — helping teams figure out the right setup, then usually getting pulled in later to fix the parts that grew faster than anyone planned for. Currently working as **DevOps Architect @ Codeblaze**.

These days I spend a lot of time messing with agentic AI, getting multiple agents to actually work together instead of stepping on each other, and even more time on my homelab, which exists mostly so I can break things on hardware I own before I break them on hardware someone's paying me not to.

This site is where I dump notes so I don't have to relearn the same things twice. I also built [hub.devops-dojo.ninja](https://hub.devops-dojo.ninja) — a place for people learning DevOps to figure things out together instead of alone.

Outside of that I spend a fair bit of time helping people directly — DevOps questions, cloud architecture decisions, career guidance, that kind of thing. I run a WhatsApp group of 200+ folks doing the same, mostly just people helping each other get unstuck.

## Featured Projects

### ErsatzGPU

**Stack:** Python (simulation engine), FastAPI, Next.js, Kubernetes (KWOK-simulated fleet, fake GPU device-plugins/MIG), Grafana, Prometheus, Langfuse, GitHub Actions, k3d

Learn how a real GPU datacenter actually works, with zero GPUs. ErsatzGPU simulates the math (VRAM, KV cache, topology, cost), the Kubernetes scheduling of a 100+ node fake-GPU fleet, and a real Grafana/Prometheus/Langfuse observability stack — so anyone can learn distributed training/inference internals and GPU-datacenter operations on a laptop, no hardware or cloud bill required. Every number is computed from the same formulas that govern real hardware, so it responds correctly to input changes the same way a real cluster would.

- Simulates prefill/decode serving, PagedAttention, speculative decoding, and disaggregated-vs-colocated serving tradeoffs
- Ships a reusable GitHub Actions workflow that deploys the whole stack to a real k3d cluster and asserts GPU scheduling + a training run + a real inference round trip all work
- [github.com/devops-dojo7/ErsatzGPU](https://github.com/devops-dojo7/ErsatzGPU)

### KumoStack

**Stack:** Python, Docker, Terraform-compatible API surface (AWS SigV4)

Free, open-source local AWS emulator built after LocalStack moved its core services behind a paid plan. Drop-in compatible with `boto3`, the AWS CLI, Terraform, CDK, and Pulumi.

- 60+ AWS services emulated on a single port, with multi-account & multi-region support on one endpoint
- Backs services with real infrastructure — RDS spins up actual Postgres/MySQL containers, ElastiCache spins up real Redis/Valkey, ECS runs real Docker containers
- ~270MB image and ~30MB RAM at idle vs. LocalStack's ~1GB image and ~500MB RAM; starts in under 2 seconds
- [github.com/kumailr7/kumostack](https://github.com/kumailr7/kumostack)

### Alexa ↔ Autobots Bridge

**Stack:** Python, FastAPI, Alexa Custom Skill, ngrok

Voice-control an agentic DevOps team via an Echo Dot. A FastAPI `/alexa` endpoint routes Alexa voice commands ("Alexa, ask Autobots to deploy staging") through an `AutobotsRouter` to the right agent — deploy, status, rollback, or scale.

- [github.com/kumailr7/alexa-autobots](https://github.com/kumailr7/alexa-autobots)

### DevOps Dojo Hub

**Stack:** Cloudflare (DNS/security), Vercel (frontend), Clerk (auth/authz), Render + Docker (backend), Redis Cloud, MongoDB Atlas, Doppler (secrets), Cloudflare R2 (storage), UptimeRobot (uptime/healthcheck), k6 + Grafana Cloud (load testing/observability)

Community platform for people learning DevOps to work through problems together instead of alone. Every service in the stack is open-source and running on a free tier, load-tested with k6 to handle up to 900 concurrent users.

![[devops-dojo-hub-stack.png]]

- [hub.devops-dojo.ninja](https://hub.devops-dojo.ninja)

## Skills & Tools

- **Cloud:** AWS, Azure, GCP
- **IaC:** Terraform, CDK, Pulumi, CloudFormation, Vagrant
- **Containers/Orchestration:** Docker, Kubernetes, Helm, Nomad
- **CI/CD:** GitHub Actions, Azure DevOps, GitLab, Jenkins
- **Security:** Canarytokens, Wazuh, AWS GuardDuty
- **AI:** Agent orchestration, Hermes, RAG, vector DBs, Claude, OpenAI, OpenCode, Langfuse
- **Languages:** Python, Bash
- **Observability:** Grafana, Prometheus, VictoriaMetrics, New Relic, Last9, Datadog

## Writing

Deep dives on the stuff above live on this site — browse by [[tags/index|tag]] or start from the [[index|home page]].

## Get in Touch

- 💼 [LinkedIn](https://linkedin.com/in/kumail-rizvi)
- 🚀 [DevOps Dojo Hub](https://hub.devops-dojo.ninja)
- 🐛 [Found an issue with a post? Let me know](https://github.com/kumailr7/Devops-Dojo/issues)

[[index|Back to home page]]
