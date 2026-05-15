---
Author:
  - Kumail Rizvi
Author Profile:
  - https://linkedin.com/in/kumail-rizvi
tags:
  - Kubernetes
  - Helm
Creation Date: 2024-08-21T23:44:59
Last Date: 2024-08-21T23:44:59
drafts: 
References: 
description:
---


## Content index 

- **Functions**
- **Conditional**
- **Ranges & Blocks**
- **Chart Hooks**
- **Chart Test**
- **Packaging & Signing helm charts**
- **Uploading helm charts**
- **OCI Registries**

---

## Functions 

Helm functions are templating tools used in Helm charts to dynamically generate Kubernetes manifests. They allow for variable substitution, loops, conditionals, and more. Helm functions make your Helm charts more flexible and reusable.

**Example of Helm Function**

Let's create a simple Helm chart for deploying an NGINX 'hello-world' application. We'll use Helm functions like `indent` and `quote`. There are many but we will take two functions as example 

**Detail Steps:**

1. Create a new Helm chart:
```
helm create hello-world
```

2.  After creating a chart we will have `values.yaml`  , lets modify it 

```
replicaCount: 2
image:
  repository: nginx
  tag: latest
```

3.  Update the `templates/deployment.yaml` file  to use Helm functions:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: "{{ .Release.Name }}"-nginx
  labels:
    app: "{{ .Chart.Name }}"
spec:
  replicas: "{{ .Values.replicaCount }}"
  selector:
    matchLabels:
      app: "{{ .Chart.Name }}"
  template:
    metadata:
      labels:
        app: "{{ .Chart.Name }}"
    spec:
      containers:
      - name: nginx
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag | quote }}"
        ports:
        - containerPort: 80
```



Here the ==image== under the spec is having the name of image under quote ie: "ngnix" 
so we will use `quote` function with `|` pipe  so it will be having image name as "nginx".
now we will see `indent` function 

The `indent` function in Helm charts is used to add a specified number of spaces at the beginning of each line of the given string. This is particularly useful in Helm templates when you need to ensure the proper indentation of the rendered YAML

The `indent` function in Helm charts is used to add a specified number of spaces at the beginning of each line of the given string. This is particularly useful in Helm templates when you need to ensure the proper indentation of the rendered YAML

**Example of INDENT Function**

Assume you have a ConfigMap template:

```yaml
apiversion: v1
kind: ConfigMap
metadata:  
  name: {{ .Release.Name }}-config
data:  
  config.yaml: |    
    {{ .Values.config | indent 4 }}
```


In this example, `.Values.config` is a multi-line string that should be properly indented within the `data` field of the ConfigMap. The `indent 4` ensures that each line of the `.Values.config` string is indented by 4 spaces, preserving the YAML structure.

**Usage in the Provided Template**

Include a ConfigMap within the Deployment spec and ensure correct indentation, you might do something like this:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: "{{ .Release.Name }}"-nginx
  labels:
    app: "{{ .Chart.Name }}"
spec:
  replicas: "{{ .Values.replicaCount }}"
  selector:
    matchLabels:
      app: "{{ .Chart.Name }}"
  template:
    metadata:
      labels:
        app: "{{ .Chart.Name }}"
    spec:
      containers:
      - name: nginx
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag | quote }}"
        ports:
        - containerPort: 80
        volumeMounts:
        - name: config-volume
          mountPath: /etc/config
      volumes:
      - name: config-volume
        configMap:
          name: "{{ .Release.Name }}"-config
          items:
          - key: config.yaml
            path: config.yaml
  "{{- if .Values.config }}"
  "{{ .Values.config | indent 4 }}"
  "{{- end }}"

```

the `indent` function ensures that the `.Values.config` content is properly indented within the Deployment spec.

There are so many built-in functions in helm 
you can you look into it here :- https://helm.sh/docs/chart_template_guide/function_list/

## Conditionals

Conditionals in Helm charts allow you to include or exclude certain resources or configurations based on values provided in the `values.yaml` file or other criteria. This makes your Helm charts more flexible and reusable.

**Example of Conditional**

1. We would be have `vaules.yaml` 

```yaml
replicacount: 3
image:  
  repository: nginx  
  tag: "1.16.0"
service:  
  port: 80
resources:  
  limits:    
    cpu: "500m"    
    memory: "128Mi"  
  requests:    
    cpu: "250m"    
    memory: "64Mi"
    
  environment: "development"
```

2. Now we will make changes in the `deployment.yaml` file 

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    app: {{ include "myapp.name" . }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ include "myapp.name" . }}
  template:
    metadata:
      labels:
        app: {{ include "myapp.name" . }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          ports:
            - containerPort: {{ .Values.service.port }}
{{- if .Values.resources }}
          resources:
            limits:
              cpu: {{ .Values.resources.limits.cpu }}
              memory: {{ .Values.resources.limits.memory }}
            requests:
              cpu: {{ .Values.resources.requests.cpu }}
              memory: {{ .Values.resources.requests.memory }}
{{- end }}
          env:
            - name: ENVIRONMENT
              value: {{ .Values.environment | quote }}
{{- if .Values.environment == "development" }}
            - name: LOG_LEVEL
              value: "error"
{{- else }}
            - name: LOG_LEVEL
              value: "debug"
{{- end }}

```


Here you can see that we have used `{{- if .Values.resuorces }}` block this means we are using an if conditional statement and the `-` is used to remove the white space with and closing statement `{{- end }}`  

### Why Use Conditionals

1. **Flexibility:** Conditionals allow you to create a single Helm chart that can be deployed in different environments (e.g., development, staging, production) with varying configurations.
    
2. **Simplification:** Instead of maintaining multiple charts for different environments or scenarios, you can use conditionals to handle differences within a single chart.
    
3. **Reusability:** Conditionals enable you to reuse the same chart with different sets of values, making it easier to manage and maintain.
    
4. **Customization:** Users can customize deployments easily by changing values in the `values.yaml` file without modifying the template files.
    
5. **Resource Management:** You can include or exclude resources like CPU and memory limits, environment variables, and other configurations based on specific criteria, helping to optimize resource usage.

---

Before moving to next pointer lets know about `_helpers.tpl` file  

> [!NOTE]
> The `_helpers.tpl` file is used in Helm charts to define reusable template helpers and functions. These helpers can be used across different templates within the chart to avoid duplication and enhance maintainability.

**Why we use `_helpers.tpl` ??**


1. **DRY Principle:** Helps to adhere to the "Don't Repeat Yourself" principle by centralizing commonly used template code in one place.
    
2. **Maintainability:** Makes it easier to maintain and update templates. Changes made to helpers in `_helpers.tpl` automatically propagate to all templates using them.
    
3. **Readability:** Improves readability and clarity of the main templates by abstracting repetitive or complex logic into helper functions.
    
4. **Consistency:** Ensures consistency across different resources by using the same logic and values for naming, labels, and other configurations.
    
5. **Customization:** Allows for easy customization and extension of chart templates by modifying or adding new helper functions.

**Example of `_helpers.tpl`**

```
{{- /*
Helper template to generate the full name of the application.
*/ -}}
{{- define "myapp.fullname" -}}
{{- .Release.Name | printf "%s-%s" .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end }}

{{- /*
Helper template to generate the name of the application.
*/ -}}
{{- define "myapp.name" -}}
{{- .Chart.Name -}}
{{- end }}

{{- /*
Helper template to generate the chart version.
*/ -}}
{{- define "myapp.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version -}}
{{- end }}

{{- /*
Helper template to generate labels common to all resources.
*/ -}}
{{- define "myapp.labels" -}}
app.kubernetes.io/name: {{ include "myapp.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
```

Using Helpers in Templates 
`templates/deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{ include "myapp.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ include "myapp.name" . }}
  template:
    metadata:
      labels:
        {{ include "myapp.labels" . | nindent 8 }}
    spec:
      containers:
        - name: {{ include "myapp.name" . }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          ports:
            - containerPort: {{ .Values.service.port }}

```

`templates/service.yaml`

```yaml
apiVersion: v1 
kind: Service 
metadata: 
  name: {{ include "myapp.fullname" . }} 
  labels: 
    {{ include "myapp.labels" . | nindent 4 }}  
spec: 
  type: {{ .Values.service.type }} 
  ports: 
   - port: {{ .Values.service.port }} 
     targetPort: {{ .Values.service.port }} 
 selector: 
   app: {{ include "myapp.name" . }}
```


The `_helpers.tpl` values are been used in `deployment.yaml` and `service.yaml` files 
we can see in `metadata` and `labels` section 

## Range & Block

The `range` function in Helm allows you to iterate over lists or maps defined in your `values.yaml` file or provided at runtime. This is useful for dynamically generating Kubernetes resources or configurations based on multiple items.

**Example: Generating ConfigMaps for Multiple Environments**

1. Suppose you want to create ConfigMaps for different environments, each with its own set of configuration data

**Define the ConfigMaps in your values file**

`templates/configmap.yaml`

```yaml
configmaps:  
  - name: configmap-dev    
    data:      
     database_url: "mysql://user:password@localhost/dev_db"      
     api_url: "https://api.dev.example.com"  
  - name: configmap-prod    
    data:      
     database_url: "mysql://user:password@localhost/prod_db"      
     api_url: "https://api.prod.example.com"
```

**Use `range` to generate ConfigMaps based on the values in `values.yaml`:**

```yml
{{- range .Values.configMaps }}
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .name }}
data:
{{- range $key, $value := .data }}
  {{ $key }}: {{ $value | quote }}
{{- end }}
---
{{- end }}
```

2. In this example:

- We define a list `configMaps` in `values.yaml`, where each item contains a `name` and `data` section.
- The `range` function iterates over each item in `configMaps`, generating a ConfigMap for each entry.
- Inside the inner `range` loop, it iterates over the `data` section of each ConfigMap item to generate key-value pairs.

### Why Use `range`

1. **Dynamic Generation:** `range` allows for dynamic creation of Kubernetes resources or configurations based on the content of lists or maps defined in `values.yaml`.
    
2. **Reusability:** You can define a list of items once in `values.yaml` and use `range` to generate multiple resources (like ConfigMaps, Secrets, etc.) based on that list.
    
3. **Flexibility:** It provides flexibility to manage and configure multiple instances or environments of your application using a single Helm chart.
    
4. **Maintainability:** By centralizing configuration data in `values.yaml` and using `range`, you make your Helm charts easier to maintain and update.
    
5. **Consistency:** Ensures consistent deployment of resources across different environments or instances of your application, reducing errors and improving reliability.

## Blocks

The `block` function in Helm allows you to define reusable blocks of text or configuration that can be included in different parts of your templates. This is useful for creating templates with customizable sections that can be overridden if needed.

**Example: Reusable Block for Container Configuration**

1. Define the reusable block in `_helpers.tpl`

```yaml
{{- define "myapp.container" -}}
- name: {{ .name }}
  image: "{{ .image }}"
  ports:
    - containerPort: {{ .port }}
  env:
    - name: ENVIRONMENT
      value: {{ .environment | quote }}
{{- end }}

```

2. Include the block in your deployment template:
`templates/deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    app: {{ include "myapp.name" . }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ include "myapp.name" . }}
  template:
    metadata:
      labels:
        app: {{ include "myapp.name" . }}
    spec:
      containers:
        {{- block "myapp.container" . }}
        {{- $name := default "nginx" .Values.container.name -}}
        {{- $image := default "nginx:latest" .Values.container.image -}}
        {{- $port := default 80 .Values.container.port -}}
        {{- $environment := default "development" .Values.environment -}}
        {{- include "myapp.container" (dict "name" $name "image" $image "port" $port "environment" $environment) | nindent 10 }}
        {{- end }}
```

3. Define the values for the block in your values file:
`values.yaml`

```yaml
replicacount: 3
container:  
  name: "myapp"  
  image: "myapp:1.0.0"  
  port: 8080
  
environment: "production"
```

### Why Use `block`

1. **Reusability:** Blocks allow you to define reusable pieces of configuration that can be included in multiple places, reducing redundancy.
    
2. **Customizability:** Blocks can be overridden in specific templates, providing a flexible way to customize parts of your configuration without duplicating the entire template.
    
3. **Maintainability:** By centralizing common configuration in blocks, you make it easier to manage and update your Helm charts. Changes to a block propagate to all templates using it.
    
4. **Clarity:** Using blocks can make your templates cleaner and more readable by abstracting complex or repetitive configuration into separate, reusable sections.
    
5. **Consistency:** Blocks help ensure consistency across different parts of your Helm charts by using the same logic and values for similar configurations.

---

## Charts Hooks

Helm provides a _hook_ mechanism to allow chart developers to intervene at certain points in a release's life cycle. For example, you can use hooks to:

- Load a ConfigMap or Secret during install before any other charts are loaded.
- Execute a Job to back up a database before installing a new chart, and then execute a second job after the upgrade in order to restore data.
- Run a Job before deleting a release to gracefully take a service out of rotation before removing it.

Hooks work like regular templates, but they have special annotations that cause Helm to utilize them differently. In this section, we cover the basic usage pattern for hooks.

### The Available Hooks

| Annotation Value | Description                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| `pre-install`    | Executes after templates are rendered, but before any resources are created in Kubernetes                |
| `post-install`   | Executes after all resources are loaded into Kubernetes                                                  |
| `pre-delete`     | Executes on a deletion request before any resources are deleted from Kubernetes                          |
| `post-delete`    | Executes on a deletion request after all of the release's resources have been deleted                    |
| `pre-upgrade`    | Executes on an upgrade request after templates are rendered, but before any resources are updated        |
| `post-upgrade`   | Executes on an upgrade request after all resources have been upgraded                                    |
| `pre-rollback`   | Executes on a rollback request after templates are rendered, but before any resources are rolled back    |
| `post-rollback`  | Executes on a rollback request after all resources have been modified                                    |
| `test`           | Executes when the Helm test subcommand is invoked ( [view test docs](https://helm.sh/docs/chart_tests/)) |

> [!NOTE]
>### Hook resources are not managed with corresponding releases
> 1. The resources that a hook creates are currently not tracked or managed as part of the release. Once Helm verifies that the hook has reached its ready state, it will leave the hook resource alone. Garbage collection of hook resources when the corresponding release is deleted may be added to Helm 3 in the future, so any hook resources that must never be deleted should be annotated with `helm.sh/resource-policy: keep`.
>
> 2. Practically speaking, this means that if you create resources in a hook, you cannot rely upon `helm uninstall` to remove the resources. To destroy such resources, you need to either [add a custom `helm.sh/hook-delete-policy` annotation](https://helm.sh/docs/topics/charts_hooks/#hook-deletion-policies) to the hook template file, or [set the time to live (TTL) field of a Job resource](https://kubernetes.io/docs/concepts/workloads/controllers/ttlafterfinished/).

### Writing a Hook

Hooks are just Kubernetes manifest files with special annotations in the `metadata` section. Because they are template files, you can use all of the normal template features, including reading `.Values`, `.Release`, and `.Template`.

**For Example:**

1. This template, stored in `templates/post-install-job.yaml`, declares a job to be run on `post-install`:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: "{{ .Release.Name }}"
  labels:
    app.kubernetes.io/managed-by: {{ .Release.Service | quote }}
    app.kubernetes.io/instance: {{ .Release.Name | quote }}
    app.kubernetes.io/version: {{ .Chart.AppVersion }}
    helm.sh/chart: "{{ .Chart.Name }}-{{ .Chart.Version }}"
  annotations:
    # This is what defines this resource as a hook. Without this line, the
    # job is considered part of the release.
    "helm.sh/hook": post-install
    "helm.sh/hook-weight": "-5"
    "helm.sh/hook-delete-policy": hook-succeeded
spec:
  template:
    metadata:
      name: "{{ .Release.Name }}"
      labels:
        app.kubernetes.io/managed-by: {{ .Release.Service | quote }}
        app.kubernetes.io/instance: {{ .Release.Name | quote }}
        helm.sh/chart: "{{ .Chart.Name }}-{{ .Chart.Version }}"
    spec:
      restartPolicy: Never
      containers:
      - name: post-install-job
        image: "alpine:3.3"
        command: ["/bin/sleep","{{ default "10" .Values.sleepyTime }}"]
```

What makes this template a hook is the annotation:

```yaml
annotations:
  "helm.sh/hook": post-install
```

One resource can implement multiple hooks:

```yaml
annotations:
  "helm.sh/hook": post-install,post-upgrade
```

 2. To define a weight for a hook which will help build a deterministic executing order. Weights are defined using the following annotation:

```yaml
annotations:
  "helm.sh/hook-weight": "5"
```

3. Hook weights can be positive or negative numbers but must be represented as strings. When Helm starts the execution cycle of hooks of a particular Kind it will sort those hooks in ascending order

### Hook deletion policies

To define policies that determine when to delete corresponding hook resources. Hook deletion policies are defined using the following annotation:

```yaml
annotations:
  "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
```

You can choose one or more defined annotation values:

|Annotation Value|Description|
|---|---|
|`before-hook-creation`|Delete the previous resource before a new hook is launched (default)|
|`hook-succeeded`|Delete the resource after the hook is successfully executed|
|`hook-failed`|Delete the resource if the hook failed during execution|
If no hook deletion policy annotation is specified, the `before-hook-creation` behavior applies by default.

These _hooks_ will help in automating installation , updating or cleaning up process in the helm 

---

## Charts Test

A **test** in a helm chart lives under the `templates/` directory and is a job definition that specifies a container with a given command to run. The container should exit successfully (exit 0) for a test to be considered a success. The job definition must contain the helm test hook annotation: `helm.sh/hook: test`.


> [!NOTE] 
>  That until Helm v3, the job definition needed to contain one of these helm test hook annotations: `helm.sh/hook: test-success` or `helm.sh/hook: test-failure`. `helm.sh/hook: test-success` is still accepted as a backwards-compatible alternative to `helm.sh/hook: test`.


**Example tests:**

- Validate that your configuration from the values.yaml file was properly injected.
    - Make sure your username and password work correctly
    - Make sure an incorrect username and password does not work
- Assert that your services are up and correctly load balancing
- etc.

You can run the pre-defined tests in Helm on a release using the command 
`helm test <RELEASE_NAME>`. 

 **Example

_Lets understand it by running test on a chart 

1. Lets create a demo test chart 

```
helm create demo
```

2.   the following structure in your demo helm chart can be seen:

```
demo/
  Chart.yaml
  values.yaml
  charts/
  templates/
  templates/tests/test-connection.yaml
```

3. In `demo/templates/tests/test-connection.yaml` you'll see a test you can try. You can see the helm test pod definition here:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: "{{ include "demo.fullname" . }}-test-connection"
  labels:
    {{- include "demo.labels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": test
spec:
  containers:
    - name: wget
      image: busybox
      command: ['wget']
      args: ['{{ include "demo.fullname" . }}:{{ .Values.service.port }}']
  restartPolicy: Never
```

4. Take a close look at the annotations being used:

```
 annotations:
    "helm.sh/hook": test
```

### Steps to Run a Test Suite on a Release:

First, install the chart on your cluster to create a release. You may have to wait for all pods to become active; if you test immediately after this install, it is likely to show a transitive failure, and you will want to re-test.

```console
helm install demo demo --namespace default
helm test demo
NAME: demo
LAST DEPLOYED: Wed Jul 10 20:03:16 2024
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE:     demo-test-connection
Last Started:   Wed Jul 10 20:35:19 2024
Last Completed: Wed Jul 10 20:35:23 2024
Phase:          Succeeded
[...]
```


In this way you can test your charts , with different test cases depending on the use case of chart

> [!NOTE]
>
> 
> - You can define as many tests as you would like in a single yaml file or spread across several yaml files in the `templates/` directory.
> - You are welcome to nest your test suite under a `tests/` directory like `<chart-name>/templates/tests/` for more isolation.
> - A test is a [Helm hook](https://helm.sh/docs/charts_hooks/), so annotations like `helm.sh/hook-weight` and `helm.sh/hook-delete-policy` may be used with test resources.

---

## Packaging & Signing 

Packaging and signing Helm charts is crucial for ensuring authenticity and integrity when distributing charts to others so that other can install the custom chart and work on it or can been uploaded on a external helm repository. 

**Packaging a helm chart** 

1. lets say you are created your chart and now you need to upload this chart , so for that we need to package this helm chart in order to have all the files and dependencies of this chart in one single resource. 

2.  So to do it we will make use of `helm package`  command , this command packages the Helm chart l directory into a `.tgz` file 

 **Example:**

you have created a helm chart with a name `mychart`

```
helm package mychart/
```

- This command packages the Helm chart located in the `mychart/` directory into a `.tgz` file (`mychart-<version>.tgz`).

**Signing a helm chart**

1.  After packaging the helm , its a good practice to sign the helm chart to ensure authentication and its coming from a verified source vendor 

2. Before signing, ensure you have a GPG key set up:

```
gpg --gen-key  # If you haven't generated a GPG key yet
```

3.  Export your GPG public key:

```
gpg --export --armor <your_key_id> > mychart-key.asc
```

4. Sign the package:

```
helm sign mychart-<version>.tgz --key <your_key_id> --name <your_name>
```

Replace `<version>`, `<your_key_id>`, and `<your_name>` with appropriate values. This signs the packaged Helm chart using your GPG key.

5. Verify the signature of the Helm chart:

```
helm verify mychart-<version>.tgz
```

This command checks if the signature on `mychart-<version>.tgz.prov` matches the GPG key.

### Why Package and Sign Helm Charts?

- **Security:** Signing ensures that the chart has not been tampered with and comes from a trusted source.
    
- **Integrity:** Verifying the signature confirms that the chart matches the original content provided by the signer.
    
- **Trust:** Users can trust signed charts more confidently, knowing they are from a known and verified source.

---

## Using Helm with OCI Registries

Helm **OCI (Open Container Initiative)** registries allow you to store, share, and manage Helm charts as OCI artifacts, similar to how Docker images are managed in container registries. This provides a standardized and efficient way to distribute Helm charts.

how we store Docker images in a private container registry such as ECR , ACR , Private Docker Hub , same as that we can store Helm charts in a private OCI registry .

- **Push a Helm Chart to OCI Registry**
- **Pull a Helm Chart from OCI Registry**
- **Install a Helm Chart from OCI Registry**

**Steps to Use Helm with OCI Registries**

1. Enable OCI Support in Helm:

Before using OCI registries, ensure that OCI support is enabled in Helm.

```
export HELM_EXPERIMENTAL_OCI=1
```

2. Login to OCI Registry:

Authenticate to your OCI registry. This step may vary based on the registry provider (e.g., AWS ECR, Azure ACR, Google Artifact Registry, Docker Hub).

```
helm registry login <your-registry-url>
```

Example for Docker Hub:

```
helm registry login registry-1.docker.io
```

3.  **Push a Helm Chart to OCI Registry:**

First, package your Helm chart.

```
helm package mychart/
```


This creates a `.tgz` file (e.g., `mychart-0.1.0.tgz`).

Then, push the packaged chart to the OCI registry.

```
helm push <chart-tgz> oci://<your-registry-url>/<repository>
```

**Example:**

```
helm push mychart-0.1.0.tgz oci://registry-1.docker.io/myrepo
```

4. **Pull a Helm Chart from OCI Registry**

To pull a chart from the OCI registry:

```
helm pull oci://<your-registry-url>/<repository>/<chart-name> --version <chart-version>
```

**Example:**

```
helm pull oci://registry-1.docker.io/myrepo/mychart --version 0.1.0
```

This downloads the chart as a `.tgz` file.

5. Install a Helm Chart from OCI Registry

To install a chart directly from the OCI registry:

```
helm install <release-name> oci://<your-registry-url>/<repository>/<chart-name> --version <chart-version>
```

**Example:**

```
helm install myrelease oci://registry-1.docker.io/myrepo/mychart --version 0.1.0
```

### Advantages of Using OCI Registries with Helm

- **Standardization:** Uses the OCI specification for storing and managing Helm charts, promoting consistency and interoperability.
- **Efficiency:** Leverages the same infrastructure and tooling used for container images, simplifying the workflow for DevOps teams.
- **Security:** Integrates with existing registry authentication and authorization mechanisms, enhancing security.
- **Distribution:** Provides a reliable way to distribute Helm charts across different environments and teams.

---

We have learned about the advanced topics in helm related to testing , packaging , Signing and push and pull to a private OCI Register.  Let's continue exploring Helm's capabilities together! **Happy Helming !!**

