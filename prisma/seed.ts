import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create categories
  const categories = [
    {
      name: 'Música',
      description: 'Eventos musicais, shows, festivais e concertos',
      color: '#FF6B6B',
      icon: 'music'
    },
    {
      name: 'Tecnologia',
      description: 'Workshops, palestras e eventos sobre tecnologia',
      color: '#4ECDC4',
      icon: 'laptop'
    },
    {
      name: 'Gastronomia',
      description: 'Eventos gastronômicos, feiras e degustações',
      color: '#FFE66D',
      icon: 'utensils'
    },
    {
      name: 'Esportes',
      description: 'Eventos esportivos, competições e atividades físicas',
      color: '#95E1D3',
      icon: 'trophy'
    },
    {
      name: 'Arte e Cultura',
      description: 'Exposições, teatro, cinema e eventos culturais',
      color: '#A8E6CF',
      icon: 'palette'
    },
    {
      name: 'Negócios',
      description: 'Networking, palestras e eventos corporativos',
      color: '#C7CEEA',
      icon: 'briefcase'
    }
  ]

  console.log('📂 Creating categories...')
  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.eventCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category
    })
    createdCategories.push(created)
    console.log(`✅ Category created: ${created.name}`)
  }

  // Create admin user
  console.log('👤 Creating admin user...')
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@eventplatform.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@eventplatform.com',
      password: hashedPassword,
      phone: '+55 11 99999-9999',
      cpf: '12345678901',
      role: 'ADMIN'
    }
  })
  console.log(`✅ Admin user created: ${adminUser.email}`)

  // Create sample participant users
  console.log('👥 Creating sample participants...')
  const participants = []
  for (let i = 1; i <= 5; i++) {
    const hashedParticipantPassword = await bcrypt.hash('user123', 12)
    const participant = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        name: `Usuário ${i}`,
        email: `user${i}@example.com`,
        password: hashedParticipantPassword,
        phone: `+55 11 9999${i}-999${i}`,
        cpf: `1234567890${i}`,
        role: 'PARTICIPANT'
      }
    })
    participants.push(participant)
    console.log(`✅ Participant created: ${participant.email}`)
  }

  // Create sample events
  console.log('🎉 Creating sample events...')
  const events = [
    {
      title: 'Festival de Música Eletrônica 2024',
      description: 'Uma noite incrível com os melhores DJs da cidade. Venha dançar e se divertir com a melhor música eletrônica!',
      startDate: new Date('2024-03-15T20:00:00'),
      endDate: new Date('2024-03-16T04:00:00'),
      location: 'Centro de Convenções Anhembi',
      address: 'Av. Olavo Fontoura, 1209 - Santana, São Paulo - SP',
      latitude: -23.5505,
      longitude: -46.6333,
      maxParticipants: 500,
      price: 80.00,
      categoryName: 'Música'
    },
    {
      title: 'Workshop: Desenvolvimento Web Moderno',
      description: 'Aprenda as tecnologias mais modernas do mercado: React, Next.js, TypeScript e muito mais!',
      startDate: new Date('2024-03-20T09:00:00'),
      endDate: new Date('2024-03-20T17:00:00'),
      location: 'Tech Hub São Paulo',
      address: 'Rua da Inovação, 123 - Vila Madalena, São Paulo - SP',
      latitude: -23.5489,
      longitude: -46.6388,
      maxParticipants: 50,
      price: 0,
      categoryName: 'Tecnologia'
    },
    {
      title: 'Feira Gastronômica Internacional',
      description: 'Sabores únicos e experiências culinárias incríveis de diversos países. Uma viagem gastronômica inesquecível!',
      startDate: new Date('2024-03-25T11:00:00'),
      endDate: new Date('2024-03-25T22:00:00'),
      location: 'Parque Ibirapuera',
      address: 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP',
      latitude: -23.5873,
      longitude: -46.6573,
      maxParticipants: 1000,
      price: 25.00,
      categoryName: 'Gastronomia'
    },
    {
      title: 'Maratona de São Paulo 2024',
      description: 'Participe da maior maratona da América Latina! 42km de pura adrenalina pelas ruas de São Paulo.',
      startDate: new Date('2024-04-05T06:00:00'),
      endDate: new Date('2024-04-05T14:00:00'),
      location: 'Parque do Ibirapuera',
      address: 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP',
      latitude: -23.5873,
      longitude: -46.6573,
      maxParticipants: 2000,
      price: 120.00,
      categoryName: 'Esportes'
    },
    {
      title: 'Exposição: Arte Digital Contemporânea',
      description: 'Uma exposição única que explora a intersecção entre arte e tecnologia no século XXI.',
      startDate: new Date('2024-04-10T10:00:00'),
      endDate: new Date('2024-04-10T18:00:00'),
      location: 'Museu de Arte Moderna',
      address: 'Parque Ibirapuera - Portão 3, São Paulo - SP',
      latitude: -23.5873,
      longitude: -46.6573,
      maxParticipants: 200,
      price: 15.00,
      categoryName: 'Arte e Cultura'
    },
    {
      title: 'Summit de Inovação e Empreendedorismo',
      description: 'Conecte-se com empreendedores, investidores e inovadores. Palestras inspiradoras e networking de alto nível.',
      startDate: new Date('2024-04-15T08:00:00'),
      endDate: new Date('2024-04-15T18:00:00'),
      location: 'Centro de Convenções Frei Caneca',
      address: 'Rua Frei Caneca, 569 - Consolação, São Paulo - SP',
      latitude: -23.5505,
      longitude: -46.6333,
      maxParticipants: 300,
      price: 200.00,
      categoryName: 'Negócios'
    }
  ]

  for (const eventData of events) {
    const category = createdCategories.find(c => c.name === eventData.categoryName)
    if (!category) continue

    const event = await prisma.event.create({
      data: {
        title: eventData.title,
        description: eventData.description,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        location: eventData.location,
        address: eventData.address,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        maxParticipants: eventData.maxParticipants,
        price: eventData.price,
        status: 'PUBLISHED',
        isPublic: true,
        organizerId: adminUser.id,
        categoryId: category.id
      }
    })

    // Create some sample inscriptions
    const numInscriptions = Math.floor(Math.random() * Math.min(participants.length, eventData.maxParticipants / 10))
    for (let i = 0; i < numInscriptions; i++) {
      const participant = participants[i]
      await prisma.inscription.create({
        data: {
          participantId: participant.id,
          eventId: event.id,
          status: 'ACTIVE',
          paid: eventData.price === 0,
          ticketCode: `TICKET-${event.id.slice(-8)}-${participant.id.slice(-8)}-${Date.now() + i}`
        }
      })
    }

    console.log(`✅ Event created: ${event.title} (${numInscriptions} inscriptions)`)
  }

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 