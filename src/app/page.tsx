'use client'

import { useState, useEffect } from 'react'
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
import { mockAPI, mockUser } from '@/lib/mock-data'
import { Event } from '@/lib/types'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const DynamicMap = dynamic(() => import('@/components/event-map').then(mod => ({ default: mod.EventMap })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Carregando mapa...</div>
})

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  // Verificar se o usuário pode se registrar em eventos
  const canRegisterForEvents = mockUser.role === 'PARTICIPANT'

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const eventsData = await mockAPI.getEvents()
      setEvents(eventsData)
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
    } finally {
      setLoading(false)
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

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5)
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
            {filteredEvents.map((event, index) => (
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
                        {event.category?.name}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                      {event.price === 0 ? 'Gratuito' : `R$ ${event.price.toFixed(2)}`}
                    </div>
                    {event.isUserRegistered && (
                      <div className="absolute bottom-3 right-3">
                        <Badge variant="default" className="bg-green-600 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Inscrito
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
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(event.time)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {event.availableSpots !== undefined 
                            ? `${event.capacity - event.availableSpots}/${event.capacity} vagas`
                            : `${event.capacity} vagas`
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link href={`/event/${event.id}`} className="flex-1">
                        <Button 
                          variant={event.isUserRegistered ? "outline" : "default"}
                          size="sm" 
                          className="w-full"
                        >
                          {event.isUserRegistered ? (
                            <>
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Ver Detalhes
                            </>
                          ) : event.availableSpots === 0 ? (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Esgotado
                            </>
                          ) : (
                            <>
                              <ArrowRight className="h-4 w-4 mr-1" />
                              Inscrever-se
                            </>
                          )}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
            style={{ height: 'calc(100vh - 220px)', minHeight: '600px' }}
          >
            <div className="flex flex-col md:flex-row h-full">
              {/* Event List Sidebar */}
              <div className="w-full md:w-1/3 md:min-w-[320px] border-b md:border-b-0 md:border-r bg-gray-50 flex flex-col max-h-[300px] md:max-h-none">
                <EventList
                  events={filteredEvents}
                  selectedEvent={selectedEvent}
                  onEventSelect={handleEventSelect}
                />
              </div>
              
              {/* Map */}
              <div className="flex-1 relative min-w-0 min-h-[300px]">
                <div className="absolute inset-0">
                  <DynamicMap 
                    events={filteredEvents} 
                    selectedEvent={selectedEvent}
                    onEventSelect={handleEventSelect}
                  />
                </div>
                
                {/* Map Header */}
                <div className="absolute top-4 left-4 right-4 z-10">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Mapa de Eventos em São Paulo
                    </h3>
                    <p className="text-sm text-gray-600">
                      {filteredEvents.length > 0 
                        ? `Mostrando ${filteredEvents.length} evento(s).`
                        : 'Nenhum evento encontrado com os filtros aplicados.'
                      }
                      {selectedEvent && (
                        <span className="block text-blue-600 font-medium mt-1">
                          📍 {selectedEvent.title}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros ou termos de busca</p>
          </div>
        )}
      </div>
    </div>
  )
}
