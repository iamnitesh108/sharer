export type HelloResponse = {
  message: string
}

export async function getHello(signal?: AbortSignal): Promise<HelloResponse> {
  const response = await fetch('/api/hello', { signal })
  if (!response.ok) {
    throw new Error(`GET /api/hello failed with status ${response.status}`)
  }

  const body: unknown = await response.json()
  if (!isHelloResponse(body)) {
    throw new Error('GET /api/hello returned an unexpected body')
  }

  return body
}

function isHelloResponse(value: unknown): value is HelloResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  )
}
