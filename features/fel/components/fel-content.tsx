'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import {
  FileText,
  Settings,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Building2,
  Key,
  Shield,
} from 'lucide-react'

const certifierProviders = [
  {
    name: 'INFILE',
    description: 'Certificador autorizado por SAT',
    website: 'https://www.infile.com.gt',
  },
  {
    name: 'DIGIFACT',
    description: 'Soluciones de facturación electrónica',
    website: 'https://www.digifact.com.gt',
  },
  {
    name: 'GUATEFACTURAS',
    description: 'Facturación electrónica Guatemala',
    website: 'https://www.guatefacturas.com',
  },
  {
    name: 'MEGAPRINT',
    description: 'Servicios FEL certificados',
    website: 'https://www.megaprint.com.gt',
  },
]

const pendingInvoices = [
  { id: '1', client: 'Tienda Don José', amount: 2450.00, date: '2024-03-05' },
  { id: '2', client: 'Mini Super Express', amount: 1850.50, date: '2024-03-05' },
  { id: '3', client: 'Distribuidora El Sol', amount: 5200.00, date: '2024-03-04' },
]

export function FelContent() {
  const isConfigured = false // This will be true once FEL is configured

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          FEL - Facturación Electrónica
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestión de facturación electrónica en línea
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <AlertCircle className="h-5 w-5 text-warning-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <p className="font-semibold text-foreground">No Configurado</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-muted">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Certificador</p>
              <p className="font-semibold text-foreground">Sin Asignar</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold text-foreground">3</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-accent/10">
              <CheckCircle2 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Certificadas</p>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Configuration Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Setup Card */}
          <Card className="border-border/50 border-dashed border-2">
            <CardContent className="py-12">
              <Empty
                icon={FileText}
                title="Configuración de FEL Pendiente"
                description="Para emitir facturas electrónicas, necesitas contratar un certificador autorizado por la SAT de Guatemala."
              >
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button>
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar FEL
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Documentación
                  </Button>
                </div>
              </Empty>
            </CardContent>
          </Card>

          {/* Pending Invoices */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Facturas Pendientes de Certificar</CardTitle>
              <CardDescription>
                Estas facturas están listas para ser certificadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {invoice.client}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(invoice.date).toLocaleDateString('es-GT')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-foreground">
                        Q {invoice.amount.toFixed(2)}
                      </span>
                      <Badge variant="outline" className="border-warning text-warning-foreground">
                        Pendiente
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Requirements */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Requisitos para FEL</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-muted mt-0.5">
                    <Key className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Credenciales del Certificador
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Usuario y contraseña proporcionados
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-muted mt-0.5">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      NIT Habilitado
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Autorización de SAT vigente
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-muted mt-0.5">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Firma Electrónica
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Certificado digital válido
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Certifiers */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Certificadores Autorizados</CardTitle>
              <CardDescription>
                Proveedores de servicios FEL en Guatemala
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {certifierProviders.map((provider) => (
                  <a
                    key={provider.name}
                    href={provider.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/30 transition-colors group"
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {provider.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {provider.description}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
