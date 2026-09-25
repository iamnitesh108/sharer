type HelloResponse = {
  message: string
}

export async function getHello(signal?: AbortSignal): Promise<HelloResponse> {
  const response = await fetch('/api/hello', { signal })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}
