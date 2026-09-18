import type { Status } from '../types'
export const money = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
export const dateTime = (value: string) =>
  new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value)) + ' WIB'
export const statusLabels: Record<Status, string> = {
  pending: 'Menunggu konfirmasi',
  confirmed: 'Dikonfirmasi',
  processing: 'Sedang diproses',
  secured: 'Tiket didapatkan',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}
export const transitions: Record<Status, Status[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['secured', 'cancelled'],
  secured: ['completed'],
  completed: [],
  cancelled: [],
}
