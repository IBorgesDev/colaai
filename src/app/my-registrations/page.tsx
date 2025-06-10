'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, XCircle, CheckCircle, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { mockAPI } from '@/lib/mock-data'
import { Inscription } from '@/lib/types'

export default function MyRegistrationsPage() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    loadMyInscriptions()
  }, [])

  const loadMyInscriptions = async () => {
    try {
      setLoading(true)
      const inscriptionsData = await mockAPI.getMyInscriptions()
      setInscriptions(inscriptionsData)
    } catch (error) {
      toast.error('Erro ao carregar inscrições')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRegistration = async (eventId: string) => {
    try {
      setCancelling(eventId)
      await mockAPI.unregisterFromEvent(eventId)
      toast.success('Inscrição cancelada com sucesso!')
      await loadMyInscriptions()
    } catch (error) {
      toast.error('Erro ao cancelar inscrição')
    } finally {
      setCancelling(null)
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

  const formatRegistrationDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-600'
      case 'WAITING':
        return 'bg-yellow-600'
      case 'CANCELLED':
        return 'bg-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmado'
      case 'WAITING':
        return 'Lista de Espera'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return 'Desconhecido'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando suas inscrições...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Inscrições</h1>
          <p className="text-gray-600">Eventos em que você está inscrito</p>
        </div>

        {inscriptions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <BookmarkCheck className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-4">
              Você ainda não está inscrito em nenhum evento
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Explore os eventos disponíveis e se inscreva em experiências incríveis.
            </p>
            <Button size="lg" onClick={() => window.location.href = '/'}>
              <Calendar className="h-4 w-4 mr-2" />
              Explorar Eventos
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {inscriptions.map((inscription, index) => {
              const event = inscription.event
              if (!event) return null

              return (
                <motion.div
                  key={inscription.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <div className="md:flex">
                      {/* Imagem/Gradiente do evento */}
                      <div className="md:w-48 md:flex-shrink-0">
                        {event.imageUrl ? (
                          <img 
                            src={event.imageUrl} 
                            alt={event.title}
                            className="h-48 md:h-full w-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                          />
                        ) : (
                          <div 
                            className="h-48 md:h-full w-full rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                            style={{
                              background: `linear-gradient(135deg, ${event.category?.color || '#6366f1'}, ${event.category?.color || '#8b5cf6'})`
                            }}
                          />
                        )}
                      </div>

                      {/* Conteúdo do evento */}
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge 
                                variant="secondary" 
                                className="text-xs font-medium"
                                style={{ 
                                  backgroundColor: event.category?.color || '#6366f1',
                                  color: 'white'
                                }}
                              >
                                {event.category?.name}
                              </Badge>
                              <Badge 
                                className={`text-xs font-medium text-white ${getStatusColor(inscription.status)}`}
                              >
                                {getStatusText(inscription.status)}
                              </Badge>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                            <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                          </div>
                          
                          <div className="text-right ml-4">
                            <p className="text-lg font-bold text-gray-900">
                              {event.price === 0 ? 'Gratuito' : `R$ ${event.price.toFixed(2)}`}
                            </p>
                          </div>
                        </div>

                        {/* Informações do evento */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(event.time)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>

                        {/* Informações da inscrição */}
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-sm text-gray-500">
                            Inscrito em: {formatRegistrationDate(inscription.registeredAt)}
                          </div>
                          
                          {inscription.status === 'CONFIRMED' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelRegistration(event.id)}
                              disabled={cancelling === event.id}
                            >
                              {cancelling === event.id ? (
                                <div className="flex items-center space-x-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                  <span>Cancelando...</span>
                                </div>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Cancelar Inscrição
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Estatísticas */}
        {inscriptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {inscriptions.filter(i => i.status === 'CONFIRMED').length}
                    </p>
                    <p className="text-sm text-gray-600">Inscrições Confirmadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {inscriptions.filter(i => i.status === 'WAITING').length}
                    </p>
                    <p className="text-sm text-gray-600">Lista de Espera</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <BookmarkCheck className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{inscriptions.length}</p>
                    <p className="text-sm text-gray-600">Total de Inscrições</p>
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