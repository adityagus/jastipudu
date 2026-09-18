export function errorMessage(error: unknown): string {
  const e = error as { data?: { statusMessage?: string }; statusMessage?: string }
  return e?.data?.statusMessage || e?.statusMessage || 'Terjadi kesalahan. Silakan coba lagi.'
}
