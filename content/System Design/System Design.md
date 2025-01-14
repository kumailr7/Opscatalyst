---
Author:
  - Kumail Rizvi
Author Profile:
  - https://linkedin.com/in/kumail-rizvi
tags:
  - system_design
Creation Date: 2023-12-30, 01:04
Last Date: 2024-02-22T18:09:12+08:00
References: 
draft: 
---
## Abstract
---
- Designing robust and efficient systems that fulfil the needs of [[Host#Client]] smoothly 
- [Kahoot! Quizzes](https://create.kahoot.it/share/availability-vs-scalability-vs-fault-tolerance-vs-reliability/89d22c1e-ff30-4f17-b65f-f1f7c0e37866) to learn about [[#Availability]] vs [[#Scalability]] vs [[#Fault Tolerance]] vs [[#Reliability]]

## Availability
---
- **Refers to** the percentage of time that a system is operational and available for use
- **It ensures** the system is accessible when needed, minimizing downtime and maintaining a consistent user experience
- Can be achieved directly using [[Database Replication#High Availability|Database Replication]], [[Multi Data Center Setup]] or indirectly with good [[#Fault Tolerance]] and good [[#Reliability]]

## Scalability
---
- **Refers to** the capability of a system to handle a growing amount of work, or its potential to be enlarged to accommodate that growth
- **It ensures** system can handle increased load efficiently by adding resources or optimizing existing ones. It ensures that the system can grow to meet the demands of a larger user base or increased data volume, ensuring [[#Availability]]
- Can be achieved with [[Cache Server]], [[Compute Server#Stateless Compute Server]], [[Message Queue]] & [[Database Scaling]]

### Vertical Scaling
- Basically adding more [[CPU]] and [[Main Memory]] to a single [[Host#Server]]
- Simple to implement, great option when traffic is low


#### Vertical Scaling Limitations
**Hard Limit**
- It is impossible to add unlimited [[CPU]], [[Main Memory]] & [[Disk]] etc to a single [[Host#Server]]

**No Failover**
- [[#Single Point of Failure]]. No [[#Fault Tolerance]]

**Expensive**
- Powerful servers are much more expensive

### Horizontal Scaling
- Basically adding more [[Host#Server]], handle the traffic in [[Concurrency #Parallelism]]
- More desirable for large scale applications due to [[#Vertical Scaling Limitations]]
- Usually has a [[Load Balancer]] sits between the client and server, to distribute the traffic evenly to the servers

## Fault Tolerance
---
- **Refers to** a system's ability to continue operating and providing its intended services even in the presence of hardware or software faults
- **It ensures** that a system can recover from failures, keeping disruptions minimal and maintaining the [[#Availability]] of services
- **Fault Tolerance** for **stateless system** can be achieved with [[Load Balancer#Failover Capability|Load Balancer's Failover Capability]] with [[Compute Server#Stateless Compute Server]] etc
- **Fault Tolerance** for **stateful system** can be achieved with [[Database Replication#High Fault Tolerance|Database Replication]] and [[Replicated State Machine]] etc
- Or both with [[Multi Data Center Setup]]

### Single Point of Failure
<img src="https://proxy-prod.omnivore-image-cache.app/0x0,snXjF9Ub2BnqAv7-t65xgQIxxskkFXoFQ0Yu-f0GeEoo/https://bytebytego.com/_next/image?url=%2Fimages%2Fcourses%2Fsystem-design-interview%2Fscale-from-zero-to-millions-of-users%2Ffigure-1-8-AVKYQBAQ.png&w=828&q=75" height="300">

- A part of a system that, if it fails, will stop the entire system from working

## Reliability
---
- **Refers to** the ability of a system to perform a specified function *without failure over a specified period*
- **It ensures** consistent and predictable behavior of a system. It involves minimizing the chances of failures and, in case of failures, having mechanisms in place for quick recovery
- Can be achieved with [[Monitoring]] and automation like ci/cd pipeline


## References
---
- [ByteByteGo](https://bytebytego.com/courses/system-design-interview/scale-from-zero-to-millions-of-users)




