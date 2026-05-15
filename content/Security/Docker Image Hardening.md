---
Author:
  - Kumail Rizvi
Author Profile:
  - https://linkedin.com/in/kumail-rizvi
tags:
  - security
  - docker
Creation Date: 2024-08-22T02:08:22
Last Date: 2024-08-22T02:08:22
drafts: 
References: https://docs.snyk.io/
description:
---

## Content Index

- **Introduction to container security**
- **Best security practices in docker images**
---

### Introduction to container security

Container security is essential due to the widespread use of containers in modern software development. Containers package applications and their dependencies together, offering efficiency and consistency. However, they also introduce unique security challenges.

**Why It Matters:**

1. **Increased Use:** Containers are popular for their efficiency and scalability, making security a top priority.
2. **Shared Resources:** Containers share the host system’s kernel, creating potential risks if not properly isolated.
3. **Complex Environments:** Managing multiple containers across various hosts requires effective security measures.

**Key Concepts in container security :**

- **Image Security:**

   - Container images are the blueprints for containers. Ensuring that images are free from vulnerabilities, are built from trusted sources, and are regularly updated is crucial for maintaining container security.

- **Runtime Security:**

  - Security during runtime involves monitoring containers while they are running to detect and respond to potential threats. This includes ensuring that containers run with the minimum necessary privileges and monitoring for any suspicious activities.
  
- **Configuration Management:**
 
   - Proper configuration of containers and their orchestration platforms (like Kubernetes) is vital. Misconfigurations can expose containers to security risks, such as unauthorized access or data breaches.

- **Network Security:**

   - Containers often communicate with each other over a network. Implementing network security measures, such as segmentation and encryption, helps protect data in transit and prevent unauthorized access.

- **Vulnerability Management:**

   - Regularly scanning container images and the host system for vulnerabilities and applying updates or patches is essential for protecting against known threats.

- **Access Control:**
   - Implementing strict access controls for container registries, orchestration platforms, and container hosts helps prevent unauthorized access and potential security breaches.

---

### Best Practices in Docker Images

lets see some best practices in building a secure docker image also you would be able to create  containers . Please remember that Dockerfile best practices are **just a piece in the whole development process**. here i have include a closing section pointing to related container image security and shifting left security resources to apply before and after the image building. 

![[Security/assets/SDLC.png]]

#### Avoid unnecessary privileges

follow the [principle of least privilege](https://sysdig.com/blog/cspm-least-privilege-principle/) so your service or application only has access to the resources and information necessary to perform its purpose.

##### 1. Rootless containers

A [recent report highlighted that 58% of images](https://sysdig.com/blog/sysdig-2021-container-security-usage-report/) are running the container entrypoint as **root (UID 0)**. However, it is a Dockerfile best practice to avoid doing that. There are very few use cases where the container needs to execute as **root**, so don’t forget to include the _USER_ instruction to change the default effective UID to a non-root user.

Furthermore, your execution environment might block containers running as root by default (i.e., Openshift requires additional SecurityContextConstraints).

Running as non-root might require a couple of additional steps in your Dockerfile, as now you will need to:

- Make sure the user specified in the _USER_ instruction exists inside the container.
- Provide appropriate file system permissions in the locations where the process will be reading or writing.

```dockerfile
FROM alpine:3.12 
# Create user and set ownership and permissions as required 
RUN adduser -D myuser && chown -R myuser /myapp-data 
# ... copy application files 
USER myuser 
ENTRYPOINT ["/myapp"]
```

- You might see containers that start as root and then use [gosu](https://github.com/tianon/gosu) or [su-exec](https://github.com/ncopa/su-exec) to drop to a standard user.

- Also, if a container needs to run a very specific command as root, it may rely on [sudo](https://www.sudo.ws/).

- While these two alternatives are better than running as root, it might not work in restricted environments like Openshift.

##### 2. Don’t bind to a specific UID

Run the container as a non-root user, but don’t make that user UID a requirement.

- Forcing a specific UID (i.e., the first standard user with `UID 1000`) requires adjusting the permissions of any bind mount, like a host folder for data persistence. Alternatively, if you run the container (`-u` option in docker) with the host UID, it might break the service when trying to read or write from folders within the container.

```dockerfile
...
RUN mkdir /myapp-tmp-dir && chown -R myuser /myapp-tmp-dir 
USER myuser 
ENTRYPOINT ["/myapp"]

```

This container will have trouble if running with an UID different than `myuser`, as the application won’t be able to write in `/myapp-tmp-dir` folder.

Don’t use a hardcoded path only writable by `myuser`. Instead, write temporary data to `/tmp` (where any user can write, thanks to the sticky bit permissions). Make resources world readable (i.e., 0644 instead of 0640), and ensure that everything works if the UID is changed.

**example**

```dockerfile
... 
USER myuser 
ENV APP_TMP_DATA=/tmp 
ENTRYPOINT ["/myapp"]
```

In this example our application will use the path in `APP_TMP_DATA` environment variable. The default value `/tmp` will allow the application to execute as any UID and still write temporary data to `/tmp`. Having the path as a configurable environment variable is not always necessary, but it will make things easier when setting up and mounting volumes for persistence.

#### 3. Make executable owned by root and not writable

- It is a Dockerfile best practice for every executable in a container to be owned by the root user, even if it is executed by a non-root user and should not be world-writable.

- This will block the executing user from modifying existing binaries or scripts, which could enable different attacks. By following this best practice, you’re [effectively enforcing container immutability](https://cloud.google.com/solutions/best-practices-for-operating-containers#immutability). Immutable containers do not update their code automatically at runtime and, in this way, you can prevent your running application from being accidentally or maliciously modified.

- To follow this best practice, try to avoid:

```dockerfile
... 
WORKDIR $APP_HOME 
COPY --chown=app:app app-files/ /app 
USER app
ENTRYPOINT /app/my-app-entrypoint.sh
```

Most of the time, you can just drop the `--chown app:app` option (or `RUN chown ...` commands). The _app_ user only needs execution permissions on the file, **not ownership**.

### Reduce attack surface

It is a Dockerfile best practice to **keep the images minimal**.

##### 1. Multistage builds

- Make use of [multistage building](https://docs.docker.com/develop/develop-images/multistage-build/) features to have reproducible builds inside containers.

- In a multistage build, you create an intermediate container – or stage – with all the required tools to compile or produce your final artifacts (i.e., the final executable). Then, you copy **only the resulting** artifacts to the final image, without additional development dependencies, temporary build files, etc.

- For a go application, an example of a multistage build would look like this:

```dockerfile
### This the "builder" stage #####
FROM golang:1.15 as builder 
WORKDIR /my-go-app 
COPY app-src . 
RUN GOOS=linux GOARCH=amd64 go build ./cmd/app-service 
#### This is the final stage, and we copy artifacts from "builder" ####
FROM gcr.io/distroless/static-debian10 
COPY --from=builder /my-go-app/app-service /bin/app-service 
ENTRYPOINT ["/bin/app-service"]
```

**Lets quickly understand this dockerfile**

- With those Dockerfile instructions, we create a _builder_ stage using the golang:1.15 container, which includes all of the go toolchain.
-  In the next line , we can copy the source code in there and build.
- Then, we define another stage based on a Debian _distroless_ image .
- `COPY` the resulting executable from the _builder_ stage using the `--from=builder flag`.
- The final image will contain only the minimal set of libraries from distroless/static-debian-10 image and your app executable.
- No build toolchain, no source code.

##### 2.  Distroless, from scratch

- [Distroless](https://github.com/GoogleContainerTools/distroless) are a nice alternative. These are designed to contain only the minimal set of libraries required to run Go, Python, or other frameworks
- For example, if you were to base a container in a generic `ubuntu:xenial` image:
- You would include more than 100 vulnerabilities, related to the large amount of packages that you are including and probably neither need nor ever use:
- Do you need the _gcc_ compiler or _systemd SysV_ compatibility in your container? Most likely, you don’t. The same goes for _dpkg_ or bash.
- If you base your image on [gcr.io/distroless/base-debian10](https://github.com/GoogleContainerTools/distroless/tree/master/base):
```dockerfile
FROM gcr.io/distroless/base-debian10
```

-   Then it will only contain a basic set of packages, including just required libraries like _glibc_, _libssl,_ and _openssl_.
- For statically compiled applications like Go that don’t require _libc_, you can even go with the slimmer:
```dockerfile
FROM gcr.io/distroless/static-debian10
```

##### 3. Use trusted base images

Building on top of untrusted or unmaintained images will inherit all of the problems and vulnerabilities from that image into your containers.

- You should prefer _verified_ and _official_ **images from trusted repositories** and providers over images built by unknown users.
- When using custom images, check for the image source and the Dockerfile, and **build your own base image**. There is no guarantee that an image published in a public registry is really built from the given Dockerfile. Neither is assurance that it is kept up to date.
- Sometimes the _official_ images might not be the **better fit**, in regards to security and minimalism. For example, comparing the [official node image](https://hub.docker.com/_/node) with the [bitnami/node](https://hub.docker.com/r/bitnami/node/) image, the latter offers customized versions on top of a minideb distribution. They are frequently updated with the latest bug fixes, signed with _Docker Content Trust_, and pass a [security scan for tracking known vulnerabilities](https://quay.io/repository/bitnami/node?tab=tags).
- A best example is to use [Chainguard images](https://www.chainguard.dev/) , they come with ) CVE and secure images 

##### 5. Update your images frequently

As new security vulnerabilities are discovered continuously, it is a general security best practice to stick to the latest security patches.

There is no need to always go to the latest version, which might contain breaking changes, but define a versioning strategy:

- **Stick to stable** or long-term support versions, which deliver security fixes soon and often.
- **Plan in advance**. Be ready to drop old versions and migrate before your base image version reaches the end of its life and stops receiving updates.
- Also, **rebuild your own images periodically** and with a similar strategy to get the latest packages from the base distro, Node, Golang, Python, etc. Most package or dependency managers, like [npm](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#dependencies) or [go mod](https://golang.org/ref/mod), will offer ways to specify version ranges to keep up with latest security updates.

##### 6. Exposed ports

Every opened port in your container is an open door to your system. Expose only the ports that your application needs and avoid exposing ports like SSH (22).

> [!NOTE]
> That even though the Dockerfile offers the [EXPOSE command](https://docs.docker.com/engine/reference/builder/#expose), this command is only informational and for documentation purposes. Exposing the port does not automatically allow connections for all EXPOSED ports when running the container (unless you use `docker run --publish-all`). You need to specify the published ports at runtime, when executing the container.

Use `EXPOSE` to flag and document only the required ports in the Dockerfile, and then stick to those ports when publishing or exposing in execution.

### Prevent confidential data leaks

some advice on handling credentials for containers, and how to avoid accidentally leaking undesired files or information.

##### 1. Credentials and confidentiality

Never put any secret or credentials in the Dockerfile instructions (environment variables, args, or hard coded into any command).

> [!NOTE]
> Be extra careful with files that get copied into the container. Even if a file is removed in a later instruction in the Dockerfile, it can still be accessed on the previous layers as it is not really removed, only “hidden” in the final filesystem.

- If the application supports **configuration via environment variables**, use them to set the secrets on execution (-e option in docker run), or use [Docker secrets](https://docs.docker.com/engine/swarm/secrets/), [Kubernetes secrets](https://kubernetes.io/docs/concepts/configuration/secret/) to provide the values as environment variables.
- **Use configuration files** and [bind mount](https://docs.docker.com/storage/bind-mounts/) the configuration files in docker, or [mount them from a Kubernetes secret](https://kubernetes.io/docs/concepts/storage/volumes/#secret).
- Also, **your images shouldn’t contain confidential information** or configuration values that tie them to some specific environment (i.e., production, staging, etc.).
-  Allow the image to be customized by **injecting the values on runtime**, especially secrets. You should only include configuration files with safe or dummy values inside, as an example.

##### 2. Using of ADD, COPY Instructions

Both the `ADD` and `COPY` instructions provide similar functions in a Dockerfile. However, `COPY` is more explicit.

- Use `COPY` unless you really need the `ADD` functionality, like to add files from an URL or from a tar file. `COPY` is more predictable and less error prone.
- In some cases it is preferred to use the `RUN` instruction over `ADD` to download a package using _curl_ or _wget_, extract it, and then remove the original file in a single step, reducing the number of layers
- Multistage builds also solve this problem and help you follow Dockerfile best practices, allowing you to copy only the final extracted files from a previous stage.

##### 3. Build context and dockerignore

typical execution of a build using docker, with a default _Dockerfile_, and the context in the current folder would look like this :

```
docker build -t myimage .
```

This is right ?? , **NO ,  Beware!!**

- The “.” parameter is the build context. Using “.” as context is dangerous as you can copy confidential or unnecessary files into the container, like configuration files, credentials, backups, lock files, temporary files, sources, subfolders, dotfiles, etc.

- Imagine that you have the following command inside the Dockerfile:

```dockerfile
COPY . /my-app
```

- It would be Dockerfile best practices to create a subfolder containing the files that need to be copied inside the container, use it as the build context, and when possible, be explicit for the `COPY` instructions (avoid wildcards). For example:

```
docker build -t myimage files/
```

- Also, create a [.dockerignore](https://docs.docker.com/engine/reference/builder/#dockerignore-file) file to explicitly exclude files and directories.

- Even if you are extra careful with the `COPY` instructions, all of the build context is sent to the docker daemon before starting the image build. That means having a smaller and restricted build context will make your builds faster.

- Put your build context in its own folder and use `.dockerignore` to reduce it as much as possible.


### Other Security Aspects

##### 1. Layer sanity

- Remember that order in the Dockerfile instructions is very important.
- Since `RUN`, `COPY`, `ADD`, and other instructions will create a new container layer, grouping multiple commands together will reduce the number of layers.
- The best practice would be 

```dockerfile
  FROM ubuntu 
  RUN apt-get install wget && wget https://…/downloadedfile.tar && tar xvzf downloadedfile.tar && rm downloadedfile.tar && apt-get remove wget
```

- Also, place the commands that are less likely to change, and easier to cache, first.
- Instead of:

```dockerfile
FROM ubuntu 
COPY source/* . 
RUN apt-get install nodejs 
ENTRYPOINT ["/usr/bin/node", "/main.js"]
```

- its better to do this 

```dockerfile
FROM ubuntu 
RUN apt-get install nodejs 
COPY source/* . 
ENTRYPOINT ["/usr/bin/node", "/main.js"]
```

- The `nodejs` package is less likely to change than our application source.

> [!NOTE]
> 
> Please remember that executing a `rm` command removes the file on the next layer, but it is still available and can be accessed, as the final image filesystem is composed from all the previous layers.


- So **don’t copy confidential files and then remove them**, they will be not visible in the final container filesystem but still be easily accessible.


##### 2. Metadata labels

- Best practice to include metadata labels when building your image.
- Labels will help in image management, like including the application version, a link to the website, how to contact the maintainer, and more.
- You can take a look at the [predefined annotations from the OCI image spec](https://github.com/opencontainers/image-spec/blob/master/annotations.md), which deprecate the previous [Label schema standard draft](http://label-schema.org/rc1/).


##### 3. Linting

- Tools like [Haskell Dockerfile Linter (hadolint)](https://github.com/hadolint/hadolint) can detect bad practices in your Dockerfile, and even expose issues inside the shell commands executed by the `RUN` instruction.
- Consider incorporating such a tool in your CI pipelines.
- Image scanners are also capable of detecting bad practices via customizable rules, and report them along with image vulnerabilities:

![[Synk-Policy.png]]

- Some of the misconfigurations you can detect are images running as root, exposed ports, usage of the `ADD` instruction, hardcoded secrets, or discouraged `RUN` commands.

##### 4. Locally scan images during development

- It is a security best practice to apply the “shift left security” paradigm by directly scanning your images, as soon as they are built, in your CI pipelines before pushing to the registry.
- This also includes **in the developer computer**, _using the [Sysdig inline scanner](https://docs.sysdig.com/en/integrate-with-ci-cd-tools.html),  [Trivy Scanner](https://trivy.dev/)which provides different integrations with CI/CD tools like [Jenkins](https://plugins.jenkins.io/sysdig-secure/), [Github actions](https://sysdig.com/blog/image-scanning-github-actions/), and more._
- And remember, a scanned image might be “safe” now. But as it ages and new vulnerabilities are discovered, it might become dangerous.
- Periodically **reevaluate for new vulnerabilities**, always scan the images 


![[Security/assets/local-develpoment.png]]
### Beyond image building

we have focused on the image building process and discussed tips for creating optimal Dockerfiles. But let’s not forget about some additional pre-checks and what comes after building your image: running it.

##### 1. Docker port socket and TCP protection

- The docker socket is a big privileged door into your host system that, [as seen recently, can be used for intrusion and malicious software usage](https://sysdig.com/blog/mitigating-weave-scope/). Make sure your `/var/run/docker.sock` has the correct permissions, and if docker is exposed via TCP (which is not recommended at all), make sure [it is properly protected](https://docs.docker.com/engine/security/https/).

##### 2. Sign images and verify signatures

- It is one of the Dockerfile best practices to use [docker content trust](https://docs.docker.com/engine/security/trust/), Docker notary, Harbor notary, or similar tools to **digitally sign your images** and then **verify them on runtime**.
- Enabling signature verification is different on each runtime. For example, in docker this is done with the `DOCKER_CONTENT_TRUST` environment variable:  `export DOCKER_CONTENT_TRUST=1`

##### 3. Tag mutability

- In container land, tags are a volatile reference to a concrete image version in a specific point in time. Tags can change unexpectedly, and at any moment.


![[Branch-dev.png]]

##### Run as non root

- we talked about using a non-root user when building a container. The USER instruction will set the default user for the container, but the orchestrator or runtime environment (i.e., docker run, kubernetes, etc.) has the last word on who is the running container effective user.
- Really **avoid running your environment as root**.

##### Include health / liveness checks

- When using plain Docker or Docker Swarm, [include a HEALTHCHECK instruction](https://docs.docker.com/engine/reference/builder/#healthcheck) in your Dockerfile whenever possible. This is critical for long running or persistent services in order to ensure they are healthy, and manage restarting the service otherwise.
- If running your images in Kubernetes, use livenessProbe configuration inside the container definitions, as the docker HEALTHCHECK instruction won’t be applied.

##### Drop capabilities

- Also in execution, you can **restrict the application capabilities** to the minimal required set using [--cap-drop flag](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities) in Docker or [--securityContext.capabilities.drop in Kubernetes](https://kubernetes.io/docs/tasks/configure-pod-container/security-context/#set-capabilities-for-a-container). That way, in case your container is compromised, the range of action available to an attacker is limited.

- Also, see more information on how to apply AppArmor and Seccomp as additional mechanisms to restrict container privileges:
  - AppArmor in [Docker](https://docs.docker.com/engine/security/apparmor/) or [Kubernetes](https://sysdig.com/blog/manage-apparmor-profiles-in-kubernetes-with-kube-apparmor-manager/)
  - Seccomp in [Docker](https://docs.docker.com/engine/security/seccomp/) or [Kubernetes](https://kubernetes.io/docs/tutorials/clusters/seccomp/).


### Conclusion

We have seen that container image security is a complex and critical topic that simply cannot be ignored until it explodes with terrible consequences.

**Prevention and shifting security left is essential** for improving your security posture and reducing the management overhead.

---
