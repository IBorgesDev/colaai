'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Event } from '@/lib/types'

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface EventMapProps {
  events: Event[]
  selectedEvent?: Event | null
  onEventSelect?: (event: Event) => void
}

export function EventMap({ events, selectedEvent, onEventSelect }: EventMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])

  // Zoom to selected event when it changes
  useEffect(() => {
    if (selectedEvent && selectedEvent.latitude && selectedEvent.longitude && mapRef.current) {
      // Use flyTo for smoother animation and better centering
      mapRef.current.flyTo([selectedEvent.latitude, selectedEvent.longitude], 16, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.25
      })
      
      // Find and open the popup for the selected event
      const marker = markersRef.current.find(m => {
        const markerLatLng = m.getLatLng()
        return Math.abs(markerLatLng.lat - (selectedEvent.latitude || 0)) < 0.0001 && 
               Math.abs(markerLatLng.lng - (selectedEvent.longitude || 0)) < 0.0001
      })
      if (marker) {
        // Add a small delay to ensure the map has finished moving
        setTimeout(() => {
          marker.openPopup()
        }, 1600)
      }
    }
  }, [selectedEvent])

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([-23.5505, -46.6333], 11)

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current)
    }

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker)
    })
    markersRef.current = []

    // Add markers for events
    events.forEach(event => {
      if (!event.latitude || !event.longitude || !mapRef.current) return

      // Create custom icon based on category color
      const categoryColor = event.category?.color || '#6366f1'
      const isSelected = selectedEvent?.id === event.id
      const icon = L.divIcon({
        html: `
          <div style="
            background-color: ${categoryColor};
            width: ${isSelected ? '30px' : '25px'};
            height: ${isSelected ? '30px' : '25px'};
            border-radius: 50%;
            border: 3px solid ${isSelected ? '#fbbf24' : 'white'};
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
            transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
            transition: all 0.3s ease;
          ">
            ${event.isUserRegistered ? '✓' : '?'}
          </div>
        `,
        className: 'custom-div-icon',
        iconSize: [isSelected ? 30 : 25, isSelected ? 30 : 25],
        iconAnchor: [isSelected ? 15 : 12, isSelected ? 15 : 12]
      })

      const marker = L.marker([event.latitude, event.longitude], { icon })
        .addTo(mapRef.current!)

      // Create popup content
      const popupContent = `
        <div style="min-width: 250px;">
          <div style="
            background: linear-gradient(135deg, ${categoryColor}, ${categoryColor}dd);
            color: white;
            padding: 8px 12px;
            margin: -9px -20px 8px -20px;
            border-radius: 4px 4px 0 0;
          ">
            <div style="font-size: 11px; opacity: 0.9;">${event.category?.name}</div>
            <div style="font-weight: bold; font-size: 14px;">${event.title}</div>
          </div>
          <div style="padding: 0 4px;">
            <div style="margin-bottom: 8px; color: #666; font-size: 13px; line-height: 1.4;">
              ${event.description}
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 4px; font-size: 12px; color: #555;">
              📅 ${new Date(event.date).toLocaleDateString('pt-BR')} às ${event.time.slice(0, 5)}
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 4px; font-size: 12px; color: #555;">
              📍 ${event.location}
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px; font-size: 12px; color: #555;">
              👥 ${event.availableSpots !== undefined 
                  ? `${event.capacity - event.availableSpots}/${event.capacity} inscritos`
                  : `${event.capacity} vagas`
                }
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-weight: bold; color: ${categoryColor};">
                ${event.price === 0 ? 'Gratuito' : `R$ ${Number(event.price).toFixed(2)}`}
              </div>
              ${event.isUserRegistered 
                ? '<div style="background: #10b981; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">✓ Inscrito</div>'
                : '<div style="background: #6366f1; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">Disponível</div>'
              }
            </div>
          </div>
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      })

      // Handle marker click
      marker.on('click', () => {
        if (onEventSelect) {
          onEventSelect(event)
        }
      })

      markersRef.current.push(marker)
    })

    // Fit map to show all markers if there are events and no event is selected
    if (events.length > 0 && !selectedEvent) {
      const validEvents = events.filter(e => e.latitude && e.longitude)
      if (validEvents.length > 0) {
        const group = L.featureGroup(markersRef.current)
        const bounds = group.getBounds()
        
        // Use fitBounds with better padding and max zoom
        mapRef.current.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 14
        })
      }
    }

    // Cleanup function
    return () => {
      // Don't remove the map here, just clean markers
    }
  }, [events, selectedEvent, onEventSelect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <>
      <div 
        ref={mapContainerRef} 
        className="w-full h-full rounded-lg shadow-lg"
        style={{ zIndex: 1 }}
      />
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-div-icon {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </>
  )
} 