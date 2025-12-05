#!/bin/bash
set -e

# Get region from EC2 metadata (IMDSv2)
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" 2>/dev/null)
REGION=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/placement/region)

# Update system
dnf update -y

# Install Nginx
dnf install -y nginx

# Install kubectl to communicate with EKS
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
rm kubectl

# Configure AWS CLI and kubectl for EKS
aws eks update-kubeconfig --name ${eks_cluster_name} --region $REGION

# Create Nginx configuration
cat > /etc/nginx/conf.d/jobvector.conf <<'EOF'
# Upstream for backend service
upstream backend {
%{ for ip in eks_node_ips ~}
    server ${ip}:${backend_nodeport};
%{ endfor ~}
}

# Upstream for frontend service
upstream frontend {
%{ for ip in eks_node_ips ~}
    server ${ip}:${frontend_nodeport};
%{ endfor ~}
}

server {
    listen 80;
    server_name _;

    # Increase buffer sizes for larger requests
    client_max_body_size 100M;
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;

    # Frontend routes
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API routes
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
        
        # Handle preflight
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Backend auth routes
    location /auth/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend actuator endpoints
    location /actuator/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Start and enable Nginx
systemctl enable nginx
systemctl start nginx

# Create a script to update backend IPs dynamically
cat > /usr/local/bin/update-nginx-upstreams.sh <<'SCRIPT'
#!/bin/bash
# This script can be run periodically to update EKS node IPs if they change
kubectl get nodes -o wide | awk 'NR>1 {print $6}' > /tmp/node-ips.txt
# Regenerate nginx config with new IPs (requires template)
systemctl reload nginx
SCRIPT

chmod +x /usr/local/bin/update-nginx-upstreams.sh

echo "Nginx reverse proxy setup completed!"
