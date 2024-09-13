---
Author:
  - Kumail Rizvi
Author Profile:
  - https://linkedin.com/in/kumail-rizvi
tags:
  - Cilium
  - Kubernetes
  - Monitoring
Creation Date: 2024-09-12T22:02:40
Last Date: 2024-09-12T22:02:40
DocID: KDT-24
drafts: 
References: https://tetragon.io/docs/getting-started/
description: 
Gitlab Link: https://gitlab.com/kumailrizvi70/Tetragon-K8s
---
## What is Tetragon?

**Tetragon** is an open-source eBPF-based observability and security tool developed by Cilium. It provides detailed visibility into system-level events and network activity within a Kubernetes cluster. Tetragon can monitor and trace system calls, such as command executions in containers, making it a powerful tool for debugging and security auditing.

## How Can We Use Tetragon in Kubernetes ?

Tetragon allows you to monitor the execution of commands within Kubernetes pods by leveraging eBPF (extended Berkeley Packet Filter) technology. This enables you to trace system calls and gather detailed logs of command execution, which can be crucial for debugging and auditing.

#### *Key Features:*

- **Tracing**: Monitor and trace system calls like command executions in real-time.
- **Visibility**: Gain insights into what’s happening inside your containers and pods.
- **Security**: Detect and respond to suspicious activities within your cluster.

## Demo with Tetragon

Lets see in action how tetragon works in a kuberentes cluster 

#### Prerequisites

- **Vagrant**: For creating and managing virtualized development environments.
- **VirtualBox**: The virtualization software used with Vagrant

**Link to the repository for Vagrant Environment:** [Tetragon-K8s](https://gitlab.com/kumailrizvi70/Tetragon-K8s)
##### Custom Vagrant box 

- We will use custom vagrant box that would install all the necessary tools like 
   - Minikube 
   - Helm
   - Kubectl 
   - Docker
- This vagrant box would create separate environment to run a kubernetes cluster and to play around with tetragon.
- This Vagrant environment also consist of anisble playbook that would install cilium and tetragon through helm and also helps in setting up cilium and tetragon 
- This playbook would install a demo application on the kubernetes cluster as well 

To run the Vagrant box , run this command 

```shell
vagrant up 
```

To access the vagrant box , run this command 

```shell
vagrant ssh
```

##### Test the Execution Monitoring

At the core of Tetragon is the tracking of all executions in a Kubernetes cluster, virtual machines, and bare metal systems. This creates the foundation that allows Tetragon to attribute all system behavior back to a specific binary and its associated metadata (container, Pod, Node, and cluster).

Tetragon exposes the execution events over JSON logs and GRPC stream. The user can then observe all executions in the system.

You can target the Tetragon DaemonSet with a `kubectl exec` command

```shell
kubectl exec -ti -n kube-system ds/tetragon -c tetragon -- tetra getevents -o compact --pods xwing
```

This command runs `tetra getevents -o compact --pods xwing` in the single Pod that is a member of the Tetragon DaemonSet. Because there is only a single node in the cluster, it is guaranteed that the “xwing” Pod will also be running on the same node and that Tetragon will be able to capture and report execution events.


The `tetra get-events -o compact` command returns a compact form of the execution events. To trigger an execution event, you will run a `curl` command inside the “xwing” Pod/container

Now , open another terminal windows access vagrant box and run this command 

```shell
kubectl exec -ti xwing -- bash -c 'curl https://ebpf.io/applications/#tetragon'
```

The CLI will print a compact form of the event to the terminal similar to the following output. The example output below is from Kubernetes; the Docker output is very similar.

Now you need to check the output of tetragon deamonset 

```shell
🚀 process default/xwing /bin/bash -c "curl https://ebpf.io/applications/#tetragon"
🚀 process default/xwing /usr/bin/curl https://ebpf.io/applications/#tetragon
💥 exit    default/xwing /usr/bin/curl https://ebpf.io/applications/#tetragon 60
```

The compact execution event contains the event type, the pod name, the binary and the args. The exit event will include the return code; in the case of the `curl` command above, the return code was 60.


*An example output can been seen here* 

![[KDT-24-1.png]]

Look for traces of the commands you executed.

### Summary

- **Tetragon**: eBPF-based observability tool from Cilium.
- **Setup**: Use Vagrant and VirtualBox to create a VM environment with Minikube, Docker, kubectl, and Helm.
- **Script**: Automate Minikube setup and installation of Cilium and Tetragon.
- **Testing**: Deploy a sample application and monitor command executions with Tetragon.

We have seen how to use tetragon to monitor the commands execution in a kubernetes cluster 