docker-compose up -d
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 835549930321.dkr.ecr.us-east-1.amazonaws.com
docker tag video-editor-toolkits-compression-nginx:latest 835549930321.dkr.ecr.us-east-1.amazonaws.com/test:nginx
docker tag redis:latest 835549930321.dkr.ecr.us-east-1.amazonaws.com/test:redis
docker tag video-editor-toolkits-server:latest 835549930321.dkr.ecr.us-east-1.amazonaws.com/test:node-server
docker push 835549930321.dkr.ecr.us-east-1.amazonaws.com/test:nginx
docker push 835549930321.dkr.ecr.us-east-1.amazonaws.com/test:redis
docker push 835549930321.dkr.ecr.us-east-1.amazonaws.com/test:node-server
