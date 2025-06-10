#!/bin/bash

# Script de Deploy para EC2
# Certifique-se de ter Docker e Docker Compose instalados na EC2

set -e

echo "🚀 Iniciando deploy na EC2..."

# Parar containers existentes (se houver)
echo "📦 Parando containers existentes..."
docker-compose -f docker-compose.ec2.yml down || true

# Limpar imagens antigas (opcional)
echo "🧹 Limpando imagens antigas..."
docker system prune -f || true

# Construir nova imagem
echo "🔨 Construindo nova imagem..."
docker-compose -f docker-compose.ec2.yml build --no-cache

# Executar migrações do banco
echo "🗃️ Executando migrações do banco..."
docker-compose -f docker-compose.ec2.yml --profile migration run --rm migration

# Iniciar aplicação
echo "🎯 Iniciando aplicação..."
docker-compose -f docker-compose.ec2.yml up -d

# Mostrar status
echo "📊 Status dos containers:"
docker-compose -f docker-compose.ec2.yml ps

echo "✅ Deploy concluído!"
echo "🌐 Aplicação disponível em: http://$(curl -s ifconfig.me):3000"
echo "📝 Para verificar logs: docker-compose -f docker-compose.ec2.yml logs -f" 