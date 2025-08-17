// src/pages/DockerTagServerPage.tsx
import { useEffect, useState } from "react";
import { DockerTagServerForm, type DockerTagServerFormData } from "../components/DockerTagServerForm";
import { Terminal } from "../components/Terminal";
import { useAuth } from "../services/auth";

export const DockerTagServerPage = () => {
    const { isAuthenticated, isLoading: isAuthLoading, login } = useAuth();

    const [isProcessing, setIsProcessing] = useState(false);
    const [commandId, setCommandId] = useState<string>();
    const [args, setArgs] = useState<Record<string, any>>();
    const [status, setStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
    const [operationComplete, setOperationComplete] = useState(false);
    const [requestId, setRequestId] = useState(0);

    useEffect(() => {
        if (!isAuthenticated && !isAuthLoading) {
            login().then(success => {
                if (!success) {
                    setStatus({ type: "error", message: "Auto-login failed." });
                }
            });
        }
    }, []);

    const handleSubmit = async (data: DockerTagServerFormData) => {
        if (isProcessing) return;

        const currentRequestId = Date.now();

        if (!isAuthenticated) {
            const success = await login();
            if (!success) {
                setStatus({ type: "error", message: "Authentication failed. Check API key." });
                return;
            }
        }

        setIsProcessing(true);
        setOperationComplete(false);
        setStatus({ type: "info", message: `Starting ${data.action} operation...` });

        // ✅ Only send real args
        const commandArgs: Record<string, any> = { action: data.action };

        if (data.action === 'run') {
            commandArgs.subdomain = data.subdomain;
            commandArgs.config = data.config;
            commandArgs.name = data.name;
        } else if (data.action === 'delete') {
            if (data.all) commandArgs.all = true;
            if (data.containerName) commandArgs.containerName = data.containerName;
        }

        setCommandId("docker-tagserver");
        setArgs(commandArgs); // ✅ No _requestId
        setRequestId(currentRequestId);
    };

    const handleComplete = (success: boolean) => {
        setIsProcessing(false);
        setOperationComplete(true);
        setStatus(
            success
                ? { type: "success", message: "Operation completed successfully!" }
                : { type: "error", message: "Operation failed. Check terminal output." }
        );
    };

    const handleNewOperation = () => {
        setOperationComplete(false);
        setStatus(null);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">🐳 Docker Tag Server Management</h1>

                {status && (
                    <div
                        className={`mb-6 p-4 rounded-lg border ${status.type === "success"
                            ? "bg-green-900/20 border-green-700"
                            : status.type === "error"
                                ? "bg-red-900/20 border-red-700"
                                : "bg-blue-900/20 border-blue-700"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span>{status.type === "success" ? "✅" : status.type === "error" ? "❌" : "ℹ️"}</span>
                            <div>
                                <h3 className="font-medium">{status.type.toUpperCase()}</h3>
                                <p className="text-sm">{status.message}</p>
                                {operationComplete && (
                                    <button
                                        onClick={handleNewOperation}
                                        className="mt-2 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded text-white"
                                    >
                                        New Operation
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <DockerTagServerForm
                    onSubmit={handleSubmit}
                    isSubmitting={isProcessing || isAuthLoading}
                    disabled={isProcessing && !operationComplete}
                />

                <div className="mt-8">
                    <Terminal
                        key={requestId}
                        commandId={commandId}
                        args={args}
                        onComplete={handleComplete}
                        interactive={false}
                        persistent={true}
                    />
                </div>
            </div>
        </div>
    );
};