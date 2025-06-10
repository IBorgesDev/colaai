'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, Clock, MapPin, BookmarkCheck, 
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

interface Inscription {
  id: string
  status: string
  paid: boolean
  ticketCode: string
  inscriptionDate: string
  event: {
    id: string
    title: string
    description: string
    startDate: string
    endDate: string
    location: string
    price: number
    imageUrl: string | null
    category?: {
      id: string
      name: string
      color: string
    }
  }
}

export default function MyRegistrationsPage() {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const { data: session, status } = useSession()

  useEffect(() => {
    console.log('Session status:', status, 'Session data:', session)
    if (status === 'authenticated' && session?.user?.id) {
      console.log('User authenticated with ID:', session.user.id)
      loadMyInscriptions()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [session, status])

  const loadMyInscriptions = async () => {
    const userId = session?.user?.id
    if (!userId) {
      console.log('No user ID available for loading inscriptions')
      return
    }

    try {
      setLoading(true)
      console.log('Loading inscriptions for user:', userId)
      const response = await fetch(`/api/inscriptions?userId=${userId}`)
      if (response.ok) {
        const inscriptionsData = await response.json()
        console.log('Loaded inscriptions:', inscriptionsData.length)
        setInscriptions(inscriptionsData)
      } else {
        toast.error('Erro ao carregar inscrições')
      }
    } catch (error) {
      console.error('Error loading inscriptions:', error)
      toast.error('Erro ao carregar inscrições')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRegistration = async (inscriptionId: string) => {
    console.log('=== CANCEL REGISTRATION START ===')
    console.log('Inscription ID:', inscriptionId)
    
    // Usar diretamente o userId da sessão
    const userId = session?.user?.id
    console.log('User ID from session:', userId)

    if (!userId) {
      console.log('ERROR: No user ID available')
      toast.error('ID de usuário não encontrado. Faça login novamente.')
      return
    }

    try {
      setCancelling(inscriptionId)
      
      const url = `/api/inscriptions/${inscriptionId}?userId=${userId}`
      console.log('DELETE URL:', url)
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('SUCCESS: Cancel response:', result)
        toast.success('Inscrição cancelada com sucesso!')
        await loadMyInscriptions()
      } else {
        const error = await response.json()
        console.error('ERROR: Cancel response:', error)
        toast.error(error.error || 'Erro ao cancelar inscrição')
      }
    } catch (error) {
      console.error('FATAL ERROR in cancel request:', error)
      toast.error('Erro ao cancelar inscrição')
    } finally {
      setCancelling(null)
      console.log('=== CANCEL REGISTRATION END ===')
    }
  }

  const testCancelRegistration = async (inscriptionId: string) => {
    console.log('=== TEST CANCEL FUNCTION CALLED ===')
    console.log('Inscription ID:', inscriptionId)
    console.log('Session status:', status)
    console.log('Session exists:', !!session)
    console.log('Session user exists:', !!session?.user)
    console.log('Session user ID exists:', !!session?.user?.id)
    console.log('Session user ID value:', session?.user?.id)
    
    if (session?.user?.id) {
      const testUrl = `/api/inscriptions/${inscriptionId}?userId=${session.user.id}`
      console.log('Test URL would be:', testUrl)
      
      try {
        console.log('Making test request...')
        const response = await fetch(testUrl, { method: 'DELETE' })
        console.log('Test response status:', response.status)
        const data = await response.json()
        console.log('Test response data:', data)
      } catch (error) {
        console.log('Test request error:', error)
      }
    } else {
      console.log('NO USER ID AVAILABLE FOR TEST')
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

  const formatRegistrationDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'CONFIRMED':
        return 'bg-green-600'
      case 'PENDING':
        return 'bg-yellow-600'
      case 'CANCELLED':
        return 'bg-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo'
      case 'CONFIRMED':
        return 'Confirmado'
      case 'PENDING':
        return 'Pendente'
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
                              {event.price === 0 ? 'Gratuito' : `R$ ${Number(event.price).toFixed(2)}`}
                            </p>
                          </div>
                        </div>

                        {/* Informações do evento */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.startDate)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(event.startDate)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>

                        {/* Informações da inscrição */}
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-sm text-gray-500">
                            Inscrito em: {formatRegistrationDate(inscription.inscriptionDate)}
                          </div>
                          
                          <div className="flex space-x-2">
                            {/* Test button */}
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                const userId = session?.user?.id
                                console.log('=== SIMPLE TEST ===')
                                console.log('Saved User ID:', userId)
                                console.log('Session User ID:', session?.user?.id)
                                console.log('Final User ID:', userId)
                                if (userId) {
                                  console.log('Would call:', `/api/inscriptions/${inscription.id}?userId=${userId}`)
                                  testCancelRegistration(inscription.id)
                                } else {
                                  console.log('NO USER ID AVAILABLE')
                                  toast.error('No user ID available')
                                }
                              }}
                            >
                              🧪 Test
                            </Button>

                            {/* Debug button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                const userId = session?.user?.id
                                if (!userId) {
                                  console.log('No user ID for debug')
                                  toast.error('No user ID available')
                                  return
                                }
                                console.log('=== DEBUG TEST ===')
                                console.log('Using User ID:', userId)
                                try {
                                  const response = await fetch(`/api/inscriptions/${inscription.id}?userId=${userId}`)
                                  const data = await response.json()
                                  console.log('Debug response:', data)
                                  toast.info('Debug info logged to console')
                                } catch (error) {
                                  console.error('Debug error:', error)
                                }
                              }}
                            >
                              🐛 Debug
                            </Button>

                            {(session?.user?.id) && (inscription.status === 'ACTIVE' || inscription.status === 'CONFIRMED') && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelRegistration(inscription.id)}
                                disabled={cancelling === inscription.id}
                              >
                                {cancelling === inscription.id ? (
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
                      {inscriptions.filter(i => i.status === 'ACTIVE' || i.status === 'CONFIRMED').length}
                    </p>
                    <p className="text-sm text-gray-600">Inscrições Ativas</p>
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
                      {inscriptions.filter(i => i.status === 'PENDING').length}
                    </p>
                    <p className="text-sm text-gray-600">Pagamento Pendente</p>
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