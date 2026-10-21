# Verisett AI — AWS Free-Tier Clearinghouse Worker

This worker handles cryptographic verification and heavy execution payloads dispatched from Verisett AI's Next.js frontend/clearinghouse bridge.

It is 100% dependency-free (native Node.js `http` and `crypto` modules) and operates within AWS Free Tier limits.

---

## 1. AWS Lambda Deployment (1 Million Free Requests/Month)

1. **Zip the worker**:
   ```bash
   cd backend/aws-worker
   zip -r function.zip handler.js package.json
   ```

2. **Create or Update AWS Lambda Function**:
   - Runtime: `Node.js 20.x` or `Node.js 22.x`
   - Architecture: `arm64` (Graviton) or `x86_64`
   - Handler: `handler.handler`
   - Memory: `128 MB` to `256 MB`
   - Timeout: `15 seconds`

3. **Configure Environment Variables in Lambda Console**:
   - `AWS_WORKER_SECRET_KEY`: `<your_secure_worker_secret>`

4. **Enable Function URL or API Gateway**:
   - Set Auth type to `NONE` (the function validates `AWS_WORKER_SECRET_KEY` directly via headers).
   - Copy the Function URL and set it as `AWS_WORKER_URL` in your Next.js `.env.local` or Vercel environment variables.

---

## 2. AWS EC2 Deployment (`t2.micro` / `t3.micro` Free Tier)

1. Launch an EC2 instance with Amazon Linux 2023 or Ubuntu 24.04 (Free Tier eligible).
2. Install Node.js:
   ```bash
   curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
   sudo dnf install -y nodejs
   ```
3. Copy `handler.js` to `/opt/verisett-worker/`.
4. Run as a systemd service:
   ```ini
   # /etc/systemd/system/verisett-worker.service
   [Unit]
   Description=Verisett AI Clearinghouse Worker
   After=network.target

   [Service]
   Type=simple
   User=ec2-user
   WorkingDirectory=/opt/verisett-worker
   ExecStart=/usr/bin/node /opt/verisett-worker/handler.js
   Restart=always
   Environment=PORT=8080
   Environment=AWS_WORKER_SECRET_KEY=your_secure_worker_secret

   [Install]
   WantedBy=multi-user.target
   ```
5. Start and enable service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now verisett-worker
   ```
6. Set `AWS_WORKER_URL=http://<ec2-ip>:8080` in your Vercel project settings.
