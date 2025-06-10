'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, MapPin, Users, Plus, Edit, Trash2, Clock, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface EventWithInscriptions {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  maxParticipants: number
  price: number
  imageUrl?: string
  status: string
  category?: {
    name: string
    color: string
  }
  _count?: {
    inscriptions: number
  }
}

interface InscriptionWithEvent {
  id: string
  status: string
  paid: boolean
  ticketCode: string
  inscriptionDate: string
  event: EventWithInscriptions
}

export default function MyEventsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [myEvents, setMyEvents] = useState<EventWithInscriptions[]>([])
  const [myInscriptions, setMyInscriptions] = useState<InscriptionWithEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    loadData()
  }, [session, status, router])

  const loadData = async () => {
    try {
      setLoading(true)
      
      if (!session?.user?.id) return
      
      if (session.user.role === 'ADMIN') {
        // Carregar eventos que o admin criou
        const response = await fetch(`/api/events?organizerId=${session.user.id}`)
        if (response.ok) {
          const events = await response.json()
          setMyEvents(events)
        }
      } else {
        // Carregar inscrições do participante
        const response = await fetch(`/api/inscriptions?userId=${session.user.id}`)
        if (response.ok) {
          const inscriptions = await response.json()
          setMyInscriptions(inscriptions)
        }
      }
    } catch (error) {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const cancelInscription = async (inscriptionId: string) => {
    if (!confirm('Tem certeza que deseja cancelar sua inscrição?')) return

    try {
      const userId = session?.user?.id
      if (!userId) {
        toast.error('ID de usuário não encontrado. Faça login novamente.')
        return
      }

      const response = await fetch(`/api/inscriptions/${inscriptionId}?userId=${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Inscrição cancelada com sucesso')
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao cancelar inscrição')
      }
    } catch (error) {
      toast.error('Erro ao cancelar inscrição')
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

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isAdmin = session.user?.role === 'ADMIN'
  const dataToShow = isAdmin ? myEvents : myInscriptions

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isAdmin ? 'Meus Eventos' : 'Minhas Inscrições'}
            </h1>
            <p className="text-gray-600">
              {isAdmin 
                ? 'Gerencie os eventos que você criou' 
                : 'Acompanhe os eventos em que você se inscreveu'
              }
            </p>
          </div>
          {isAdmin && (
            <Link href="/create-event">
              <Button size="lg" className="mt-4 md:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                Criar Evento
              </Button>
            </Link>
          )}
        </div>

        {dataToShow.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <Calendar className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-4">
              {isAdmin 
                ? 'Você ainda não criou nenhum evento'
                : 'Você ainda não se inscreveu em nenhum evento'
              }
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {isAdmin 
                ? 'Comece criando seu primeiro evento e compartilhe experiências incríveis com outras pessoas.'
                : 'Explore nossa plataforma e encontre eventos interessantes para participar.'
              }
            </p>
            {isAdmin ? (
              <Link href="/create-event">
                <Button size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Evento
                </Button>
              </Link>
            ) : (
              <Link href="/">
                <Button size="lg">
                  <Calendar className="h-4 w-4 mr-2" />
                  Explorar Eventos
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {dataToShow.map((item, index) => {
              const event = isAdmin ? item as EventWithInscriptions : (item as InscriptionWithEvent).event
              const inscription = !isAdmin ? item as InscriptionWithEvent : null

              return (
                <motion.div
                  key={isAdmin ? event.id : inscription!.id}
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
                          {event.category?.name || 'Evento'}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                        {event.price === 0 ? 'Gratuito' : `R$ ${Number(event.price).toFixed(2)}`}
                      </div>
                      {!isAdmin && inscription && (
                        <div className="absolute bottom-3 right-3">
                          <Badge 
                            variant={inscription.status === 'ACTIVE' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {inscription.status === 'ACTIVE' ? 'Inscrito' : inscription.status}
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
                            {isAdmin 
                              ? `${event._count?.inscriptions || 0}/${event.maxParticipants} inscritos`
                              : `${event.maxParticipants} vagas`
                            }
                          </span>
                        </div>
                      </div>
                      
                      {!isAdmin && inscription && (
                        <div className="space-y-2 pt-2 border-t">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Inscrito em:</span>
                            <span className="font-medium">
                              {new Date(inscription.inscriptionDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Ticket:</span>
                            <span className="font-mono text-xs">{inscription.ticketCode}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Pagamento:</span>
                            <div className="flex items-center space-x-1">
                              {inscription.paid ? (
                                <>
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span className="text-green-600">Pago</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 text-orange-500" />
                                  <span className="text-orange-600">Pendente</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {isAdmin && (
                        <div className="flex justify-between items-center pt-2 border-t">
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${
                              event.status === 'PUBLISHED' ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                            <span className="text-xs text-gray-600">
                              {event.status === 'PUBLISHED' ? 'Publicado' : event.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {event.maxParticipants - (event._count?.inscriptions || 0)} vagas restantes
                          </div>
                        </div>
                      )}
                      
                      <div className="flex space-x-2 pt-2">
                        {isAdmin ? (
                          <>
                            <Button 
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => router.push(`/event/${event.id}`)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Ver Detalhes
                            </Button>
                            <Button 
                              variant="destructive"
                              size="sm"
                              onClick={() => toast.info('Funcionalidade de exclusão em desenvolvimento')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => router.push(`/event/${event.id}`)}
                            >
                              Ver Evento
                            </Button>
                            {inscription && inscription.status === 'ACTIVE' && (
                              <Button 
                                variant="destructive"
                                size="sm"
                                onClick={() => cancelInscription(inscription.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
} 