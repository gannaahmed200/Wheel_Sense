import { useEffect, useRef, useState } from 'react'

export function useWebSocket(url: string) {
  const ws = useRef<WebSocket | null>(null)
  const [data, setData] = useState<unknown>(null)
  const [connected, setConnected] = useState(false)

  const connect = () => {
    ws.current = new WebSocket(url)
    ws.current.onopen = () => setConnected(true)
    ws.current.onclose = () => setConnected(false)
    ws.current.onerror = () => setConnected(false)
    ws.current.onmessage = e => setData(JSON.parse(e.data))
  }

  const disconnect = () => ws.current?.close()

  useEffect(() => {
    return () => ws.current?.close()
  }, [])

  return { data, connected, connect, disconnect }
}
