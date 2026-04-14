import { APP_CONFIG } from '@/config'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(APP_CONFIG.locale, {
    style: 'currency',
    currency: APP_CONFIG.currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat(APP_CONFIG.locale).format(num)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(APP_CONFIG.locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(APP_CONFIG.locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat(APP_CONFIG.locale, {
    style: 'percent',
    minimumFractionDigits: 1,
  }).format(value / 100)
}

export function formatPhone(phone: string): string {
  // Format for Guatemala phone numbers
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`
  }
  return phone
}

export function formatNIT(nit: string): string {
  // Format NIT for Guatemala
  const cleaned = nit.replace(/\D/g, '')
  if (cleaned.length >= 8) {
    return `${cleaned.slice(0, -1)}-${cleaned.slice(-1)}`
  }
  return nit
}
