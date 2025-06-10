# EventPlatform - Plataforma de Gerenciamento de Eventos

Uma plataforma completa para gerenciamento e descoberta de eventos com mapa interativo, desenvolvida com Next.js, Prisma, PostgreSQL e Shadcn/ui.

## 🚀 Funcionalidades

### 📅 Gerenciamento de Eventos
- **RF001** - Cadastro de eventos com informações completas
- **RF002** - Edição de eventos existentes
- **RF003** - Visualização de lista de eventos
- **RF004** - Exclusão de eventos (com validações)
- **RF005** - Busca avançada por nome, data e local

### 👥 Gerenciamento de Participantes
- **RF006** - Cadastro de participantes
- **RF007** - Inscrição em eventos
- **RF008** - Cancelamento de inscrições
- **RF009** - Visualização de inscrições do usuário
- **RF010** - Geração de lista de presença

### 🔐 Autenticação e Autorização
- **RF011** - Sistema de login seguro
- **RF012** - Registro de novos usuários
- **RF013** - Controle de acesso por perfil (Admin/Participante)

### 📊 Relatórios
- **RF014** - Relatório de vagas disponíveis
- **RF015** - Relatório de participantes por evento

### 🗺️ Funcionalidades Especiais
- Visualização em mapa interativo
- Filtros por categoria
- Interface responsiva
- Animações com Framer Motion

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Shadcn/ui, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: bcryptjs para hash de senhas
- **Mapa**: Leaflet/OpenStreetMap (em desenvolvimento)
- **Containerização**: Docker e Docker Compose

## 📋 Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (apenas para desenvolvimento local)
- PostgreSQL (apenas para desenvolvimento local)

## 🚀 Instalação e Configuração

### 🐳 Método Recomendado: Docker (Mais Fácil)

#### Opção 1: Setup Automático
```bash
# Clone o repositório
git clone <repository-url>
cd event-platform

# Execute o script de setup automático
./scripts/setup.sh
```

#### Opção 2: Setup Manual com Docker
```bash
# Clone o repositório
git clone <repository-url>
cd event-platform

# Construir e iniciar os serviços
make quick-start

# Ou comandos individuais:
make build          # Construir imagens
make up-detached    # Iniciar serviços
make setup          # Configurar banco e seed
```

#### Comandos Docker Úteis
```bash
# Comandos básicos
make help           # Ver todos os comandos disponíveis
make up             # Iniciar serviços
make down           # Parar todos os serviços
make logs           # Ver logs
make restart        # Reiniciar serviços

# Banco de dados
make setup          # Aplicar schema e seed
make seed           # Apenas popular dados
make studio         # Abrir Prisma Studio

# Produção
make prod-build     # Build para produção
make prod-up        # Executar em produção

# Manutenção
make clean          # Limpar tudo
make reset          # Reset completo
```

### 💻 Método Alternativo: Desenvolvimento Local

#### 1. Clone o repositório
```bash
git clone <repository-url>
cd event-platform
```

#### 2. Instale as dependências
```bash
npm install
```

#### 3. Configure o banco de dados
Crie um arquivo `.env` na raiz do projeto:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/eventplatform"
```

#### 4. Configure o banco de dados
```bash
# Gerar o cliente Prisma
npm run db:generate

# Aplicar o schema ao banco
npm run db:push

# Popular com dados iniciais
npm run db:seed
```

#### 5. Execute o projeto
```bash
npm run dev
```

## 🌐 Acesso

Após a configuração, o projeto estará disponível em:
- **Aplicação**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (execute `make studio`)
- **Banco PostgreSQL**: localhost:5432

## 📊 Dados Iniciais (Seed)

O script de seed cria:
- **Usuário Admin**: admin@eventplatform.com / admin123
- **5 Usuários Participantes**: user1@example.com até user5@example.com / user123
- **6 Categorias**: Música, Tecnologia, Gastronomia, Esportes, Arte e Cultura, Negócios
- **6 Eventos de Exemplo** com inscrições simuladas

## 🗂️ Estrutura do Projeto

```
event-platform/
├── docker-compose.yml        # Orquestração Docker
├── Dockerfile                # Container da aplicação
├── Makefile                  # Comandos úteis
├── scripts/
│   └── setup.sh             # Script de configuração automática
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── seed.ts               # Script de população inicial
├── src/
│   ├── app/
│   │   ├── api/              # Rotas da API
│   │   │   ├── events/       # CRUD de eventos
│   │   │   ├── inscriptions/ # Gerenciamento de inscrições
│   │   │   └── categories/   # Gerenciamento de categorias
│   │   ├── layout.tsx        # Layout principal
│   │   └── page.tsx          # Página inicial
│   ├── components/
│   │   └── ui/               # Componentes do Shadcn/ui
│   └── lib/
│       ├── prisma.ts         # Cliente Prisma
│       ├── auth.ts           # Funções de autenticação
│       └── utils.ts          # Utilitários
└── package.json
```

## 🐳 Docker Services

### Serviços Principais
- **app**: Aplicação Next.js (porta 3000)
- **postgres**: Banco PostgreSQL (porta 5432)

### Serviços Opcionais (Profiles)
- **app-prod**: Versão de produção (porta 3001)
- **prisma-studio**: Interface do banco (porta 5555)
- **redis**: Cache Redis (porta 6379)

### Comandos por Profile
```bash
# Iniciar apenas desenvolvimento (padrão)
docker-compose up

# Iniciar com Prisma Studio
docker-compose --profile studio up

# Iniciar em produção
docker-compose --profile production up

# Iniciar com Redis
docker-compose --profile cache up
```

## 🔌 API Endpoints

### Eventos
- `GET /api/events` - Listar eventos
- `POST /api/events` - Criar evento
- `GET /api/events/[id]` - Obter evento específico
- `PUT /api/events/[id]` - Atualizar evento
- `DELETE /api/events/[id]` - Excluir evento

### Inscrições
- `GET /api/inscriptions` - Listar inscrições do usuário
- `POST /api/inscriptions` - Criar inscrição
- `DELETE /api/inscriptions/[id]` - Cancelar inscrição

### Categorias
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria

## 🎨 Interface

### Página Principal
- Lista de eventos em cards
- Filtros por categoria
- Busca por texto
- Toggle entre visualização em lista e mapa
- Design responsivo com gradientes

### Funcionalidades da UI
- Animações suaves com Framer Motion
- Componentes acessíveis do Shadcn/ui
- Toast notifications com Sonner
- Design system consistente

## 🔒 Segurança

- Senhas hasheadas com bcryptjs
- Validação de entrada em todas as APIs
- Controle de acesso baseado em roles
- Sanitização de dados
- Containers isolados com Docker

## 📱 Responsividade

- Design mobile-first
- Breakpoints otimizados
- Interface adaptável para desktop, tablet e mobile

## 🔧 Desenvolvimento

### Comandos de Desenvolvimento
```bash
# Executar localmente (sem Docker)
npm run dev

# Executar no Docker
make up

# Acessar container
make shell

# Instalar pacotes
make install PACKAGE=nome-do-pacote

# Ver logs
make logs-app
```

### Backup e Restauração
```bash
# Fazer backup
make backup

# Restaurar backup
make restore FILE=backup.sql
```

## 🚧 Próximas Funcionalidades

- [ ] Implementação completa do mapa interativo
- [ ] Sistema de pagamentos
- [ ] Notificações por email
- [ ] Upload de imagens para eventos
- [ ] Sistema de reviews e avaliações
- [ ] Dashboard administrativo
- [ ] Relatórios avançados
- [ ] Integração com calendário

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato através do email: admin@eventplatform.com

## 🆘 Solução de Problemas

### Problemas Comuns

#### Docker não inicia
```bash
# Verificar se Docker está rodando
docker info

# Limpar containers antigos
make clean

# Reconstruir do zero
make reset
```

#### Erro de conexão com banco
```bash
# Verificar logs do PostgreSQL
make logs-postgres

# Recriar apenas o banco
docker-compose up -d postgres
```

#### Prisma Client desatualizado
```bash
# Regenerar cliente
docker-compose exec app npm run db:generate
```

#### Portas em uso
```bash
# Verificar portas em uso
lsof -i :3000
lsof -i :5432

# Parar todos os containers
make down
```
