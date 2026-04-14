'use client'

import { useState, useMemo } from 'react'
import { mockClients } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DEPARTMENTS_GT } from '@/config'
import { Plus, Search, MapPin, Users, CreditCard, DollarSign } from 'lucide-react'
import { ClientsTable } from './clients-table'
import { ClientDialog } from './client-dialog'
import { ClientsMap } from './clients-map'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/utils/format'
import type { Client } from '@/types'
import { toast } from 'sonner'

export function ClientsContent() {
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.nit.includes(search)

      const matchesDepartment =
        departmentFilter === 'all' || client.department === departmentFilter

      return matchesSearch && matchesDepartment
    })
  }, [clients, search, departmentFilter])

  const handleEdit = (client: Client) => {
    setSelectedClient(client)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedClient(null)
    setIsDialogOpen(true)
  }

  const handleSave = (clientData: Partial<Client>) => {
    if (selectedClient) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === selectedClient.id ? { ...c, ...clientData, updatedAt: new Date() } : c
        )
      )
      toast.success('Cliente actualizado')
    } else {
      const newClient: Client = {
        id: String(Date.now()),
        name: clientData.name || '',
        nit: clientData.nit || '',
        email: clientData.email || '',
        phone: clientData.phone || '',
        address: clientData.address || '',
        city: clientData.city || '',
        department: clientData.department || 'Guatemala',
        latitude: clientData.latitude,
        longitude: clientData.longitude,
        creditLimit: clientData.creditLimit || 0,
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setClients((prev) => [newClient, ...prev])
      toast.success('Cliente creado')
    }
    setIsDialogOpen(false)
    setSelectedClient(null)
  }

  const handleDelete = (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId))
    toast.success('Cliente eliminado')
  }

  const totalBalance = clients.reduce((acc, c) => acc + c.balance, 0)
  const totalCreditLimit = clients.reduce((acc, c) => acc + c.creditLimit, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu cartera de clientes
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Clientes</p>
              <p className="text-2xl font-bold text-foreground">{clients.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-accent/10">
              <MapPin className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Con Ubicación</p>
              <p className="text-2xl font-bold text-foreground">
                {clients.filter((c) => c.latitude && c.longitude).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-chart-3/10">
              <CreditCard className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Límite de Crédito</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(totalCreditLimit)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-xl bg-warning/10">
              <DollarSign className="h-5 w-5 text-warning-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(totalBalance)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o NIT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {DEPARTMENTS_GT.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Views */}
      <Tabs defaultValue="table" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="table">
            <Users className="w-4 h-4 mr-2" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="map">
            <MapPin className="w-4 h-4 mr-2" />
            Mapa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <ClientsTable
            clients={filteredClients}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="map">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Ubicación de Clientes</CardTitle>
              <CardDescription>
                Visualiza la ubicación de tus clientes en el mapa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientsMap clients={filteredClients} onSelectClient={handleEdit} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ClientDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        client={selectedClient}
        onSave={handleSave}
      />
    </div>
  )
}
