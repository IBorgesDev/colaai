'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, MapPin, Users, Plus, Edit, Trash2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { mockAPI } from '@/lib/mock-data'
import { Event } from '@/lib/types'

export default function MyEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMyEvents()
  }, [])

  const loadMyEvents = async () => {
    try {
      setLoading(true)
      const eventsData = await mockAPI.getMyEvents()
      setEvents(eventsData)
    } catch (error) {
      toast.error('Erro ao carregar eventos')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5) // HH:MM
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus eventos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Eventos</h1>
            <p className="text-gray-600">Gerencie os eventos que você criou</p>
          </div>
          <Link href="/create-event">
            <Button size="lg" className="mt-4 md:mt-0">
              <Plus className="h-4 w-4 mr-2" />
              Criar Evento
            </Button>
          </Link>
        </div>

        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <Calendar className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-4">
              Você ainda não criou nenhum evento
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Comece criando seu primeiro evento e compartilhe experiências incríveis com outras pessoas.
            </p>
            <Link href="/create-event">
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Evento
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {events.map((event, index) => (
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
                        className="h-48 rounded-t-lg"
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
                            ? `${event.capacity - event.availableSpots}/${event.capacity} inscritos`
                            : `0/${event.capacity} inscritos`
                          }
                        </span>
                      </div>
                    </div>
                    
                    {/* Status do evento */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Ativo</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {event.availableSpots !== undefined 
                          ? `${event.availableSpots} vagas restantes`
                          : `${event.capacity} vagas disponíveis`
                        }
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => toast.info('Funcionalidade de edição em desenvolvimento')}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => toast.info('Funcionalidade de exclusão em desenvolvimento')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Estatísticas rápidas */}
        {events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                    <p className="text-sm text-gray-600">Eventos Criados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {events.reduce((total, event) => {
                        const inscritos = event.availableSpots !== undefined 
                          ? event.capacity - event.availableSpots 
                          : 0
                        return total + inscritos
                      }, 0)}
                    </p>
                    <p className="text-sm text-gray-600">Total de Inscritos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {events.reduce((total, event) => total + event.capacity, 0)}
                    </p>
                    <p className="text-sm text-gray-600">Capacidade Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
} 