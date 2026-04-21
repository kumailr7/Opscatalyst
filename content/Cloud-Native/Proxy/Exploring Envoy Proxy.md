---
Author:
  - Kumail Rizvi
Author Profile:
  - https://linkedin.com/in/kumail-rizvi
tags:
  - Kubernetes
  - Proxy
Creation Date: 2024-08-22T11:14:42
Last Date: 2024-08-22T11:14:42
DocID: EEP-24
drafts: 
References: https://www.envoyproxy.io
description: The Swiss Army Knife of Networking
---

## 🔍 **What is Envoy Proxy?** 

Envoy Proxy is an open-source edge and service proxy designed for cloud-native applications. It was originally developed at Lyft to handle their microservices network traffic efficiently. Envoy acts as a communication bus and data plane for distributed applications, providing advanced networking features. This project is an CNCF graduated project 


![[Envoy-Proxy.png]]

## 🌐 **Network Rules with Envoy:**

🔷 **Edge Proxy [North - South Traffic]:** 

Envoy can be deployed as an edge proxy to manage external traffic entering your network. It handles tasks such as SSL termination, load balancing, rate limiting, and authentication, ensuring secure and efficient access to your services.

- **SSL Termination:** Envoy can handle SSL/TLS termination, which means it can decrypt incoming encrypted traffic and pass the unencrypted traffic to the backend services. This offloads the CPU-intensive decryption process from your backend services, improving their performance.
    
- **Load Balancing:** Envoy distributes incoming traffic across multiple backend servers to ensure no single server becomes a bottleneck. It supports various load balancing algorithms like round-robin, least connections, and consistent hashing.
    
- **Rate Limiting:** Envoy can enforce rate limits on incoming requests to prevent abuse and ensure fair usage of resources. This is particularly useful for protecting your services from DDoS attacks or other forms of traffic spikes.
    
- **Authentication:** Envoy can handle authentication and authorization of incoming requests, ensuring that only authenticated and authorized users can access your services. This can be integrated with various identity providers and authentication mechanisms.


![[Edge-Proxy.png]]


🔷 **Middle Proxy [West - EastTraffic]:** 

As a middle proxy, Envoy sits between different microservices, enabling service-to-service communication. It provides features like service discovery, retries, circuit breaking, and observability, helping to build resilient and reliable microservice architectures.

- **Service Discovery:** Envoy dynamically discovers service endpoints using service discovery mechanisms (like Consul, Kubernetes, etc.) and updates its routing tables accordingly. This ensures that requests are always routed to available and healthy service instances.
    
- **Retries:** Envoy can automatically retry failed requests to improve the reliability of service communications. This is particularly useful for transient errors and network glitches.
    
- **Circuit Breaking:** Envoy implements circuit breaking to prevent cascading failures within your microservices architecture. If a service becomes unhealthy, Envoy can stop sending requests to it, allowing the service to recover without overwhelming it with new requests.
    
- **Observability:** Envoy provides rich observability features, including detailed metrics, logging, and distributed tracing. This helps in monitoring and debugging service communications, ensuring high visibility into the health and performance of your microservices.

![[Middle-Proxy.png]]


🔷 **Service Proxy [West - East with Sidecar]:** 

Deployed as a sidecar next to your application instances, Envoy acts as a service proxy. It facilitates advanced traffic routing, health checks, and telemetry collection, ensuring that your services are performant and easy to monitor.

- **Advanced Traffic Routing:** Envoy can perform sophisticated traffic routing, including path-based routing, header-based routing, and traffic splitting. This allows for advanced deployment strategies like blue-green deployments and canary releases.
    
- **Health Checks:** Envoy can perform health checks on your application instances, ensuring that only healthy instances receive traffic. This helps in maintaining the overall health and availability of your services.
    
- **Telemetry Collection:** Envoy collects telemetry data, including metrics and logs, which can be sent to monitoring and logging systems. This data is crucial for understanding service performance, identifying issues, and optimizing resource usage.

![[Service-proxy.png]]

## ⚙️ **Why Use Envoy?**

🔹 **High Performance:** Optimised for low latency and high throughput.

🔹 **Extensibility:** Easily integrates with various ecosystems and tools.

🔹 **Observability:** Rich metrics, logging, and tracing capabilities.

🔹 **Resiliency:** Advanced features for fault tolerance and reliability.

Envoy Proxy is a versatile tool that can significantly enhance the network management capabilities of your microservices architecture. Whether it's handling external traffic, managing internal service communications, or ensuring service resilience, Envoy has got you covered!

🔗 Learn more about Envoy Proxy: https://www.envoyproxy.io

--- 
