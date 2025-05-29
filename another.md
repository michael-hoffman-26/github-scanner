## Build Multiplatform Image Example

### _Caution_!
The build commands examples are with **"--push"** flag and **tags**


### Node.js
https://gitlab.com/groups/nielsen-media/maf/maf-public/-/container_registries/3375588
```bash
docker buildx build --platform linux/amd64,linux/arm64 --push --provenance=false \
    -t registry.adrees.com \
    -f DockerFile --target final .
```
