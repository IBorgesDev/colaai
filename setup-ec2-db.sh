#!/bin/bash

# Script para configurar database na EC2 para uso com Vercel

set -e

echo "🗃️ Configurando PostgreSQL na EC2 para Vercel..."

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "📦 Instalando PostgreSQL..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
fi

# Obter versão do PostgreSQL
PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | grep -oP '\d+\.\d+' | head -1)
echo "📊 PostgreSQL versão: $PG_VERSION"

# Configurar postgresql.conf
echo "⚙️ Configurando postgresql.conf..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf

# Configurar pg_hba.conf
echo "🔐 Configurando pg_hba.conf..."
echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf

# Reiniciar PostgreSQL
echo "🔄 Reiniciando PostgreSQL..."
sudo systemctl restart postgresql

# Criar database e usuário
echo "👤 Criando database e usuário..."
sudo -u postgres psql <<EOF
CREATE DATABASE eventplatform;
CREATE USER eventplatform_user WITH PASSWORD 'eventplatform_2024!';
GRANT ALL PRIVILEGES ON DATABASE eventplatform TO eventplatform_user;
ALTER USER eventplatform_user CREATEDB;
\q
EOF

# Mostrar IP da EC2
EC2_IP=$(curl -s ifconfig.me)
echo "🌐 IP da EC2: $EC2_IP"

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "📋 Variáveis para Vercel:"
echo "DATABASE_URL=postgresql://eventplatform_user:eventplatform_2024!@$EC2_IP:5432/eventplatform"
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo ""
echo "⚠️  IMPORTANTE:"
echo "1. Configure o Security Group da EC2 para permitir porta 5432"
echo "2. Use um Elastic IP para evitar mudanças de IP"
echo "3. Troque a senha padrão por uma mais segura" 