---
Author:
  - Kumail Rizvi
Author Profile:
  - https://linkedin.com/in/kumail-rizvi
tags:
  - Kubernetes
Creation Date: 2024-09-19T11:36:58
Last Date: 2024-09-19T11:36:58
DocID: SDP-24
drafts: 
References: https://kubernetes.io/docs/concepts/storage/persistent-volumes/
description: 
Github Link:
---
## Static vs Dynamic Provisioning in Kubernetes: Deep Dive into Persistent Storage 🛠️

In the world of **Kubernetes**, managing persistent storage is crucial when dealing with stateful applications like databases or services that need to retain data even after a pod is destroyed. One key aspect is **provisioning** storage, which can be handled using **static** or **dynamic provisioners**. Let’s dive into what they are and how they work! 🚀

### Static Provisioning 📦

With **static provisioning**, the admin manually creates the storage resources (like a Persistent Volume or PV) ahead of time. These volumes are fixed and predefined, meaning they need to exist before a pod can claim them. Think of it as pre-ordering storage space—pods get assigned to these volumes that already exist.

👉 **Scenario**: If you know exactly how much storage you need, and you want complete control over your storage resources, **static provisioning** is a good option. However, it lacks flexibility because volumes must be created beforehand.

### Dynamic Provisioning ⚙️

Dynamic provisioning allows Kubernetes to automatically create storage resources on demand when a Persistent Volume Claim (PVC) is made. You don’t have to create Persistent Volumes (PV) manually—Kubernetes does that for you by leveraging a **StorageClass**.

👉 **Scenario**: For cloud environments or when you don’t want to manage individual volumes, dynamic provisioning is a better fit. It allows Kubernetes to request and create storage as pods need it, providing flexibility and scalability.

---

### 🗄️ What is a StorageClass?

A **StorageClass** defines how storage is provisioned dynamically. It acts as a blueprint for creating Persistent Volumes and contains details like provisioner type, parameters, and reclaim policies. By specifying a StorageClass, you instruct Kubernetes to provision storage using certain attributes (like SSDs or HDDs, replication settings, etc.). 
This Storage class can have multiple storage or request storage  like AWS S3 , Net App or Azure Storage 

Think of it like a catalog of storage types! 📚

Here’s an example of a StorageClass for **GCEPersistentDisk**:

```Yaml
apiVersion: storage.k8s.io/v1 
kind: StorageClass 
metadata: 
 name: fast 
provisioner: kubernetes.io/gce-pd 
parameters: 
 type: pd-ssd
```

In this example, the **pd-ssd** type will create fast, SSD-backed persistent disks dynamically whenever a PVC requests it!

---

### 🗂️ Persistent Volumes (PV) and Persistent Volume Claims (PVC)

Now that we know about provisioners, let’s move to **Persistent Volumes (PV)** and **Persistent Volume Claims (PVC)**.

#### Persistent Volumes (PV) 📀

A **Persistent Volume** is a piece of storage in the cluster that has been provisioned by the admin (in static provisioning) or dynamically by Kubernetes (in dynamic provisioning). A PV is a resource in the cluster, just like nodes or pods.

#### Persistent Volume Claims (PVC) 🎟️

A **Persistent Volume Claim** is how pods request storage. Think of a PVC as a ticket a pod uses to claim a specific storage resource (PV). When a pod specifies a PVC, Kubernetes will automatically bind it to an appropriate PV. If no matching PV exists, and you have dynamic provisioning set up, Kubernetes will create one automatically.

Here’s how a PVC works with dynamic provisioning:

1. A pod requests storage by making a **Persistent Volume Claim (PVC)**.
2. Kubernetes checks if there is an available **Persistent Volume (PV)** that matches the claim.
3. If a matching PV isn’t available, Kubernetes creates one dynamically based on the **StorageClass** defined.
4. The PVC is then bound to the newly created or existing PV.

### 🧑‍💻 Example of PVC and Dynamic Provisioning

Here’s an example where a pod requests storage dynamically:

```Yaml
apiversion: v1
kind: PersistentVolumeClaim
metadata:  
  name: my-pvc
spec:  
 accessModes:    
  - ReadWriteOnce  
storageClassName: fast  
resources:    
 requests:      
   storage: 10Gi
```

In this case, when the PVC `my-pvc` is applied, Kubernetes will dynamically provision a 10Gi **Persistent Volume** based on the **StorageClass** called `fast` (which, as we saw earlier, specifies SSDs). Once provisioned, the PVC will automatically be bound to the PV, and the pod will be able to use that storage.

A Diagrammatic Representation of Storage Class shared between nodes

![[SDP-24-1.png]]


Another example of Persistent Volume pointing to the cluster via PVC 

![[SDP-24-2.png]]

> [!PRO TIP]
> 
> 💡 Always use **dynamic provisioning** for a more scalable, efficient Kubernetes environment! Your infrastructure team will thank you for it! 🙌


---

### 🛠️ Wrapping Up: Choosing Static vs Dynamic Provisioning

- **Static provisioning**: 🛠️ Manually managed volumes, offering full control but limited flexibility.
- **Dynamic provisioning**: 🔄 Automatically managed volumes, offering flexibility and scalability, especially for cloud-native apps.

When managing storage, dynamic provisioning with **StorageClasses** is often preferred due to its flexibility and ability to scale with the needs of your pods. 🚀

---

*Have you tried both methods? What challenges have you faced with storage provisioning in Kubernetes? Let me know in the comments! 👇*

