'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency, formatPhone } from '@/utils/format'
import type { Client } from '@/types'
import { MoreHorizontal, Pencil, Trash2, MapPin, Phone, Mail } from 'lucide-react'

interface ClientsTableProps {
  clients: Client[]
  onEdit: (client: Client) => void
  onDelete: (clientId: string) => void
}

export function ClientsTable({ clients, onEdit, onDelete }: ClientsTableProps) {
  if (clients.length === 0) {
    return (
      <Card className="border-border/50 p-8 text-center">
        <p className="text-muted-foreground">No se encontraron clientes</p>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>NIT</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead className="text-right">Crédito</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => {
            const creditUsage = client.creditLimit > 0
              ? (client.balance / client.creditLimit) * 100
              : 0
            const isHighUsage = creditUsage > 80

            return (
              <TableRow key={client.id}>
                <TableCell>
                  <p className="font-medium text-foreground">{client.name}</p>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {client.nit}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center text-sm text-muted-foreground">
                      <Phone className="w-3 h-3 mr-1.5" />
                      {formatPhone(client.phone)}
                    </span>
                    <span className="flex items-center text-sm text-muted-foreground">
                      <Mail className="w-3 h-3 mr-1.5" />
                      {client.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-foreground">{client.city}</span>
                    <span className="flex items-center text-xs text-muted-foreground">
                      {client.latitude && client.longitude ? (
                        <>
                          <MapPin className="w-3 h-3 mr-1 text-accent" />
                          <span className="text-accent">{client.department}</span>
                        </>
                      ) : (
                        <span>{client.department}</span>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-medium text-foreground">
                    {formatCurrency(client.creditLimit)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`font-medium ${
                        isHighUsage ? 'text-destructive' : 'text-foreground'
                      }`}
                    >
                      {formatCurrency(client.balance)}
                    </span>
                    {client.balance > 0 && (
                      <Badge
                        variant="outline"
                        className={
                          isHighUsage
                            ? 'border-destructive/30 text-destructive text-xs'
                            : 'text-xs'
                        }
                      >
                        {creditUsage.toFixed(0)}% usado
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(client)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(client.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
