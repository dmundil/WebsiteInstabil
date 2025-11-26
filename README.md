# Dynamic CRM Sandbox

This repository contains a self-contained Node.js demo that serves a dynamic CRM UI. The page randomizes DOM selectors and rotates synonym-based headings to emulate unstable front-end structures.

## Recommended cloud server (Hetzner)
- **Instance type:** A small Hetzner Cloud VM (e.g., **CX22** or **CPX11**) with Ubuntu 22.04 is sufficient. The app is lightweight and runs comfortably within 1 vCPU and 2 GB RAM.
- **Network:** Open inbound TCP port **3000** (or your chosen port) in both the Hetzner firewall and the VM.

## Required software
- **Node.js 18+** (includes `npm`). No additional system packages or databases are required.
- **git** (optional) to clone the repository if you are not copying files via another method.

## One-time setup on the server
```bash
# Update package lists
sudo apt update

# Install Node.js 18 LTS from NodeSource (recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# (Optional) verify installation
node -v
npm -v

# Clone the project (or upload your copy)
git clone https://example.com/your/repo.git WebsiteInstabil
cd WebsiteInstabil

# Install dependencies (none declared, but npm will set up lockfiles)
npm install
```

## Running the app
```bash
# From the project directory
npm start
```
The server listens on **http://localhost:3000**. To run it in the background, you can use tools like `tmux`, `screen`, or `nohup`:
```bash
nohup npm start >/var/log/websiteinstabil.log 2>&1 &
```

## Firewall and access tips
- Ensure port **3000** is allowed in the Hetzner Cloud firewall and the VM (`ufw allow 3000/tcp`).
- If you prefer port **80** or **443**, use a reverse proxy such as Nginx or Caddy in front of the Node app.

## Updating and restarting
```bash
# Pull the latest changes
git pull

# Restart the app (stop the old process, then start again)
pkill -f "node server.js" || true
npm start
```

## Logs and troubleshooting
- Default runtime output appears in the terminal where you start the server.
- If using `nohup`, check `/var/log/websiteinstabil.log` (per the command above).
- Confirm Node is installed and the port is open if you cannot reach the site.
