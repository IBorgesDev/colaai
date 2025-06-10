'use client'

import dynamic from 'next/dynamic'
import { Event } from '@/lib/types'

interface DynamicMapProps {
  events: Event[]
  selectedEvent?: Event | null
  onEventSelect?: (event: Event) => void
}

// Import do mapa de forma dinâmica para evitar problemas de SSR
const EventMap = dynamic(() => import('./event-map').then(mod => ({ default: mod.EventMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-lg shadow-lg bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Carregando mapa...</p>
      </div>
    </div>
  )
})

export function DynamicMap({ events, selectedEvent, onEventSelect }: DynamicMapProps) {
  return <EventMap events={events} selectedEvent={selectedEvent} onEventSelect={onEventSelect} />
} 