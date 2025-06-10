'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  Search, Calendar, Clock, MapPin, Users, Grid, Map, 
  CheckCircle, XCircle, ExternalLink, ArrowRight 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EventList } from '@/components/event-list'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const DynamicMap = dynamic(() => import('@/components/event-map').then(mod => ({ default: mod.EventMap })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Carregando mapa...</div>
})

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  address: string
  latitude: number | null
  longitude: number | null
  maxParticipants: number
  price: number
  imageUrl: string | null
  status: string
  isPublic: boolean
  category?: {
    id: string
    name: string
    color: string
  }
  organizer: {
    id: string
    name: string
    email: string
  }
  _count?: {
    inscriptions: number
  }
  isUserRegistered?: boolean
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [userInscriptions, setUserInscriptions] = useState<string[]>([])

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      loadUserInscriptions()
    }
  }, [session])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/events')
      if (response.ok) {
        const eventsData = await response.json()
        setEvents(eventsData)
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserInscriptions = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/inscriptions?userId=${session.user.id}`)
      if (response.ok) {
        const inscriptions = await response.json()
        const eventIds = inscriptions.map((inscription: any) => inscription.event.id)
        setUserInscriptions(eventIds)
      }
    } catch (error) {
      console.error('Erro ao carregar inscrições:', error)
    }
  }

  const handleRegistration = async (eventId: string) => {
    if (!session?.user?.id) {
      toast.error('Faça login para se inscrever')
      return
    }

    if (session.user.role === 'ADMIN') {
      toast.error('Admins não podem se inscrever em eventos')
      return
    }

    // Encontrar o evento para verificar se é pago
    const event = events.find(e => e.id === eventId)
    if (!event) {
      toast.error('Evento não encontrado')
      return
    }

    // Se o evento é pago, redirecionar para página de pagamento
    if (event.price > 0) {
      // Redirecionar para página de pagamento
      window.location.href = `/payment?eventId=${eventId}`
      return
    }

    // Para eventos gratuitos, criar inscrição diretamente
    try {
      const response = await fetch('/api/inscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          participantId: session.user.id
        })
      })

      if (response.ok) {
        toast.success('Inscrição realizada com sucesso!')
        loadUserInscriptions() // Recarregar inscrições
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao realizar inscrição')
      }
    } catch (error) {
      toast.error('Erro ao realizar inscrição')
    }
  }

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event)
  }

  // Filtros
  const categories = Array.from(new Set(events.map(event => event.category?.name).filter(Boolean))) as string[]
  
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === null || event.category?.name === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando eventos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Category Filter */}
            <div className="flex space-x-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Todos
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'list' ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setViewMode('list')
                  setSelectedEvent(null)
                }}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('map')}
                className="rounded-l-none"
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredEvents.map((event, index) => {
              const isUserRegistered = userInscriptions.includes(event.id)
              const isEventFull = (event._count?.inscriptions || 0) >= event.maxParticipants
              const isEventStarted = new Date(event.startDate) < new Date()

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <div className="relative">
                      {event.imageUrl ? (
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          className="h-48 w-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <div 
                          className="h-48 rounded-t-lg bg-gradient-to-r from-purple-400 to-pink-400"
                          style={{
                            background: `linear-gradient(135deg, ${event.category?.color || '#6366f1'}, ${event.category?.color || '#8b5cf6'})`
                          }}
                        />
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge 
                          variant="secondary" 
                          className="text-xs font-medium text-white border-0"
                          style={{ backgroundColor: event.category?.color || '#6366f1' }}
                        >
                          {event.category?.name || 'Evento'}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                        {event.price === 0 ? 'Gratuito' : `R$ ${Number(event.price).toFixed(2)}`}
                      </div>
                      {isUserRegistered && (
                        <div className="absolute bottom-3 right-3">
                          <Badge variant="default" className="bg-green-600 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Inscrito
                          </Badge>
                        </div>
                      )}
                      {isEventFull && !isUserRegistered && (
                        <div className="absolute bottom-3 right-3">
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Lotado
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(event.startDate)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>
                            {event._count?.inscriptions || 0}/{event.maxParticipants} inscritos
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Link href={`/event/${event.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ver Detalhes
                          </Button>
                        </Link>
                        
                        {session && session.user.role === 'PARTICIPANT' && !isUserRegistered && !isEventFull && !isEventStarted && (
                          <Button 
                            size="sm" 
                            onClick={() => handleRegistration(event.id)}
                            className="flex-1"
                          >
                            <ArrowRight className="h-4 w-4 mr-1" />
                            {event.price > 0 ? 'Pagar e Inscrever' : 'Inscrever-se'}
                          </Button>
                        )}
                        
                        {!session && (
                          <Link href="/auth/signin" className="flex-1">
                            <Button size="sm" className="w-full">
                              <ArrowRight className="h-4 w-4 mr-1" />
                              Login para Inscrever
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-lg p-8">
              <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Modo Mapa</h3>
              <p className="text-gray-600">Modo mapa temporariamente indisponível</p>
              <Button 
                onClick={() => setViewMode('list')}
                className="mt-4"
              >
                Voltar para Lista
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
