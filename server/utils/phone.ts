export function normalizeWhatsAppPhone(input: string | number) {
  const raw = String(input || '')
    .trim()
    .replace(/[\s().-]/g, '')
  if (raw.startsWith('+')) return raw.slice(1)
  if (raw.startsWith('0')) return '62' + raw.slice(1)
  return raw
}
export function whatsappUrl(phone: string, message: string) {
  const number = normalizeWhatsAppPhone(phone)
  if (!/^[1-9][0-9]{7,14}$/.test(number)) return null
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
