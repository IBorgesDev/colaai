# Configuração da Database EC2 para Vercel

## 1. Configurar PostgreSQL para Conexões Externas

### Editar postgresql.conf
```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```

Encontre e altere:
```bash
# Era:
# listen_addresses = 'localhost'

# Mude para:
listen_addresses = '*'
```

### Editar pg_hba.conf
```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Adicione no final:
```bash
# Permitir conexões da Vercel (substituir pelas IPs da Vercel ou usar 0.0.0.0/0 temporariamente)
host    all             all             0.0.0.0/0               md5
```

### Reiniciar PostgreSQL
```bash
sudo systemctl restart postgresql
```

## 2. Configurar Security Group da EC2

No AWS Console:
1. Vá em **EC2** → **Security Groups**
2. Encontre o Security Group da sua instância
3. Adicione **Inbound Rule**:
   - **Type**: Custom TCP
   - **Port**: 5432 (PostgreSQL)
   - **Source**: 0.0.0.0/0 (ou IPs da Vercel para mais segurança)

## 3. Criar Database e Usuário

```sql
-- Conectar como postgres
sudo -u postgres psql

-- Criar database
CREATE DATABASE eventplatform;

-- Criar usuário
CREATE USER eventplatform_user WITH PASSWORD 'sua_senha_segura_aqui';

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE eventplatform TO eventplatform_user;

-- Permitir criar schemas (para Prisma)
ALTER USER eventplatform_user CREATEDB;

\q
```

## 4. Testar Conexão

```bash
# Teste local
psql -h SEU_IP_EC2 -U eventplatform_user -d eventplatform

# URL final para Vercel:
# postgresql://eventplatform_user:sua_senha_segura_aqui@SEU_IP_EC2:5432/eventplatform
```

## 5. Configurar na Vercel

**Environment Variables:**
```bash
DATABASE_URL=postgresql://eventplatform_user:sua_senha_segura_aqui@SEU_IP_EC2:5432/eventplatform
NEXTAUTH_SECRET=seu_secret_muito_seguro_aqui
NEXTAUTH_URL=https://seu-app.vercel.app
```

## 🔒 Dicas de Segurança

1. **Use IP Elastic**: Configure um Elastic IP na EC2
2. **Firewall Específico**: Limite acesso apenas aos IPs da Vercel
3. **SSL**: Configure SSL no PostgreSQL (opcional)
4. **Backup**: Configure backups automáticos 