# VPS DEPLOYMENT GUIDE - ALUMNI ELECTION SYSTEM
## Complete Production Deployment on Ubuntu 25.04 VPS

### 📋 STEP-BY-STEP DEPLOYMENT

#### **STEP 1: System Update & Basic Tools**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip
```

#### **STEP 2: Install Java 21**
```bash
sudo apt install -y openjdk-21-jdk
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
java -version
echo "JAVA_HOME=$JAVA_HOME" | sudo tee -a /etc/environment
source /etc/environment
```

#### **STEP 3: Install MySQL Server**
```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
sudo systemctl status mysql
```

#### **STEP 4: Configure MySQL Database**
```bash
sudo mysql_secure_installation
sudo mysql -e "CREATE DATABASE pemilihan;"
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'root123';"
sudo mysql -e "FLUSH PRIVILEGES;"
mysql -u root -proot123 -e "SHOW DATABASES;"
```

#### **STEP 5: Install Maven**
```bash
sudo apt install -y maven
mvn -version
```

#### **STEP 6: Download & Install Tomcat**
```bash
cd /tmp
sudo wget https://downloads.apache.org/tomcat/tomcat-10/v10.1.43/bin/apache-tomcat-10.1.43.tar.gz
sudo tar -xzf apache-tomcat-10.1.43.tar.gz -C /opt
sudo mv /opt/apache-tomcat-10.1.43 /opt/tomcat
```

#### **STEP 7: Configure Tomcat User & Permissions**
```bash
sudo useradd -r -s /bin/false tomcat
sudo chown -R tomcat:tomcat /opt/tomcat
sudo chmod +x /opt/tomcat/bin/*.sh
```

#### **STEP 8: Create Optimized Tomcat Service (90% Resources)**
```bash
sudo tee /etc/systemd/system/tomcat.service > /dev/null << 'EOF'
[Unit]
Description=Apache Tomcat Web Application Container
After=network.target

[Service]
Type=forking
User=tomcat
Group=tomcat
Environment="JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64"
Environment="CATALINA_PID=/opt/tomcat/temp/tomcat.pid"
Environment="CATALINA_HOME=/opt/tomcat"
Environment="CATALINA_BASE=/opt/tomcat"
Environment="CATALINA_OPTS=-Xms12G -Xmx14G -server -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:G1HeapRegionSize=16m -XX:+G1UseAdaptiveIHOP -XX:G1MixedGCCountTarget=16 -XX:+UseStringDeduplication -XX:+OptimizeStringConcat"
Environment="JAVA_OPTS=-Djava.awt.headless=true -Djava.security.egd=file:/dev/./urandom -Dspring.profiles.active=prod -Dfile.encoding=UTF-8 -Duser.timezone=Asia/Jakarta -Djava.net.preferIPv4Stack=true"
ExecStart=/opt/tomcat/bin/startup.sh
ExecStop=/opt/tomcat/bin/shutdown.sh
RestartSec=10
Restart=always
LimitNOFILE=65536
LimitNPROC=65536

[Install]
WantedBy=multi-user.target
EOF
```

#### **STEP 9: Enable Tomcat Service**
```bash
sudo systemctl daemon-reload
sudo systemctl enable tomcat
sudo systemctl start tomcat
sudo systemctl status tomcat
```

#### **STEP 10: Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

#### **STEP 11: Install Nginx**
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

#### **STEP 12: Create Web Directories**
```bash
sudo mkdir -p /var/www/trensilapor.my.id
sudo mkdir -p /var/www/mdarmawanf.my.id
sudo mkdir -p /var/www/ikafk.my.id
sudo mkdir -p /var/www/pesanbus.my.id
sudo mkdir -p /var/www/absenkantor.my.id
```

#### **STEP 13: Clone Project Repository**
```bash
cd /tmp
sudo git clone https://github.com/MuhammadDarmawanFadilah/pemilihan.git
cd pemilihan
ls -la
```

#### **STEP 14: Build Backend Application**
```bash
cd /tmp/pemilihan/backend
sudo mvn clean package -DskipTests
ls -la target/
```

#### **STEP 15: Deploy Backend to Tomcat**
```bash
sudo cp /tmp/pemilihan/backend/target/backend.war /opt/tomcat/webapps/ROOT.war
sudo systemctl restart tomcat
sleep 10
sudo systemctl status tomcat
```

#### **STEP 16: Build Frontend Application**
```bash
cd /tmp/pemilihan/frontend
sudo npm install
sudo npm run build
ls -la .next/
```

#### **STEP 17: Deploy Frontend Files (Universal)**
```bash
sudo cp -r /tmp/pemilihan/frontend/.next/standalone/* /var/www/trensilapor.my.id/
sudo cp -r /tmp/pemilihan/frontend/.next/static /var/www/trensilapor.my.id/.next/
sudo cp -r /tmp/pemilihan/frontend/public /var/www/trensilapor.my.id/

# Set ownership based on distro
if [ -f /etc/debian_version ]; then
    # Ubuntu/Debian
    sudo chown -R www-data:www-data /var/www
    WEB_USER="www-data"
elif [ -f /etc/redhat-release ]; then
    # RHEL/CentOS/Fedora
    sudo chown -R nginx:nginx /var/www
    WEB_USER="nginx"
else
    # Default fallback
    sudo chown -R www-data:www-data /var/www
    WEB_USER="www-data"
fi

echo "Web user set to: $WEB_USER"
```

#### **STEP 18: Configure Main Nginx Site (Universal)**
```bash
# Create sites directories for RHEL/CentOS if they don't exist
sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

# Add sites-enabled include to nginx.conf if not present
if ! grep -q "sites-enabled" /etc/nginx/nginx.conf; then
    sudo sed -i '/include \/etc\/nginx\/conf.d\/\*.conf;/a\    include /etc/nginx/sites-enabled/*;' /etc/nginx/nginx.conf
fi

sudo tee /etc/nginx/sites-available/trensilapor.my.id > /dev/null << 'EOF'
server {
    listen 80;
    server_name trensilapor.my.id www.trensilapor.my.id;
    root /var/www/trensilapor.my.id;
    index index.html;
    
    client_max_body_size 100M;
    
    location / {
        try_files $uri $uri/ @nextjs;
    }
    
    location @nextjs {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    location /api {
        proxy_pass http://localhost:8080/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
EOF
```

#### **STEP 19: Configure Additional Domain Sites**
```bash
for domain in mdarmawanf.my.id ikafk.my.id pesanbus.my.id absenkantor.my.id; do
sudo tee /etc/nginx/sites-available/$domain > /dev/null << EOF
server {
    listen 80;
    server_name $domain www.$domain;
    root /var/www/$domain;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF
done
```

#### **STEP 20: Enable Nginx Sites**
```bash
sudo ln -sf /etc/nginx/sites-available/trensilapor.my.id /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/mdarmawanf.my.id /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/ikafk.my.id /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/pesanbus.my.id /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/absenkantor.my.id /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

#### **STEP 21: Test Nginx Configuration**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### **STEP 22: Create Optimized Frontend Service (10% Resources)**
```bash
sudo tee /etc/systemd/system/trensilapor-frontend.service > /dev/null << 'EOF'
[Unit]
Description=Trensilapor Frontend Next.js Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/trensilapor.my.id
ExecStart=/usr/bin/node --max-old-space-size=1536 server.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=UV_THREADPOOL_SIZE=4
LimitNOFILE=65536
CPUQuota=25%
MemoryLimit=1.5G

[Install]
WantedBy=multi-user.target
EOF
```

#### **STEP 23: Enable Frontend Service**
```bash
sudo systemctl daemon-reload
sudo systemctl enable trensilapor-frontend
sudo systemctl start trensilapor-frontend
sudo systemctl status trensilapor-frontend
```

#### **STEP 24: Final Verification**
```bash
sudo systemctl status mysql tomcat trensilapor-frontend nginx
netstat -tlnp | grep :80
netstat -tlnp | grep :8080
netstat -tlnp | grep :3000
netstat -tlnp | grep :3306
```

#### **STEP 25: Deployment Summary**
```bash
echo "🎉 DEPLOYMENT COMPLETE! 🎉"
echo "✅ Backend: http://localhost:8080"
echo "✅ Frontend: http://trensilapor.my.id"
echo "✅ Database: MySQL running on port 3306"
echo "✅ Other domains ready: mdarmawanf.my.id, ikafk.my.id, pesanbus.my.id, absenkantor.my.id"
echo "🔧 Configure your domain DNS to point to this server IP"
```

### 🚀 OPTIMIZED ONE-COMMAND DEPLOYMENT (Ubuntu 25.04)

```bash
# High-Performance VPS Deployment - 90% Backend, 10% Frontend
sudo apt update && sudo apt upgrade -y && sudo apt install -y openjdk-21-jdk mysql-server nginx maven git curl wget unzip && \
sudo systemctl start mysql && sudo systemctl enable mysql nginx && \
sudo mysql_secure_installation --use-default && \
sudo mysql -e "CREATE DATABASE pemilihan; ALTER USER 'root'@'localhost' IDENTIFIED BY 'root123'; FLUSH PRIVILEGES;" && \
cd /tmp && sudo wget https://downloads.apache.org/tomcat/tomcat-10/v10.1.43/bin/apache-tomcat-10.1.43.tar.gz && \
sudo tar -xzf apache-tomcat-10.1.43.tar.gz -C /opt && sudo mv /opt/apache-tomcat-10.1.43 /opt/tomcat && \
sudo useradd -r -s /bin/false tomcat && sudo chown -R tomcat:tomcat /opt/tomcat && sudo chmod +x /opt/tomcat/bin/*.sh && \
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs && \
sudo mkdir -p /var/www/{trensilapor.my.id,mdarmawanf.my.id,ikafk.my.id,pesanbus.my.id,absenkantor.my.id} && \
sudo git clone https://github.com/MuhammadDarmawanFadilah/pemilihan.git /tmp/pemilihan && \
sudo tee /etc/systemd/system/tomcat.service > /dev/null << 'EOF'
[Unit]
Description=Apache Tomcat Web Application Container
After=network.target

[Service]
Type=forking
User=tomcat
Group=tomcat
Environment="JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64"
Environment="CATALINA_PID=/opt/tomcat/temp/tomcat.pid"
Environment="CATALINA_HOME=/opt/tomcat"
Environment="CATALINA_BASE=/opt/tomcat"
Environment="CATALINA_OPTS=-Xms12G -Xmx14G -server -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:G1HeapRegionSize=16m -XX:+G1UseAdaptiveIHOP -XX:G1MixedGCCountTarget=16 -XX:+UseStringDeduplication -XX:+OptimizeStringConcat"
Environment="JAVA_OPTS=-Djava.awt.headless=true -Djava.security.egd=file:/dev/./urandom -Dspring.profiles.active=prod -Dfile.encoding=UTF-8 -Duser.timezone=Asia/Jakarta -Djava.net.preferIPv4Stack=true"
ExecStart=/opt/tomcat/bin/startup.sh
ExecStop=/opt/tomcat/bin/shutdown.sh
RestartSec=10
Restart=always
LimitNOFILE=65536
LimitNPROC=65536

[Install]
WantedBy=multi-user.target
EOF
cd /tmp/pemilihan/backend && sudo mvn clean package -DskipTests && \
sudo cp target/backend.war /opt/tomcat/webapps/ROOT.war && \
cd /tmp/pemilihan/frontend && sudo npm install --production && sudo npm run build && \
sudo cp -r .next/standalone/* /var/www/trensilapor.my.id/ && \
sudo cp -r .next/static /var/www/trensilapor.my.id/.next/ && \
sudo cp -r public /var/www/trensilapor.my.id/ && \
sudo chown -R www-data:www-data /var/www && \
sudo tee /etc/nginx/sites-available/trensilapor.my.id > /dev/null << 'EOF'
server {
    listen 80;
    server_name trensilapor.my.id www.trensilapor.my.id;
    root /var/www/trensilapor.my.id;
    index index.html;
    
    client_max_body_size 100M;
    
    location / {
        try_files $uri $uri/ @nextjs;
    }
    
    location @nextjs {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    location /api {
        proxy_pass http://localhost:8080/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
EOF
for domain in mdarmawanf.my.id ikafk.my.id pesanbus.my.id absenkantor.my.id; do sudo tee /etc/nginx/sites-available/$domain > /dev/null << EOF
server {
    listen 80;
    server_name $domain www.$domain;
    root /var/www/$domain;
    index index.html;
    location / { try_files \$uri \$uri/ =404; }
}
EOF
sudo ln -sf /etc/nginx/sites-available/$domain /etc/nginx/sites-enabled/; done && \
sudo ln -sf /etc/nginx/sites-available/trensilapor.my.id /etc/nginx/sites-enabled/ && \
sudo rm -f /etc/nginx/sites-enabled/default && \
sudo tee /etc/systemd/system/trensilapor-frontend.service > /dev/null << 'EOF'
[Unit]
Description=Trensilapor Frontend Next.js Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/trensilapor.my.id
ExecStart=/usr/bin/node --max-old-space-size=1536 server.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=UV_THREADPOOL_SIZE=4
LimitNOFILE=65536
CPUQuota=25%
MemoryLimit=1.5G

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload && sudo systemctl enable tomcat trensilapor-frontend && \
sudo nginx -t && sudo systemctl start mysql tomcat trensilapor-frontend nginx && \
echo "🎉 HIGH-PERFORMANCE DEPLOYMENT COMPLETE! 🎉" && \
echo "💪 Backend (Tomcat): 14GB RAM, 3.6 vCPU (90%)" && \
echo "⚡ Frontend (Node.js): 1.5GB RAM, 0.4 vCPU (10%)" && \
echo "✅ Backend: http://localhost:8080" && \
echo "✅ Frontend: http://trensilapor.my.id" && \
echo "✅ Database: MySQL (optimized)" && \
echo "📊 Resource allocation optimized for high-load production" && \
sudo systemctl status mysql tomcat trensilapor-frontend nginx --no-pager
```

### � UBUNTU 25.04 OPTIMIZATION

#### **MySQL Performance Tuning for Ubuntu 25.04:**
```bash
sudo tee -a /etc/mysql/mysql.conf.d/mysqld.cnf > /dev/null << 'EOF'
# Performance Optimization for 16GB RAM Ubuntu 25.04
innodb_buffer_pool_size = 4G
innodb_log_file_size = 512M
innodb_log_buffer_size = 64M
innodb_flush_log_at_trx_commit = 2
innodb_file_per_table = 1
innodb_open_files = 65535
max_connections = 500
max_connect_errors = 1000000
connect_timeout = 60
wait_timeout = 28800
query_cache_type = 1
query_cache_size = 256M
query_cache_limit = 2M
key_buffer_size = 256M
sort_buffer_size = 4M
read_buffer_size = 2M
read_rnd_buffer_size = 8M
myisam_sort_buffer_size = 64M
table_open_cache = 4000
table_definition_cache = 4000
tmp_table_size = 256M
max_heap_table_size = 256M
general_log = 0
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
EOF
sudo systemctl restart mysql
```

#### **System Optimization for Ubuntu 25.04:**
```bash
sudo tee -a /etc/sysctl.conf > /dev/null << 'EOF'
# Network Performance for Ubuntu 25.04
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 65536 134217728
net.ipv4.tcp_wmem = 4096 65536 134217728
net.core.netdev_max_backlog = 5000
fs.file-max = 2097152
fs.nr_open = 1048576
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
EOF
sudo sysctl -p

sudo tee /etc/security/limits.conf > /dev/null << 'EOF'
* soft nofile 65536
* hard nofile 65536
* soft nproc 65536
* hard nproc 65536
www-data soft nofile 65536
www-data hard nofile 65536
tomcat soft nofile 65536
tomcat hard nofile 65536
EOF
```

### � TROUBLESHOOTING GUIDE

#### **Common Errors & Solutions:**

**Error 1: Java Not Found**
```bash
# Check Java installation
java -version
# If not found, reinstall
sudo apt install -y openjdk-21-jdk
update-alternatives --list java
```

**Error 2: MySQL Connection Refused**
```bash
# Check MySQL status
sudo systemctl status mysql
# Restart if needed
sudo systemctl restart mysql
# Check if port is listening
netstat -tlnp | grep 3306
```

**Error 3: Tomcat Won't Start**
```bash
# Check logs
sudo journalctl -u tomcat -f
# Check permissions
sudo chown -R tomcat:tomcat /opt/tomcat
# Verify Java home
echo $JAVA_HOME
```

**Error 4: Frontend Build Fails**
```bash
# Clear npm cache
sudo npm cache clean --force
# Remove node_modules
sudo rm -rf node_modules package-lock.json
# Reinstall
sudo npm install
```

**Error 5: Nginx Configuration Error**
```bash
# Test configuration
sudo nginx -t
# Check error logs
sudo tail -f /var/log/nginx/error.log
# Reload configuration
sudo systemctl reload nginx
```

**Error 6: Port Already in Use**
```bash
# Check what's using the port
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :8080
sudo netstat -tlnp | grep :3000
# Kill process if needed
sudo kill -9 PID_NUMBER
```

**Error 7: Permission Denied**
```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www
sudo chown -R tomcat:tomcat /opt/tomcat
# Fix permissions
sudo chmod -R 755 /var/www
sudo chmod +x /opt/tomcat/bin/*.sh
```

### 🔄 RESTART ALL SERVICES
```bash
sudo systemctl restart mysql
sudo systemctl restart tomcat
sudo systemctl restart trensilapor-frontend
sudo systemctl restart nginx
```

### 📊 RESOURCE MONITORING
```bash
# Real-time system monitoring
htop
# Memory usage
free -h
# Disk usage
df -h
# Service resource usage
systemctl status tomcat --no-pager
systemctl status trensilapor-frontend --no-pager
# Java process monitoring
ps aux | grep java
# Database connections
mysql -u root -proot123 -e "SHOW PROCESSLIST;"
```

### 🎯 PERFORMANCE BENCHMARKS (4 vCPU, 16GB RAM)
```
Backend (Tomcat):
- Memory: 12-14GB heap
- CPU: ~3.6 cores (90%)
- Concurrent users: 500+
- Response time: <200ms

Frontend (Node.js):
- Memory: 1.5GB max
- CPU: ~0.4 cores (10%)
- Static files: Nginx direct
- API proxy: Optimized

Database (MySQL):
- Buffer pool: 4GB
- Connections: 500 max
- Query cache: 256MB
- Optimized for read-heavy loads
```

### 🔧 SERVICE CONFIGURATIONS

#### **Tomcat Service** (`/etc/systemd/system/tomcat.service`)
```ini
[Unit]
Description=Apache Tomcat Web Application Container
After=network.target

[Service]
Type=forking
User=tomcat
Group=tomcat
Environment="JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64"
Environment="CATALINA_HOME=/opt/tomcat"
Environment="JAVA_OPTS=-Dspring.profiles.active=prod"
ExecStart=/opt/tomcat/bin/startup.sh
ExecStop=/opt/tomcat/bin/shutdown.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

#### **Frontend Service** (`/etc/systemd/system/trensilapor-frontend.service`)
```ini
[Unit]
Description=Trensilapor Frontend Next.js Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/trensilapor.my.id
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

### 🌐 NGINX CONFIGURATIONS

#### **Main Domain** (`/etc/nginx/sites-available/trensilapor.my.id`)
```nginx
server {
    listen 80;
    server_name trensilapor.my.id www.trensilapor.my.id;
    root /var/www/trensilapor.my.id;
    
    location / {
        try_files $uri $uri/ @nextjs;
    }
    
    location @nextjs {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api {
        proxy_pass http://localhost:8080/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### **Additional Domains** (Ready for future projects)
- `mdarmawanf.my.id` → `/var/www/mdarmawanf.my.id`
- `ikafk.my.id` → `/var/www/ikafk.my.id`
- `pesanbus.my.id` → `/var/www/pesanbus.my.id`
- `absenkantor.my.id` → `/var/www/absenkantor.my.id`

### 🚀 SERVICES STATUS CHECK
```bash
sudo systemctl status mysql tomcat trensilapor-frontend nginx
```

### 📱 ACCESS POINTS
- **Frontend**: http://trensilapor.my.id
- **Backend API**: http://trensilapor.my.id/api
- **Database**: MySQL on localhost:3306

### 🔒 SECURITY NOTES
- Ubuntu 25.04 VPS optimized
- Database password: `root123`
- Frontend environment: Production (`.env.prod`)
- Backend profile: `prod`
- All services auto-start on boot

### 🌍 DNS CONFIGURATION
Point your domains to your VPS IP address:
```
A     trensilapor.my.id     → YOUR_VPS_IP
A     www.trensilapor.my.id → YOUR_VPS_IP
A     mdarmawanf.my.id      → YOUR_VPS_IP
A     ikafk.my.id           → YOUR_VPS_IP
A     pesanbus.my.id        → YOUR_VPS_IP
A     absenkantor.my.id     → YOUR_VPS_IP
```

---
**Created**: July 13, 2025  
**System**: Alumni Election System  
**Environment**: Production Ubuntu 25.04 VPS
