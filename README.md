## Steps to run for development

1. Build the image
```bash
sudo docker build -t sharedoc:dev .
```

2. Create a new container instance
```bash
docker run \
    -it \
    --rm \
    -v ${PWD}:/app \
    -v /app/node_modules \
    -p 8000:3000 \
    -e CHOKIDAR_USEPOLLING=true \
    sharedoc:dev
```

Hot-reloading is enabled.


docker-compose isn't working right now.