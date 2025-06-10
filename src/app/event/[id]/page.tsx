'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Calendar, Clock, MapPin, Users, Star, DollarSign, 
  CheckCircle, XCircle, QrCode, Share2, Heart,
  MessageCircle, Award, Building, Phone, Mail,
  ArrowLeft, Tag, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  address: string | null
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
}

interface EventReview {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: {
    id: string
    name: string
  }
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const eventId = params.id as string
  const paymentStatus = searchParams.get('payment')
  
  const [event, setEvent] = useState<Event | null>(null)
  const [reviews, setReviews] = useState<EventReview[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [userInscription, setUserInscription] = useState<any>(null)

  useEffect(() => {
    loadEventDetails()
    
    // Mostrar mensagem de sucesso do pagamento
    if (paymentStatus === 'success') {
      toast.success('Pagamento realizado com sucesso! Você foi inscrito no evento.')
    } else if (paymentStatus === 'pending') {
      toast.warning('Pagamento em análise. Você receberá a confirmação em breve.')
    }
  }, [eventId, paymentStatus])

  const loadEventDetails = async () => {
    try {
      setLoading(true)
      
      // Carregar dados do evento
      const eventResponse = await fetch(`/api/events/${eventId}`)
      if (!eventResponse.ok) {
        throw new Error('Evento não encontrado')
      }
      const eventData = await eventResponse.json()
      setEvent(eventData)

      // Carregar inscrição do usuário se logado
      if (session?.user?.id) {
        try {
          const inscriptionsResponse = await fetch(`/api/inscriptions?userId=${session.user.id}`)
          if (inscriptionsResponse.ok) {
            const inscriptions = await inscriptionsResponse.json()
            const userInscription = inscriptions.find((i: any) => i.eventId === eventId && i.status !== 'CANCELLED')
            setUserInscription(userInscription)
          }
        } catch (error) {
          console.log('Erro ao carregar inscrições:', error)
        }
      }
      
    } catch (error) {
      console.error('Erro ao carregar evento:', error)
      toast.error('Erro ao carregar detalhes do evento')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!event || !session?.user?.id) {
      toast.error('Você precisa fazer login para se inscrever')
      return
    }

    try {
      setRegistering(true)
      
      if (userInscription) {
        // Cancelar inscrição
        const response = await fetch(`/api/inscriptions/${userInscription.id}?userId=${session.user.id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          toast.success('Inscrição cancelada com sucesso!')
          setUserInscription(null)
        } else {
          const error = await response.json()
          toast.error(error.error || 'Erro ao cancelar inscrição')
        }
      } else {
        // Se o evento tem preço, redirecionar para pagamento
        if (Number(event.price) > 0) {
          router.push(`/payment?eventId=${eventId}`)
          return
        }
        
        // Se é gratuito, fazer inscrição direta
        const response = await fetch('/api/inscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            eventId: event.id,
            participantId: session.user.id,
            paymentStatus: 'PAID'
          })
        })

        if (response.ok) {
          toast.success('Inscrição realizada com sucesso!')
          await loadEventDetails()
        } else {
          const error = await response.json()
          toast.error(error.error || 'Erro ao realizar inscrição')
        }
      }
    } catch (error) {
      toast.error('Erro ao processar inscrição')
    } finally {
      setRegistering(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      toast.error('Por favor, escreva uma avaliação')
      return
    }

    try {
      setSubmittingReview(true)
      // TODO: Implementar API de reviews quando necessário
      toast.info('Funcionalidade de reviews será implementada em breve')
      setReviewText('')
      setReviewRating(5)
    } catch (error) {
      toast.error('Erro ao enviar avaliação')
    } finally {
      setSubmittingReview(false)
    }
  }

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
          <p className="text-gray-600">Carregando evento...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-red-600">Evento não encontrado</CardTitle>
            <CardDescription>
              O evento que você está procurando não existe ou foi removido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <div className="relative">
                  {event.imageUrl ? (
                    <img 
                      src={event.imageUrl} 
                      alt={event.title}
                      className="w-full h-64 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div 
                      className="w-full h-64 rounded-t-lg bg-gradient-to-r from-purple-400 to-pink-400"
                      style={{
                        background: `linear-gradient(135deg, ${event.category?.color || '#6366f1'}, ${event.category?.color || '#8b5cf6'})`
                      }}
                    />
                  )}
                  
                  <div className="absolute top-4 left-4">
                    <Badge 
                      variant="secondary" 
                      className="text-white border-0"
                      style={{ backgroundColor: event.category?.color || '#6366f1' }}
                    >
                      {event.category?.name}
                    </Badge>
                  </div>
                  
                  <div className="absolute top-4 right-4 space-x-2">
                    <Button size="sm" variant="secondary">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{event.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>4.5 (10 avaliações)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{event._count?.inscriptions || 0}/{event.maxParticipants} inscritos</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {event.price === 0 ? 'Gratuito' : `R$ ${Number(event.price).toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <span>
                        {formatTime(event.startDate)}
                        {event.endDate && ` - ${formatTime(event.endDate)}`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 md:col-span-2">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <span>{event.location}</span>
                    </div>
                    {event.address && (
                      <div className="md:col-span-2 ml-7 text-sm text-gray-600">
                        {event.address}
                      </div>
                    )}
                  </div>

                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold mb-2">Sobre o evento</h3>
                    <p className="text-gray-700 mb-4">{event.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Organizer Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Organizador</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback>
                        {event.organizer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{event.organizer.name}</h4>
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{event.organizer.email}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Avaliações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add Review */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-3">Deixe sua avaliação</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Nota:</span>
                        {renderStars(reviewRating, true, setReviewRating)}
                      </div>
                      <Textarea
                        placeholder="Compartilhe sua experiência sobre este evento..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={3}
                      />
                      <Button 
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        size="sm"
                      >
                        {submittingReview ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Enviar Avaliação
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {review.user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">{review.user.name}</span>
                              {renderStars(review.rating)}
                              <span className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {reviews.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Seja o primeiro a avaliar este evento!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="sticky top-4">
                <CardHeader>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {event.price === 0 ? 'Gratuito' : `R$ ${Number(event.price).toFixed(2)}`}
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.max(0, event.maxParticipants - (event._count?.inscriptions || 0))} vagas disponíveis
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleRegister}
                    disabled={registering || (event.maxParticipants - (event._count?.inscriptions || 0)) <= 0}
                    className="w-full"
                    variant={userInscription ? "destructive" : "default"}
                  >
                    {registering ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (event.maxParticipants - (event._count?.inscriptions || 0)) <= 0 ? (
                      'Esgotado'
                    ) : userInscription ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancelar Inscrição
                      </>
                    ) : Number(event.price) > 0 ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Pagar e Inscrever-se
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Inscrever-se Grátis
                      </>
                    )}
                  </Button>

                  {userInscription && (
                    <div className="space-y-3">
                      <div className="text-center">
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Inscrito
                        </Badge>
                      </div>
                      
                      <Button 
                        onClick={() => setShowQRCode(!showQRCode)}
                        variant="outline"
                        className="w-full"
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        {showQRCode ? 'Ocultar' : 'Mostrar'} QR Code
                      </Button>
                      
                      {showQRCode && userInscription.ticketCode && (
                        <div className="text-center p-4 bg-white rounded-lg border">
                          <div className="text-xs text-gray-600 mb-2">
                            Código do Ticket: {userInscription.ticketCode}
                          </div>
                          <p className="text-xs text-gray-600">
                            Apresente este código na entrada do evento
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 