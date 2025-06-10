# Deploy na Vercel

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente na Vercel:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:5432/database"

# NextAuth (opcional para futuras funcionalidades)
NEXTAUTH_URL="https://seu-dominio.vercel.app"
NEXTAUTH_SECRET="seu-secret-aqui"
```

## Comandos de Build

O projeto está configurado para usar:
- Install: `npm install && npm run prisma`
- Build: `npm run build`
- Start: `npm start`

## Database Setup

1. Configure uma instância PostgreSQL (ex: Neon, Supabase, ou Railway)
2. Adicione a DATABASE_URL nas variáveis de ambiente da Vercel
3. O Prisma generate será executado automaticamente durante o build

## Estrutura

- **Framework**: Next.js 15
- **Database**: PostgreSQL via Prisma
- **UI**: Tailwind CSS + Radix UI
- **Maps**: Leaflet
- **Animations**: Framer Motion 