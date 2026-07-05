export function generateUuid() {
  return crypto.randomUUID()
}

export function generateUuids(count: number) {
  return Array.from({ length: count }, () => generateUuid())
}
