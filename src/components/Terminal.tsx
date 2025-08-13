import { useEffect, useRef, useState } from 'react'

interface TerminalProps {
    commandId?: string
    args?: any
    onComplete?: (success: boolean) => void
}

export const Terminal = ({ commandId, args, onComplete }: TerminalProps) => {
    const [output, setOutput] = useState<string[]>([])
    const [status, setStatus] = useState<'ready' | 'connecting' | 'running' | 'error'>('ready')
    const [input, setInput] = useState('')
    const outputEndRef = useRef<HTMLDivElement>(null)
    const eventSourceRef = useRef<EventSource | null>(null)

    useEffect(() => {
        if (commandId) {
            startCommand(commandId, args)
        }
        return () => {
            eventSourceRef.current?.close()
        }
    }, [commandId, args])

    const scrollToBottom = () => {
        outputEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [output])

    const startCommand = async (cmdId: string, cmdArgs: any = {}) => {
        setStatus('connecting')
        setOutput(prev => [...prev, `🚀 Starting command: ${cmdId}`])

        try {
            eventSourceRef.current?.close()

            const sseUrl = new URL(`/api/run-realtime/${cmdId}`, import.meta.env.VITE_API_BASE_URL || window.location.origin)
            if (cmdArgs && Object.keys(cmdArgs).length > 0) {
                sseUrl.searchParams.append('args', encodeURIComponent(JSON.stringify(cmdArgs)))
            }

            eventSourceRef.current = new EventSource(sseUrl.toString())

            eventSourceRef.current.onopen = () => {
                setStatus('running')
                setOutput(prev => [...prev, '✅ Connected to command stream'])
            }

            eventSourceRef.current.onerror = (e) => {
                console.error('SSE Error:', e)
                setStatus('error')
                setOutput(prev => [...prev, '❌ Connection error'])
                onComplete?.(false)
            }

            eventSourceRef.current.addEventListener('stdout', (e) => {
                setOutput(prev => [...prev, e.data])
            })

            eventSourceRef.current.addEventListener('stderr', (e) => {
                setOutput(prev => [...prev, `[ERROR] ${e.data}`])
            })

            eventSourceRef.current.addEventListener('result', (e) => {
                const result = JSON.parse(e.data)
                if (result.success) {
                    setOutput(prev => [...prev, `✅ Command completed (exit code: ${result.exitCode})`])
                    onComplete?.(true)
                } else {
                    setOutput(prev => [...prev, `❌ Command failed: ${result.error}`])
                    onComplete?.(false)
                }
                setStatus('ready')
            })
        } catch (err) {
            console.error('Command error:', err)
            setStatus('error')
            setOutput(prev => [...prev, `❌ Failed to start command: ${err instanceof Error ? err.message : String(err)}`])
            onComplete?.(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const [cmd, ...rest] = input.split(' ')
        const args = rest.reduce((acc, pair) => {
            const [key, value] = pair.split('=')
            if (key && value) acc[key] = value
            return acc
        }, {} as Record<string, string>)

        startCommand(cmd, args)
        setInput('')
    }

    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-lg shadow-xl">
            <div className="p-4 bg-gray-800 rounded-t-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${status === 'ready' ? 'bg-green-500' :
                            status === 'running' ? 'bg-yellow-500' :
                                'bg-red-500'
                        }`}></span>
                    <span>Terminal</span>
                </div>
            </div>

            <div className="flex-1 p-4 bg-black overflow-y-auto font-mono text-sm">
                {output.map((line, i) => (
                    <div key={i} className={
                        line.startsWith('[ERROR]') ? 'text-red-400' :
                            line.startsWith('✅') ? 'text-green-400' :
                                'text-gray-100'
                    }>
                        {line}
                    </div>
                ))}
                <div ref={outputEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-gray-800 rounded-b-lg">
                <div className="flex gap-2 items-center">
                    <span className="text-green-400">$</span>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 bg-gray-700 text-white px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={status !== 'ready'}
                        placeholder="Enter command..."
                    />
                </div>
            </form>
        </div>
    )
}