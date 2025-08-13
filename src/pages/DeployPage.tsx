// DeployPage.tsx
import { useState } from 'react'
import { DeployForm } from '../components/DeployForm'
import { Terminal } from '../components/Terminal'
import { useAuth } from '../services/auth'

export const DeployPage = () => {
    const { isAuthenticated, isLoading: isAuthLoading, login } = useAuth()
    const [isDeploying, setIsDeploying] = useState(false)
    const [commandId, setCommandId] = useState<string | undefined>(undefined)
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

    const handleDeploy = async (data: {
        name: string
        domain: string
        repo: string
        env: Record<string, string>
    }) => {
        if (!isAuthenticated) {
            try {
                await login()
            } catch (err) {
                setStatus({ type: 'error', message: 'Authentication failed' })
                return
            }
        }

        setIsDeploying(true)
        setStatus({ type: 'info', message: 'Starting deployment...' })

        try {
            // If you need to use args later, uncomment this:
            // const args = {
            //     ...data,
            //     owner: "6829ddabc20c6404b3e2a66b",
            //     business: "682b5d636be45193cf943b85",
            //     gtm: "GTM-5NR79L8B"
            // }

            setCommandId('deploy-project')
            setStatus({ type: 'success', message: 'Deployment started!' })
        } catch (err) {
            setStatus({ type: 'error', message: `Deployment failed: ${err instanceof Error ? err.message : 'Unknown error'}` })
            setIsDeploying(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">🚀 Deploy Project</h1>

                {status && (
                    <div className={`mb-6 p-4 rounded-lg border ${status.type === 'success' ? 'bg-green-900/20 border-green-700' :
                        status.type === 'error' ? 'bg-red-900/20 border-red-700' :
                            'bg-blue-900/20 border-blue-700'
                        }`}>
                        <div className="flex items-center gap-3">
                            <span>{status.type === 'success' ? '✅' : status.type === 'error' ? '❌' : 'ℹ️'}</span>
                            <div>
                                <h3 className="font-medium">{status.type.toUpperCase()}</h3>
                                <p className="text-sm">{status.message}</p>
                            </div>
                        </div>
                    </div>
                )}

                <DeployForm
                    onSubmit={handleDeploy}
                    isSubmitting={isDeploying || isAuthLoading || !isAuthenticated}
                />

                <div className="mt-8">
                    <Terminal
                        commandId={commandId}
                        onComplete={(success) => {
                            setIsDeploying(false)
                            setStatus(success ?
                                { type: 'success', message: 'Deployment completed successfully!' } :
                                { type: 'error', message: 'Deployment failed. Check terminal output for details.' }
                            )
                        }}
                    />
                </div>
            </div>
        </div>
    )
}