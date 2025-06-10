import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes
  await prisma.review.deleteMany()
  await prisma.inscription.deleteMany()
  await prisma.event.deleteMany()
  await prisma.eventCategory.deleteMany()
  await prisma.user.deleteMany()

  // Hash das senhas
  const adminPassword = await bcrypt.hash('admin123', 12)
  const orgPassword = await bcrypt.hash('org123', 12)
  const userPassword = await bcrypt.hash('user123', 12)

  // Criar usuários
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Sistema',
      email: 'admin@test.com',
      password: adminPassword,
      role: 'ADMIN',
    }
  })

  const organizer = await prisma.user.create({
    data: {
      name: 'João Organizador',
      email: 'org@test.com',
      password: orgPassword,
      role: 'ADMIN', // Organizadores têm role ADMIN para criar eventos
    }
  })

  const participant = await prisma.user.create({
    data: {
      name: 'Maria Participante',
      email: 'user@test.com',
      password: userPassword,
      role: 'PARTICIPANT',
    }
  })

  console.log('✅ Usuários criados')

  // Criar categorias de eventos
  const techCategory = await prisma.eventCategory.create({
    data: {
      name: 'Tecnologia',
      description: 'Eventos relacionados a tecnologia e inovação',
      color: '#3B82F6',
      icon: 'tech'
    }
  })

  const businessCategory = await prisma.eventCategory.create({
    data: {
      name: 'Negócios',
      description: 'Eventos sobre empreendedorismo e negócios',
      color: '#10B981',
      icon: 'business'
    }
  })

  const educationCategory = await prisma.eventCategory.create({
    data: {
      name: 'Educação',
      description: 'Workshops e cursos educacionais',
      color: '#F59E0B',
      icon: 'education'
    }
  })

  const networkingCategory = await prisma.eventCategory.create({
    data: {
      name: 'Networking',
      description: 'Eventos para networking e relacionamento',
      color: '#8B5CF6',
      icon: 'networking'
    }
  })

  console.log('✅ Categorias criadas')

  // Criar eventos
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const event1 = await prisma.event.create({
    data: {
      title: 'Conferência de IA e Machine Learning',
      description: 'Explore as últimas tendências em Inteligência Artificial e Machine Learning. Palestrantes renomados compartilharão insights sobre o futuro da tecnologia.',
      startDate: nextWeek,
      endDate: new Date(nextWeek.getTime() + 8 * 60 * 60 * 1000), // 8 horas depois
      location: 'Centro de Convenções Anhembi - São Paulo, SP',
      address: 'Av. Olavo Fontoura, 1209 - Santana, São Paulo - SP',
      latitude: -23.5154,
      longitude: -46.6154,
      maxParticipants: 500,
      price: 89.90,
      isPublic: true,
      status: 'PUBLISHED',
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
      organizerId: organizer.id,
      categoryId: techCategory.id,
    }
  })

  const event2 = await prisma.event.create({
    data: {
      title: 'Workshop de Empreendedorismo Digital',
      description: 'Aprenda as estratégias fundamentais para criar e escalar um negócio digital. Inclui cases práticos e networking.',
      startDate: tomorrow,
      endDate: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000), // 4 horas depois
      location: 'Espaço de Coworking CUBO - São Paulo, SP',
      address: 'R. Consolação, 247 - República, São Paulo - SP',
      latitude: -23.5505,
      longitude: -46.6333,
      maxParticipants: 50,
      price: 0, // Gratuito
      isPublic: true,
      status: 'PUBLISHED',
      imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
      organizerId: organizer.id,
      categoryId: businessCategory.id,
    }
  })

  const event3 = await prisma.event.create({
    data: {
      title: 'Curso de Desenvolvimento Web Full Stack',
      description: 'Curso intensivo de 3 dias sobre desenvolvimento web moderno. React, Node.js, PostgreSQL e deploy na nuvem.',
      startDate: nextMonth,
      endDate: new Date(nextMonth.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 dias
      location: 'Campus da USP - São Paulo, SP',
      address: 'Av. Prof. Luciano Gualberto, 403 - Cidade Universitária, São Paulo - SP',
      latitude: -23.5587,
      longitude: -46.7317,
      maxParticipants: 30,
      price: 299.90,
      isPublic: true,
      status: 'PUBLISHED',
      imageUrl: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800',
      organizerId: organizer.id,
      categoryId: educationCategory.id,
    }
  })

  const event4 = await prisma.event.create({
    data: {
      title: 'Meetup de Desenvolvedores JavaScript',
      description: 'Encontro mensal da comunidade JavaScript de São Paulo. Palestras técnicas, networking e pizza!',
      startDate: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      location: 'Google Campus São Paulo - SP',
      address: 'R. Elvira Ferraz, 250 - Vila Olímpia, São Paulo - SP',
      latitude: -23.5958,
      longitude: -46.6869,
      maxParticipants: 100,
      price: 0,
      isPublic: true,
      status: 'PUBLISHED',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      organizerId: organizer.id,
      categoryId: networkingCategory.id,
    }
  })

  console.log('✅ Eventos criados')

  // Criar algumas inscrições
  await prisma.inscription.create({
    data: {
      participantId: participant.id,
      eventId: event2.id,
      status: 'ACTIVE',
      paid: true, // Evento gratuito
    }
  })

  await prisma.inscription.create({
    data: {
      participantId: participant.id,
      eventId: event4.id,
      status: 'ACTIVE',
      paid: true,
    }
  })

  console.log('✅ Inscrições criadas')

  console.log('🎉 Seed concluído com sucesso!')
  console.log('')
  console.log('📧 Contas de teste:')
  console.log('Admin: admin@test.com / admin123')
  console.log('Organizador: org@test.com / org123')
  console.log('Participante: user@test.com / user123')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 