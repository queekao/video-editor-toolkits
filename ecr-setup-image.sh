docker-compose up -d
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id >.dkr.ecr.us-east-1.amazonaws.com
docker tag video-editor-toolkits-compression-nginx:latest <account-id >.dkr.ecr.us-east-1.amazonaws.com/video-editor:nginx-v1.0.0
docker tag redis:latest <account-id >.dkr.ecr.us-east-1.amazonaws.com/video-editor:redis-v1.0.0
docker tag video-editor-toolkits-node-server:latest <account-id >.dkr.ecr.us-east-1.amazonaws.com/video-editor:node-server-v1.0.0
docker push <account-id >.dkr.ecr.us-east-1.amazonaws.com/video-editor:nginx-v1.0.0
docker push <account-id >.dkr.ecr.us-east-1.amazonaws.com/video-editor:redis-v1.0.0
docker push <account-id >.dkr.ecr.us-east-1.amazonaws.com/video-editor:node-server-v1.0.0
