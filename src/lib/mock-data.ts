import { User, Event, EventCategory, Inscription, EventOrganizer, EventReview, EventStats, QRCodeScan } from './types';

// Usuários disponíveis para teste
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    role: 'PARTICIPANT',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao',
    bio: 'Entusiasta de eventos e novas experiências',
    phone: '+55 11 99999-1234'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@eventospro.com',
    role: 'ORGANIZER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    bio: 'Especialista em eventos corporativos e culturais há 10 anos',
    phone: '+55 11 99999-5678'
  },
  {
    id: '3',
    name: 'Carlos Mendes',
    email: 'carlos@techevents.com',
    role: 'ORGANIZER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
    bio: 'Organizador de eventos de tecnologia e inovação',
    phone: '+55 11 99999-9012'
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@culturasp.com',
    role: 'ORGANIZER',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
    bio: 'Produtora cultural especializada em eventos gastronômicos e artísticos',
    phone: '+55 11 99999-3456'
  },
  {
    id: '5',
    name: 'Admin Sistema',
    email: 'admin@colaai.com',
    role: 'ADMIN',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    bio: 'Administrador do sistema',
    phone: '+55 11 99999-0000'
  }
];

// Função para obter usuário atual do localStorage
const getCurrentUserFromStorage = (): User => {
  if (typeof window === 'undefined') {
    return mockUsers[0]; // SSR fallback
  }
  
  try {
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId) {
      const user = mockUsers.find(u => u.id === savedUserId);
      if (user) {
        return user;
      }
    }
  } catch (error) {
    console.warn('Erro ao ler localStorage:', error);
  }
  
  return mockUsers[0]; // Fallback para João Silva
};

// Usuário logado atual (pode ser alterado dinamicamente)
export let mockUser: User = getCurrentUserFromStorage();

// Função para trocar de usuário
export const switchUser = (userId: string) => {
  const user = mockUsers.find(u => u.id === userId);
  if (user) {
    mockUser = user;
    
    // Salvar no localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('currentUserId', userId);
      } catch (error) {
        console.warn('Erro ao salvar no localStorage:', error);
      }
    }
    
    // Atualizar eventos para refletir as permissões do novo usuário
    updateEventsForCurrentUser();
    return user;
  }
  return null;
};

// Função para obter usuário atual
export const getCurrentUser = () => {
  // Sempre verificar o localStorage para ter o valor mais atual
  const currentFromStorage = getCurrentUserFromStorage();
  if (currentFromStorage.id !== mockUser.id) {
    mockUser = currentFromStorage;
    updateEventsForCurrentUser();
  }
  return mockUser;
};

// Organizadores mockados (baseados nos usuários organizadores)
export const mockOrganizers: EventOrganizer[] = [
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@eventospro.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    bio: 'Especialista em eventos corporativos e culturais há 10 anos',
    company: 'Eventos Pro',
    phone: '+55 11 99999-5678',
    rating: 4.8,
    totalEvents: 45
  },
  {
    id: '3',
    name: 'Carlos Mendes',
    email: 'carlos@techevents.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
    bio: 'Organizador de eventos de tecnologia e inovação',
    company: 'Tech Events',
    phone: '+55 11 99999-9012',
    rating: 4.6,
    totalEvents: 32
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@culturasp.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
    bio: 'Produtora cultural especializada em eventos gastronômicos e artísticos',
    company: 'Cultura SP',
    phone: '+55 11 99999-3456',
    rating: 4.9,
    totalEvents: 28
  }
];

// Categorias mockadas
export const mockCategories: EventCategory[] = [
  { id: '1', name: 'Música', color: '#ff6b6b' },
  { id: '2', name: 'Tecnologia', color: '#4ecdc4' },
  { id: '3', name: 'Gastronomia', color: '#45b7d1' },
  { id: '4', name: 'Esportes', color: '#96ceb4' },
  { id: '5', name: 'Arte e Cultura', color: '#feca57' },
  { id: '6', name: 'Negócios', color: '#ff9ff3' },
];

// Função para gerar QR Code (simulado)
const generateQRCode = (data: string) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
};

// Eventos mockados com mais detalhes
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Festival de Jazz na Cidade',
    description: 'Um festival incrível de jazz com artistas renomados.',
    detailedDescription: 'O Festival de Jazz na Cidade é um evento anual que reúne os melhores músicos de jazz do Brasil e do mundo. Com três palcos simultâneos, food trucks gourmet e uma atmosfera única no coração de São Paulo. Este ano contamos com apresentações especiais de Hermeto Pascoal, Hamilton de Holanda e convidados internacionais. O evento inclui masterclasses gratuitas durante o dia e shows principais à noite.',
    location: 'Teatro Municipal, São Paulo',
    address: 'Praça Ramos de Azevedo, s/n - República, São Paulo - SP',
    date: '2024-03-15',
    time: '20:00',
    endTime: '02:00',
    capacity: 200,
    price: 50.00,
    categoryId: '1',
    category: mockCategories[0],
    organizerId: '2',
    organizer: mockOrganizers[0],
    latitude: -23.5505,
    longitude: -46.6333,
    availableSpots: 150,
    isUserRegistered: false,
    qrCode: generateQRCode('event-1-access'),
    status: 'PUBLISHED',
    rating: 4.7,
    totalReviews: 23,
    totalRevenue: 2500.00,
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    tags: ['Jazz', 'Música Ao Vivo', 'Cultura', 'Noturno'],
    requirements: ['Documento com foto', 'Proibido entrada de bebidas'],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-02-15T14:30:00Z'
  },
  {
    id: '2',
    title: 'Conferência de Tecnologia',
    description: 'As últimas tendências em desenvolvimento web e mobile.',
    detailedDescription: 'A maior conferência de tecnologia de São Paulo está de volta! Dois dias intensos com palestrantes nacionais e internacionais abordando temas como Inteligência Artificial, Web3, DevOps, UX/UI Design e muito mais. Networking, workshops práticos, área de exposição com startups e empresas tech. Inclui coffee breaks, almoço e certificado de participação.',
    location: 'Centro de Convenções, São Paulo',
    address: 'Rua do Anfiteatro, 181 - Vila Olímpia, São Paulo - SP',
    date: '2024-03-20',
    time: '09:00',
    endTime: '18:00',
    capacity: 500,
    price: 120.00,
    categoryId: '2',
    category: mockCategories[1],
    organizerId: '3',
    organizer: mockOrganizers[1],
    latitude: -23.5489,
    longitude: -46.6388,
    availableSpots: 350,
    isUserRegistered: true,
    qrCode: generateQRCode('event-2-access'),
    status: 'PUBLISHED',
    rating: 4.5,
    totalReviews: 67,
    totalRevenue: 18000.00,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    tags: ['Tecnologia', 'Programação', 'AI', 'Web3', 'Networking'],
    requirements: ['Laptop recomendado', 'Conhecimentos básicos em programação'],
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-02-20T16:45:00Z'
  },
  {
    id: '3',
    title: 'Workshop de Culinária Italiana',
    description: 'Aprenda a fazer massas autênticas com chef italiano.',
    detailedDescription: 'Workshop exclusivo com o renomado Chef Giovanni Rossi, direto de Roma. Aprenda técnicas tradicionais de preparo de massas frescas, molhos clássicos e secrets da cozinha italiana. Inclui degustação, receituário completo e certificado. Todos os ingredientes e utensílios fornecidos. Limite de participantes para garantir atenção personalizada.',
    location: 'Escola de Gastronomia, São Paulo',
    address: 'Rua Augusta, 1508 - Consolação, São Paulo - SP',
    date: '2024-03-25',
    time: '14:00',
    endTime: '18:00',
    capacity: 30,
    price: 80.00,
    categoryId: '3',
    category: mockCategories[2],
    organizerId: '4',
    organizer: mockOrganizers[2],
    latitude: -23.5873,
    longitude: -46.6573,
    availableSpots: 15,
    isUserRegistered: false,
    qrCode: generateQRCode('event-3-access'),
    status: 'PUBLISHED',
    rating: 4.9,
    totalReviews: 15,
    totalRevenue: 1200.00,
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    tags: ['Culinária', 'Italiana', 'Hands-on', 'Chef Profissional'],
    requirements: ['Avental fornecido', 'Não recomendado para alérgicos a glúten'],
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-02-25T10:15:00Z'
  },
  {
    id: '4',
    title: 'Corrida no Parque Villa-Lobos',
    description: 'Corrida matinal de 5km no Parque Villa-Lobos com premiação.',
    detailedDescription: 'Corrida matinal beneficente de 5km no belo Parque Villa-Lobos. Percurso plano e seguro, cronometragem eletrônica, hidratação durante o percurso, medalha de participação e premiação para os primeiros colocados de cada categoria. Renda revertida para ONGs locais. Aquecimento coletivo às 06:30.',
    location: 'Parque Villa-Lobos, São Paulo',
    address: 'Av. Prof. Fonseca Rodrigues, 2001 - Alto de Pinheiros, São Paulo - SP',
    date: '2024-03-18',
    time: '07:00',
    endTime: '10:00',
    capacity: 150,
    price: 0,
    categoryId: '4',
    category: mockCategories[3],
    organizerId: '2',
    organizer: mockOrganizers[0],
    latitude: -23.5474,
    longitude: -46.7182,
    availableSpots: 95,
    isUserRegistered: false,
    qrCode: generateQRCode('event-4-access'),
    status: 'PUBLISHED',
    rating: 4.3,
    totalReviews: 42,
    totalRevenue: 0,
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    tags: ['Corrida', 'Esporte', 'Beneficente', 'Matinal', 'Saúde'],
    requirements: ['Roupas esportivas', 'Tênis adequado', 'Garrafa de água'],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-02-10T11:20:00Z'
  },
  {
    id: '5',
    title: 'Exposição de Arte Contemporânea',
    description: 'Mostra de artistas emergentes da arte contemporânea brasileira.',
    detailedDescription: 'Exposição coletiva com 15 artistas emergentes da cena contemporânea brasileira. Obras inéditas em diversas linguagens: pintura, escultura, instalações e arte digital. Abertura com coquetel e bate-papo com os artistas. Visitação guiada aos sábados às 15h. Catálogo da exposição incluso.',
    location: 'Pinacoteca do Estado, São Paulo',
    address: 'Praça da Luz, 2 - Luz, São Paulo - SP',
    date: '2024-03-22',
    time: '10:00',
    endTime: '18:00',
    capacity: 80,
    price: 25.00,
    categoryId: '5',
    category: mockCategories[4],
    organizerId: '4',
    organizer: mockOrganizers[2],
    latitude: -23.5347,
    longitude: -46.6337,
    availableSpots: 45,
    isUserRegistered: false,
    qrCode: generateQRCode('event-5-access'),
    status: 'PUBLISHED',
    rating: 4.6,
    totalReviews: 18,
    totalRevenue: 875.00,
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
    tags: ['Arte', 'Contemporânea', 'Brasileira', 'Exposição', 'Cultura'],
    requirements: ['Documento com foto', 'Silêncio no espaço expositivo'],
    createdAt: '2024-01-25T14:00:00Z',
    updatedAt: '2024-02-28T09:45:00Z'
  },
  {
    id: '6',
    title: 'Meetup de Startups',
    description: 'Networking e palestras sobre empreendedorismo e inovação.',
    detailedDescription: 'Encontro mensal da comunidade startup de São Paulo. Palestras inspiradoras com fundadores de sucesso, pitch de startups em estágio inicial, networking dirigido e happy hour. Oportunidade única para conectar investidores, empreendedores e profissionais do ecossistema de inovação.',
    location: 'WeWork Faria Lima, São Paulo',
    address: 'Av. Brig. Faria Lima, 4440 - Itaim Bibi, São Paulo - SP',
    date: '2024-03-28',
    time: '19:00',
    endTime: '22:00',
    capacity: 100,
    price: 0,
    categoryId: '6',
    category: mockCategories[5],
    organizerId: '3',
    organizer: mockOrganizers[1],
    latitude: -23.5738,
    longitude: -46.6866,
    availableSpots: 67,
    isUserRegistered: false,
    qrCode: generateQRCode('event-6-access'),
    status: 'PUBLISHED',
    rating: 4.4,
    totalReviews: 31,
    totalRevenue: 0,
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
    tags: ['Startups', 'Empreendedorismo', 'Networking', 'Inovação', 'Pitch'],
    requirements: ['LinkedIn atualizado recomendado', 'Traje casual business'],
    createdAt: '2024-02-01T16:00:00Z',
    updatedAt: '2024-03-01T13:30:00Z'
  }
];

// Função para atualizar eventos baseado no usuário atual
const updateEventsForCurrentUser = () => {
  // Reset all registrations
  mockEvents.forEach(event => {
    event.isUserRegistered = false;
  });
  
  // Set registrations for current user based on real inscriptions
  const currentUser = getCurrentUser();
  const userInscriptions = mockInscriptions.filter(i => i.userId === currentUser.id);
  
  userInscriptions.forEach(inscription => {
    const event = mockEvents.find(e => e.id === inscription.eventId);
    if (event) {
      event.isUserRegistered = true;
    }
  });
};

// Inscrições mockadas com QR codes
export const mockInscriptions: Inscription[] = [
  {
    id: '1',
    userId: '1',
    eventId: '2',
    registeredAt: '2024-01-15T10:00:00Z',
    status: 'CONFIRMED',
    qrCode: generateQRCode('inscription-1-' + mockUsers[0].id + '-event-2'),
    paymentStatus: 'PAID',
    paymentId: 'PAY-123456789'
  }
];

// Avaliações mockadas
export const mockReviews: EventReview[] = [
  {
    id: '1',
    eventId: '1',
    userId: '5',
    userName: 'Pedro Oliveira',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro',
    rating: 5,
    comment: 'Evento incrível! Os artistas estavam fantásticos e a organização foi impecável.',
    createdAt: '2024-02-20T15:30:00Z'
  },
  {
    id: '2',
    eventId: '2',
    userId: '6',
    userName: 'Julia Santos',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=julia',
    rating: 4,
    comment: 'Muito bom conteúdo técnico, palestrantes de qualidade. Apenas o networking poderia ter sido melhor organizado.',
    createdAt: '2024-02-18T09:45:00Z'
  }
];

// Função para simular delay de API
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions expandidas
export const mockAPI = {
  // Usuários
  getCurrentUser: async () => {
    await delay(200);
    return getCurrentUser();
  },
  
  switchUser: async (userId: string) => {
    await delay(300);
    return switchUser(userId);
  },
  
  getUsers: async () => {
    await delay(200);
    return mockUsers;
  },

  // Eventos
  getEvents: async () => {
    await delay(500);
    // Sempre atualizar baseado no usuário atual antes de retornar
    updateEventsForCurrentUser();
    return mockEvents;
  },
  
  getEvent: async (eventId: string) => {
    await delay(300);
    updateEventsForCurrentUser();
    return mockEvents.find(event => event.id === eventId) || null;
  },
  
  getMyEvents: async () => {
    await delay(500);
    const currentUser = getCurrentUser();
    return mockEvents.filter(event => event.organizerId === currentUser.id);
  },
  
  getEventsByOrganizer: async (organizerId: string) => {
    await delay(400);
    return mockEvents.filter(event => event.organizerId === organizerId);
  },
  
  createEvent: async (eventData: any) => {
    await delay(800);
    const currentUser = getCurrentUser();
    const newEvent: Event = {
      id: Date.now().toString(),
      ...eventData,
      organizerId: currentUser.id,
      category: mockCategories.find(c => c.id === eventData.categoryId),
      organizer: mockOrganizers.find(o => o.id === currentUser.id),
      availableSpots: eventData.capacity,
      isUserRegistered: false,
      qrCode: generateQRCode(`event-${Date.now()}-access`),
      status: 'PUBLISHED',
      rating: 0,
      totalReviews: 0,
      totalRevenue: 0,
      // Coordenadas padrão para novos eventos (centro de SP)
      latitude: -23.5505 + (Math.random() - 0.5) * 0.1,
      longitude: -46.6333 + (Math.random() - 0.5) * 0.1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockEvents.push(newEvent);
    return newEvent;
  },
  
  // Inscrições
  registerForEvent: async (eventId: string, paymentStatus?: 'PAID' | 'PENDING') => {
    await delay(600);
    const currentUser = getCurrentUser();
    
    // Verificar se organizadores podem se inscrever
    if (currentUser.role === 'ORGANIZER') {
      throw new Error('Organizadores não podem se inscrever em eventos');
    }
    
    const event = mockEvents.find(e => e.id === eventId);
    if (event) {
      event.isUserRegistered = true;
      if (event.availableSpots) {
        event.availableSpots--;
      }
      const inscription: Inscription = {
        id: Date.now().toString(),
        userId: currentUser.id,
        eventId,
        registeredAt: new Date().toISOString(),
        status: 'CONFIRMED',
        qrCode: generateQRCode(`inscription-${Date.now()}-${currentUser.id}-event-${eventId}`),
        paymentStatus: paymentStatus || (event.price > 0 ? 'PENDING' : 'PAID')
      };
      mockInscriptions.push(inscription);
      return inscription;
    }
    throw new Error('Evento não encontrado');
  },
  
  unregisterFromEvent: async (eventId: string) => {
    await delay(500);
    const currentUser = getCurrentUser();
    const event = mockEvents.find(e => e.id === eventId);
    if (event) {
      event.isUserRegistered = false;
      if (event.availableSpots !== undefined) {
        event.availableSpots++;
      }
      const inscriptionIndex = mockInscriptions.findIndex(
        i => i.userId === currentUser.id && i.eventId === eventId
      );
      if (inscriptionIndex > -1) {
        mockInscriptions.splice(inscriptionIndex, 1);
      }
    }
  },
  
  getMyInscriptions: async () => {
    await delay(400);
    const currentUser = getCurrentUser();
    const userInscriptions = mockInscriptions.filter(i => i.userId === currentUser.id);
    return userInscriptions.map(inscription => ({
      ...inscription,
      event: mockEvents.find(e => e.id === inscription.eventId)
    }));
  },
  
  // Categorias
  getCategories: async () => {
    await delay(300);
    return mockCategories;
  },
  
  // Organizadores
  getOrganizers: async () => {
    await delay(300);
    return mockOrganizers;
  },
  
  getOrganizer: async (organizerId: string) => {
    await delay(200);
    return mockOrganizers.find(o => o.id === organizerId) || null;
  },
  
  // Avaliações
  getEventReviews: async (eventId: string) => {
    await delay(300);
    return mockReviews.filter(r => r.eventId === eventId);
  },
  
  addEventReview: async (eventId: string, rating: number, comment: string) => {
    await delay(400);
    const currentUser = getCurrentUser();
    const review: EventReview = {
      id: Date.now().toString(),
      eventId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };
    mockReviews.push(review);
    
    // Atualizar rating do evento
    const event = mockEvents.find(e => e.id === eventId);
    if (event) {
      const eventReviews = mockReviews.filter(r => r.eventId === eventId);
      const avgRating = eventReviews.reduce((sum, r) => sum + r.rating, 0) / eventReviews.length;
      event.rating = Math.round(avgRating * 10) / 10;
      event.totalReviews = eventReviews.length;
    }
    
    return review;
  },
  
  // Estatísticas do evento (para admin)
  getEventStats: async (eventId: string): Promise<EventStats> => {
    await delay(500);
    const event = mockEvents.find(e => e.id === eventId);
    const eventInscriptions = mockInscriptions.filter(i => i.eventId === eventId);
    
    return {
      totalRegistrations: eventInscriptions.length,
      totalRevenue: event?.totalRevenue || 0,
      checkedInCount: eventInscriptions.filter(i => i.status === 'CHECKED_IN').length,
      averageRating: event?.rating || 0,
      totalReviews: event?.totalReviews || 0,
      registrationsByDay: [
        { date: '2024-03-01', count: 5 },
        { date: '2024-03-02', count: 8 },
        { date: '2024-03-03', count: 12 }
      ],
      revenueByDay: [
        { date: '2024-03-01', amount: 250 },
        { date: '2024-03-02', amount: 400 },
        { date: '2024-03-03', amount: 600 }
      ]
    };
  },
  
  // QR Code scanning
  scanQRCode: async (qrCodeData: string, eventId: string): Promise<QRCodeScan> => {
    await delay(200);
    const currentUser = getCurrentUser();
    
    // Simular verificação do QR code
    const inscription = mockInscriptions.find(i => i.qrCode.includes(qrCodeData) && i.eventId === eventId);
    
    if (!inscription) {
      return {
        id: Date.now().toString(),
        eventId,
        inscriptionId: '',
        scannedAt: new Date().toISOString(),
        scannedBy: currentUser.id,
        status: 'INVALID'
      };
    }
    
    if (inscription.status === 'CHECKED_IN') {
      return {
        id: Date.now().toString(),
        eventId,
        inscriptionId: inscription.id,
        scannedAt: new Date().toISOString(),
        scannedBy: currentUser.id,
        status: 'ALREADY_CHECKED_IN'
      };
    }
    
    // Marcar como check-in realizado
    inscription.status = 'CHECKED_IN';
    inscription.checkedInAt = new Date().toISOString();
    
    return {
      id: Date.now().toString(),
      eventId,
      inscriptionId: inscription.id,
      scannedAt: new Date().toISOString(),
      scannedBy: currentUser.id,
      status: 'SUCCESS'
    };
  }
}; 