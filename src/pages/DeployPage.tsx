import { useEffect, useState } from "react";
import { DeployForm, type DeployFormData } from "../components/DeployForm";
import { Terminal } from "../components/Terminal";
import { useAuth } from "../services/auth";

export const DeployPage = () => {
    const { isAuthenticated, isLoading: isAuthLoading, login } = useAuth();

    const [isDeploying, setIsDeploying] = useState(false);
    const [commandId, setCommandId] = useState<string>();
    const [args, setArgs] = useState<Record<string, any>>();
    const [status, setStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
    const [deploymentComplete, setDeploymentComplete] = useState(false);
    const [requestId, setRequestId] = useState(0); // Track unique requests

    useEffect(() => {
        if (!isAuthenticated && !isAuthLoading) {
            login().then(success => {
                if (!success) {
                    setStatus({ type: "error", message: "Auto-login failed." });
                }
            });
        }
    }, []);

    const handleDeploy = async (data: DeployFormData) => {
        console.log("[DeployPage] Deploy button clicked", data);

        if (isDeploying) {
            console.warn("[DeployPage] Already deploying, ignoring duplicate submit");
            return;
        }

        const currentRequestId = Date.now();
        setRequestId(currentRequestId);

        if (!isAuthenticated) {
            console.log("[DeployPage] Not authenticated, attempting login...");
            const success = await login();
            if (!success) {
                console.error("[DeployPage] Login failed");
                setStatus({ type: "error", message: "Authentication failed. Check API key." });
                return;
            }
        }

        setIsDeploying(true);
        setDeploymentComplete(false);
        setStatus({ type: "info", message: "Starting deployment..." });

        const deployArgs = {
            ...data,
            owner: "6829ddabc20c6404b3e2a66b",
            business: "682b5d636be45193cf943b85",
            gtm: "GTM-5NR79L8B",
        };

        // Use the base commandId but force new Terminal instance with requestId
        setCommandId("deploy-project");
        setArgs({
            ...deployArgs,
            _requestId: currentRequestId // Include requestId in args instead
        });
    };

    const handleComplete = (success: boolean) => {
        setIsDeploying(false);
        setDeploymentComplete(true);
        setStatus(
            success
                ? { type: "success", message: "Deployment completed successfully!" }
                : { type: "error", message: "Deployment failed. Check terminal output." }
        );
    };

    const handleNewDeployment = () => {
        setDeploymentComplete(false);
        setStatus(null);
    };


    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">🚀 Deploy Project</h1>

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
                                {deploymentComplete && (
                                    <button
                                        onClick={handleNewDeployment}
                                        className="mt-2 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded text-white"
                                    >
                                        Start New Deployment
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <DeployForm
                    onSubmit={handleDeploy}
                    isSubmitting={isDeploying || isAuthLoading}
                    disabled={isDeploying && !deploymentComplete}
                />

                <div className="mt-8">
                    <Terminal
                        key={requestId} // Unique key ensures fresh terminal instance
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