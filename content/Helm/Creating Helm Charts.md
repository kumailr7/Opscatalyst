---
Author:
  - Kumail Rizvi
Author Profile:
  - https://linkedin.com/in/kumail-rizvi
tags:
  - Kubernetes
  - Helm
Creation Date: 2024-08-21T23:52:31
Last Date: 2024-08-21T23:52:31
drafts: 
References: 
description:
---

### Content Index 

- **What are Helm Charts**
- **Example of creating custom helm charts**
- **Best practices in helm**  
- **Installation of helm chart** 

---

### What are Helm Charts?

Helm charts are packages of pre-configured Kubernetes resources, which can include deployments, services, ingress rules, and more. They allow you to define, install, and upgrade even complex Kubernetes applications in a consistent, reproducible manner.

**Example**:

lets say we have a hello-world ngnix deployment with deployment.yaml and service.yaml 

**Deployment.yaml**

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-world-nginx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hello-world-nginx
  template:
    metadata:
      labels:
        app: hello-world-nginx
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          ports:
            - containerPort: 80
```

**Service.yaml**

```
apiVersion: v1
kind: Service
metadata:
  name: hello-world-nginx
spec:
  type: NodePort
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30036
  selector:
    app: hello-world-nginx
```

---

> [!NOTE]
> ## Why using Custom Helm charts ??
> To manage a single application we need to manage multiple yaml , it would be difficult if we have multiple applications , so helm charts make its easy to package all the kubernetes resources into a single reusable unit and many of the times we have different application and its dependencies so creating custom charts comes handy. 


**Create a Helm Chart:**

```
helm create <chart-name> 
```

**For example:**

```
helm create hello-world-nginx
```

After running this command , helm will create different files in a folder called **"hello-world-nginx"**

Here is an example directory structure

```
hello-world-nginx/
├── Chart.yaml
├── charts/
├── templates/
│   ├── NOTES.txt
│   ├── _helpers.tpl
│   ├── deployment.yaml
│   ├── hpa.yaml
│   ├── ingress.yaml
│   ├── service.yaml
│   ├── serviceaccount.yaml
│   └── tests/
│       └── test-connection.yaml
└── values.yaml
```

## Explanation 

- **Charts.yaml:** This file contains metadata about the chart.
- **templates:** This folder contains all the files regarding application such as deployment configuration , service , etc .
- **values.yaml:** This file contains the default configuration values for the chart.

There are other files and folders which are there but in this blog we aren't going to focusing on it 

**Steps**
1. We will move the deployment and service yaml into the template directory , make sure to remove the files which are unwanted in the template directory before moving 
2. After moving lets head over to the values.yaml file . 

```
replicaCount: 3

image:
  repository: nginx    
  pullPolicy: IfNotPresent
  # Overrides the image tag whose default is the chart appVersion.
  tag: "latest"

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""

service: 
  type: ClusterIP 
  port: 80 
  
ingress: 
  enabled: false 
  className: "" 
  annotations: {} 
  hosts: 
    - host: chart-example.local 
      paths: 
        - path: / 
        - pathType: ImplementationSpecific 
tls: []

```

in the above values.yaml we will focus on the  ==replicaCount== and the ==image==  section 
here we change the tag to latest so that it would pick up latest tag of nginx image 

3. After making changes in values.yaml lets move to deployment.yaml so that we can map the values in the yaml file 

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-nginx
spec:
  replicas: {{.Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}-nginx
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}-nginx
    spec:
      containers:
        - name: {{ .Values.image.repository }}
          image: { .Values.image.repository }}:{{ .Values.image.tag }}
          ports:
            - containerPort: 80

```

Now you have seen changes in the deployment.yam file , notice a change when mapping 
in the name section the **{{ . Release.Name }}** both of the initial are pascal case with `{{ }}`

- The double curly braces `{{ }}` are used to denote a template expression. 
-  `Release.Name` is a built-in variable in Helm that refers to the name of the release. In this context, `Release` is an object that contains metadata about the release, and `Name` is a property of that object. 
- We will pass this `Release-Name` when install helm chart such as `helm install <Release-Name> ./hello-world-nginx`
- There are a lots of Built-in-variables in helm , take a look here :- https://helm.sh/docs/chart_template_guide/builtin_objects/
- The **{{ .Values.image.repository }}**  are the values fetched from values.yaml  
-  This file can be passed as `helm install -f flag ( helm install -f myvals.yaml ./mychart)`
-  individual parameters passed with `--set` (such as `helm install --set foo=bar ./mychart`)

4. Now lets make the same changes in service.yaml

```
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}-nginx
spec:
  type: NodePort
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30036
  selector:
    app: {{ .Release.Name }}-nginx
```

5. After making necessary changes now lets install the helm chart on the cluster , but before it is best practice to run the helm charts in a `dry-run`  state and to check if the values are mapped we can use `template` also to check the indentation of the yaml we can use `lint` commands which are built in commands to check the charts before running the main command 

- ## helm lint

```
helm lint <chart-name>
```


**For example:**

Assume you have a Helm chart directory named `hello-world-nginx`. To lint this chart, you would run:

```
helm lint ./hello-world-nginx
```


 **Sample Output:**

```
==> Linting ./hello-world-nginx
[INFO] Chart.yaml: icon is recommended
[WARNING] templates/: directory not found

1 chart(s) linted, 0 chart(s) failed

```

- ## helm template:

The `helm template` command renders your Helm chart locally and displays the output without deploying it to the Kubernetes cluster.

```
helm template <chart-name>
```

**For example:**

```
helm template ./hello-world-nginx
```

### Sample Output:

This command will render the chart templates and display the resulting YAML:


```
# Source: hello-world-nginx/templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-world-nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello-world-nginx
  template:
    metadata:
      labels:
        app: hello-world-nginx
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          ports:
            - containerPort: 80
---
# Source: hello-world-nginx/templates/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: hello-world-nginx
spec:
  type: NodePort
  selector:
    app: hello-world-nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
      nodePort: 30036
```

Here you can see the values which were there in the values.yaml are mapped correctly on the deployment and service yaml files

- Using `--dry-run` with `helm install`

The `helm install` command with the `--dry-run` option simulates an installation of the chart without actually deploying it. This is useful for verifying what the chart will do.

```
helm install my-release ./hello-world-nginx --dry-run
```

**Sample Output:**

This command simulates the installation and shows the rendered templates along with other details

```
NAME: my-release
LAST DEPLOYED: Tue Jul  2 10:00:00 2024
NAMESPACE: default
STATUS: pending-install
REVISION: 1
TEST SUITE: None
HOOKS:
MANIFEST:

---
### Source: hello-world-nginx/templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-world-nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello-world-nginx
  template:
    metadata:
      labels:
        app: hello-world-nginx
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          ports:
            - containerPort: 80
---
### Source: hello-world-nginx/templates/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: hello-world-nginx
spec:
  type: NodePort
  selector:
    app: hello-world-nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
      nodePort: 30036

```

These commands help you validate and understand what the Helm chart will deploy, allowing you to catch any issues before they affect your cluster.


6. After checking the linting and verification of charts , now we will move on installation of helm charts , to install the chart we will run this command 

```
helm install hello-world ./hello-world-nginx
```

**Sample Output:**

```
NAME: hello-world 
LAST DEPLOYED: Tue Jul 2 12:00:00 2024 
NAMESPACE: default 
STATUS: deployed 
REVISION: 1 
TEST SUITE: None 
NOTES: 
1. Get the application URL by running these commands: 
export NODE_PORT=$(kubectl get --namespace default -o jsonpath="  {.spec.ports[0].nodePort}" services hello-world-nginx) 
export NODE_IP=$(kubectl get nodes --namespace default -o jsonpath="{.items[0].status.addresses[0].address}") 
echo http://$NODE_IP:$NODE_PORT
```

### Breakdown

- **NAME**: The name of the Helm release (`hello-world`).
- **LAST DEPLOYED**: The timestamp when the chart was deployed.
- **NAMESPACE**: The Kubernetes namespace where the resources are deployed.
- **STATUS**: The status of the release (`deployed`).
- **REVISION**: The revision number of the release.
- **TEST SUITE**: Information about test suites (if any).
- **NOTES**: Custom notes provided by the chart, often including useful commands for accessing the deployed application.
- **MANIFEST**: The Kubernetes manifests generated from the Helm templates, showing the resources that have been created (e.g., Deployment, Service).

7. We will check the helm installation by running 

```
helm list 
```

**Sample Output:**

```
NAME            NAMESPACE       REVISION    UPDATED                                 STATUS      CHART                  APP VERSION
hello-world     default         1           2024-07-02 12:00:00.000000 -0500 CDT    deployed    hello-world-nginx-0.1.0  1.16.0
```

### Breakdown

- **NAME**: The name of the Helm release (e.g., `hello-world`).
- **NAMESPACE**: The Kubernetes namespace where the release is deployed (e.g., `default`).
- **REVISION**: The revision number of the release (e.g., `1`).
- **UPDATED**: The timestamp when the release was last updated (e.g., `2024-07-02 12:00:00.000000 -0500 CDT`).
- **STATUS**: The current status of the release (e.g., `deployed`).
- **CHART**: The name and version of the Helm chart used for the release (e.g., `hello-world-nginx-0.1.0`).
- **APP VERSION**: The version of the application that the chart installs (e.g., `1.16.0`).

We have created our own helm chart and implemented best practices over it 
Let's continue exploring Helm's capabilities together! **Happy Helming !!**







