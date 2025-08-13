import { useEffect, useRef, useState } from 'react';

interface TerminalProps {
    commandId?: string;
    args?: any;
    onComplete?: (success: boolean) => void;
    interactive?: boolean;
    persistent?: boolean;
    showControls?: boolean;
}

export const Terminal = ({
    commandId,
    args,
    onComplete,
    interactive = true,
    persistent = false,
    showControls = true
}: TerminalProps) => {
    const [output, setOutput] = useState<string[]>([]);
    const [status, setStatus] = useState<'ready' | 'connecting' | 'running' | 'error'>('ready');
    const [input, setInput] = useState('');
    const outputEndRef = useRef<HTMLDivElement>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        if (commandId && args) {
            startCommand(commandId, args);
        }

        return () => {
            stopCommand();
        };
    }, [commandId, args]);

    const scrollToBottom = () => {
        outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [output]);

    const stopCommand = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            setStatus('ready');
            addToOutput('⏹ Command stopped by user');
        }
    };

    const clearOutput = () => {
        setOutput([]);
    };

    const addToOutput = (lines: string | string[]) => {
        const newLines = Array.isArray(lines) ? lines : [lines];
        setOutput(prev => [...prev, ...newLines]);
    };

    // Basic ANSI escape code removal while preserving colors
    const cleanAnsi = (text: string): string => {
        // Remove unsupported ANSI codes but keep basic color codes
        return text.replace(/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[mGK]/g, '');
    };

    const startCommand = (cmdId: string, cmdArgs: any = {}) => {
        if (!cmdId) return;

        if (!persistent) {
            clearOutput();
        }

        setStatus('connecting');
        addToOutput(`🚀 Starting command: ${cmdId}`);

        eventSourceRef.current?.close();

        const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
        const sseUrl = new URL(`/api/run-realtime/${cmdId}`, baseUrl);

        if (Object.keys(cmdArgs).length > 0) {
            sseUrl.searchParams.append('args', encodeURIComponent(JSON.stringify(cmdArgs)));
        }

        const es = new EventSource(sseUrl.toString(), { withCredentials: true });
        eventSourceRef.current = es;

        es.onopen = () => {
            setStatus('running');
            addToOutput('✅ Connected to command stream');
        };

        es.onerror = (err) => {
            console.error('SSE error:', err);
            setStatus('error');
            addToOutput('❌ Connection error');
            onComplete?.(false);
            es.close();
        };

        es.addEventListener('stdout', (e) => {
            try {
                const data = JSON.parse(e.data).data;
                addToOutput(cleanAnsi(data));
            } catch (error) {
                addToOutput(`[DATA PARSE ERROR] ${e.data}`);
            }
        });

        es.addEventListener('stderr', (e) => {
            try {
                const data = JSON.parse(e.data).data;
                addToOutput(`[ERROR] ${cleanAnsi(data)}`);
            } catch (error) {
                addToOutput(`[ERROR DATA] ${e.data}`);
            }
        });

        es.addEventListener('result', (e) => {
            try {
                const result = JSON.parse(e.data);
                if (result.success) {
                    addToOutput(`✅ Command completed (exit code: ${result.exitCode})`);
                } else {
                    addToOutput(`❌ Command failed: ${cleanAnsi(result.error || 'Unknown error')}`);
                }
                setStatus('ready');
                onComplete?.(result.success);
            } catch (error) {
                addToOutput('❌ Failed to parse command result');
                onComplete?.(false);
            } finally {
                es.close();
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || status !== 'ready') return;

        const [cmd, ...rest] = input.split(' ');
        const args = rest.reduce((acc, pair) => {
            const [key, value] = pair.split('=');
            if (key && value) acc[key] = value;
            return acc;
        }, {} as Record<string, string>);

        startCommand(cmd, args);
        setInput('');
    };

    // Determine line color based on content
    const getLineColor = (line: string) => {
        if (line.includes('[ERROR]') || line.startsWith('❌')) return 'text-red-400';
        if (line.startsWith('✅') || line.includes('[SUCCESS]')) return 'text-green-400';
        if (line.includes('[WARNING]')) return 'text-yellow-400';
        if (line.includes('[INFO]')) return 'text-blue-400';
        if (line.startsWith('🚀')) return 'text-purple-400';
        if (line.startsWith('⏹')) return 'text-gray-400';
        return 'text-gray-200';
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-lg shadow-xl overflow-hidden min-h-[300px]">
            <div className="p-4 bg-gray-800 rounded-t-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span
                        className={`w-3 h-3 rounded-full ${status === 'ready' ? 'bg-green-500' :
                            status === 'running' ? 'bg-yellow-500' :
                                'bg-red-500'
                            }`}
                    />
                    <span className="font-mono text-sm">Terminal</span>
                </div>

                {showControls && (
                    <div className="flex items-center gap-2">
                        {status !== 'ready' && (
                            <button
                                onClick={stopCommand}
                                className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded text-white font-mono"
                            >
                                Stop
                            </button>
                        )}
                        <button
                            onClick={clearOutput}
                            className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 rounded text-white font-mono"
                        >
                            Clear
                        </button>
                        {status !== 'ready' && (
                            <span className="text-xs text-gray-400 font-mono">
                                {status === 'connecting' ? 'Connecting...' :
                                    status === 'running' ? 'Running...' : 'Error'}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-1 p-4 bg-black overflow-y-auto font-mono text-sm min-h-[300px] max-h-[300px]">
                {output.map((line, i) => (
                    <div
                        key={i}
                        className={`mb-1 whitespace-pre-wrap ${getLineColor(line)}`}
                    >
                        {line}
                    </div>
                ))}
                <div ref={outputEndRef} />
            </div>

            {interactive && (
                <form onSubmit={handleSubmit} className="p-4 bg-gray-800 rounded-b-lg border-t border-gray-700">
                    <div className="flex gap-2 items-center">
                        <span className="text-green-400 select-none">$</span>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 bg-gray-700 text-white px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                            disabled={status !== 'ready'}
                            placeholder="Enter command..."
                        />
                    </div>
                </form>
            )}
        </div>
    );
};