'use client'

import { useEffect, useRef, useState } from 'react'
import type { Client } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Navigation, ZoomIn, ZoomOut } from 'lucide-react'

interface ClientsMapProps {
  clients: Client[]
  onSelectClient: (client: Client) => void
}

// Guatemala center coordinates
const GUATEMALA_CENTER = { lat: 14.6349, lng: -90.5069 }

export function ClientsMap({ clients, onSelectClient }: ClientsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedMarker, setSelectedMarker] = useState<Client | null>(null)
  const [zoom, setZoom] = useState(8)

  const clientsWithLocation = clients.filter(
    (c) => c.latitude !== undefined && c.longitude !== undefined
  )

  // Calculate bounds to fit all markers
  const bounds = clientsWithLocation.reduce(
    (acc, client) => ({
      minLat: Math.min(acc.minLat, client.latitude!),
      maxLat: Math.max(acc.maxLat, client.latitude!),
      minLng: Math.min(acc.minLng, client.longitude!),
      maxLng: Math.max(acc.maxLng, client.longitude!),
    }),
    {
      minLat: GUATEMALA_CENTER.lat,
      maxLat: GUATEMALA_CENTER.lat,
      minLng: GUATEMALA_CENTER.lng,
      maxLng: GUATEMALA_CENTER.lng,
    }
  )

  const center = {
    lat: (bounds.minLat + bounds.maxLat) / 2,
    lng: (bounds.minLng + bounds.maxLng) / 2,
  }

  // Convert lat/lng to pixel position on map
  const getMarkerPosition = (lat: number, lng: number) => {
    const mapWidth = 100 // percentage
    const mapHeight = 100 // percentage

    // Normalize to 0-1 range based on bounds
    const latRange = bounds.maxLat - bounds.minLat || 0.1
    const lngRange = bounds.maxLng - bounds.minLng || 0.1

    const x = ((lng - bounds.minLng) / lngRange) * 80 + 10 // 10% padding
    const y = ((bounds.maxLat - lat) / latRange) * 80 + 10 // 10% padding, inverted

    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
  }

  return (
    <div className="relative">
      {/* Map Container */}
      <div
        ref={mapRef}
        className="relative w-full h-[500px] rounded-lg overflow-hidden bg-muted/30"
        style={{
          backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${center.lng},${center.lat},${zoom},0/800x500@2x?access_token=pk.placeholder')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Map Grid Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5">
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            {[...Array(10)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={`${i * 10}%`}
                x2="100%"
                y2={`${i * 10}%`}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border"
              />
            ))}
            {[...Array(10)].map((_, i) => (
              <line
                key={`v-${i}`}
                x1={`${i * 10}%`}
                y1="0"
                x2={`${i * 10}%`}
                y2="100%"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border"
              />
            ))}
          </svg>
        </div>

        {/* Client Markers */}
        {clientsWithLocation.map((client) => {
          const pos = getMarkerPosition(client.latitude!, client.longitude!)
          const isSelected = selectedMarker?.id === client.id

          return (
            <div
              key={client.id}
              className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-200 z-10 hover:z-20"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onClick={() => {
                setSelectedMarker(isSelected ? null : client)
              }}
            >
              {/* Marker */}
              <div
                className={`relative transition-transform ${
                  isSelected ? 'scale-125' : 'hover:scale-110'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                    isSelected
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                {/* Marker tail */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent ${
                    isSelected ? 'border-t-accent' : 'border-t-primary'
                  }`}
                  style={{ borderTopWidth: '6px' }}
                />
              </div>

              {/* Popup */}
              {isSelected && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 bg-card border border-border rounded-lg shadow-xl p-4 z-30">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-foreground text-sm">
                      {client.name}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {client.department}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {client.address}, {client.city}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(
                          `https://www.google.com/maps?q=${client.latitude},${client.longitude}`,
                          '_blank'
                        )
                      }}
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Ver en Maps
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectClient(client)
                      }}
                    >
                      Editar
                    </Button>
                  </div>
                  {/* Arrow */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-card" />
                </div>
              )}
            </div>
          )
        })}

        {/* Empty State */}
        {clientsWithLocation.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                No hay clientes con ubicación registrada
              </p>
            </div>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-1">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 shadow-md"
            onClick={() => setZoom((z) => Math.min(z + 1, 15))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 shadow-md"
            onClick={() => setZoom((z) => Math.max(z - 1, 5))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs font-medium text-foreground mb-2">
            {clientsWithLocation.length} clientes en el mapa
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Ubicación de cliente</span>
          </div>
        </div>
      </div>
    </div>
  )
}
