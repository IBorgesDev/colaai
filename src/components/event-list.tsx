'use client'

import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle, ExternalLink, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Event } from '@/lib/types'
import Link from 'next/link'

interface EventListProps {
  events: Event[]
  selectedEvent?: Event | null
  onEventSelect: (event: Event) => void
  showRegisterButton?: boolean
}

export function EventList({ 
  events, 
  selectedEvent, 
  onEventSelect,
  showRegisterButton = true
}: EventListProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5) // HH:MM
  }

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 bg-white p-4 border-b flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900">
          Eventos ({events.length})
        </h3>
        <p className="text-sm text-gray-600">
          Clique em um evento para visualizar no mapa
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="space-y-3">
          {events.map((event) => (
            <Card 
              key={event.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedEvent?.id === event.id 
                  ? 'ring-2 ring-blue-500 shadow-md bg-blue-50' 
                  : ''
              }`}
              onClick={() => onEventSelect(event)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base line-clamp-1">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">
                      {event.description}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="ml-2 text-xs shrink-0"
                    style={{ 
                      backgroundColor: `${event.category?.color}20`,
                      color: event.category?.color,
                      borderColor: event.category?.color
                    }}
                  >
                    {event.category?.name}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(event.time)}</span>
                  </div>
                  <div className="flex items-center space-x-1 col-span-2">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>
                      {event.availableSpots !== undefined 
                        ? `${event.capacity - event.availableSpots}/${event.capacity}`
                        : `${event.capacity} vagas`
                      }
                    </span>
                  </div>
                  <div className="text-right font-medium">
                    {event.price === 0 ? 'Gratuito' : `R$ ${Number(event.price).toFixed(2)}`}
                  </div>
                </div>
                
                {event.isUserRegistered && (
                  <div className="flex items-center justify-center">
                    <Badge variant="default" className="bg-green-600 text-white text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Inscrito
                    </Badge>
                  </div>
                )}
                
                {showRegisterButton && (
                  <Link href={`/event/${event.id}`} onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant={event.isUserRegistered ? "outline" : "default"}
                      size="sm" 
                      className="w-full text-xs"
                    >
                      {event.isUserRegistered ? (
                        <>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ver Detalhes
                        </>
                      ) : event.availableSpots === 0 ? (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Esgotado
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Inscrever-se
                        </>
                      )}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {events.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum evento encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
} 