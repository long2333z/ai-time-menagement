#!/bin/bash

# 将SSH公钥添加到服务器
# 需要输入服务器root密码

SERVER_IP="43.134.233.165"
SERVER_USER="root"

# 你的SSH公钥
SSH_PUBLIC_KEY="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCn6aXpNl6knqoj2y1VZlOZhPPne8lmMv/hpqlCK4xpQwWe98KHbOIkYqpj8gtni56R/M4R5cBsIdRvAyMUKjpoeEQ2n311cg0I10fV0qHExE95LdaoJ9Cy4xU5Q3MoZlhgLP8yFc4McE9Mk7KDtpgD4oKCop8WzHocfAG1YUHUlDrT4YVcHDT5dEehIJbUtojrppwA4FENxRJtcHrsHEn4IW0ExWeCgxla1qWFlqC6rpkyvcHRcHATY2ZrzRSied+9WUAyWnxRTg9aV32kPJIrWzTepxSL8dUVnFo1pvvVf3bm3egr94DrufcjNnrvPDxvUZEX/q6JEHuavdI1R3V/ skey-4cmyb5qz"

echo "正在将SSH公钥添加到服务器 ${SERVER_IP}..."
echo "请在提示时输入服务器root密码"
echo ""

ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '${SSH_PUBLIC_KEY}' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo 'SSH密钥已添加'"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ SSH密钥配置成功！"
    echo "现在可以运行 ./deploy-full.sh 进行部署"
else
    echo ""
    echo "✗ SSH密钥配置失败"
    echo "请检查密码是否正确"
fi
