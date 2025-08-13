import { useState } from 'react';
import { EnvVarInput } from './EnvVarInput';

interface DeployFormProps {
    onSubmit: (data: DeployFormData) => void;
    isSubmitting: boolean;
    disabled?: boolean;
}

export type DeployFormData = {
    name: string;
    domain: string;
    repo: string;
    env: Record<string, string>;
};

const predefinedVars = [
    { key: 'NODE_ENV', description: 'Node environment', defaultValue: 'production' },
    { key: 'NEXT_PUBLIC_OWNER_ID', description: 'Owner ID', defaultValue: '6829ddabc20c6404b3e2a66b' },
    { key: 'NEXT_PUBLIC_BUSINESS_ID', description: 'Business ID', defaultValue: '682b5d636be45193cf943b85' },
    { key: 'NEXT_PUBLIC_GTM_ID', description: 'Google Tag Manager ID', defaultValue: 'GTM-5NR79L8B' },
    { key: 'NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION', description: 'Facebook verification', defaultValue: '' },
    { key: 'NEXT_PUBLIC_TAG_SERVER', description: 'Tag server URL', defaultValue: '' },
];

export const DeployForm = ({ onSubmit, isSubmitting, disabled = false }: DeployFormProps) => {
    const [formData, setFormData] = useState<DeployFormData>({
        name: 'bikobazaar',
        domain: 'bikobazaar.xyz',
        repo: 'git@github.com-work:shaha-expressitbd/e-megadeal-v2.git',
        env: {},
    });

    const [customVars, setCustomVars] = useState<Array<{ key: string; value: string }>>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handlePredefinedVarChange = (key: string, value: string) => {
        if (disabled) return;
        setFormData((prev) => ({
            ...prev,
            env: { ...prev.env, [key]: value },
        }));
    };

    const handleCustomVarChange = (index: number, key: string, value: string) => {
        if (disabled) return;
        const newCustomVars = [...customVars];
        newCustomVars[index] = { key, value };
        setCustomVars(newCustomVars);
    };

    const addCustomVar = () => {
        if (disabled) return;
        setCustomVars([...customVars, { key: '', value: '' }]);
    };

    const removeCustomVar = (index: number) => {
        if (disabled) return;
        setCustomVars(customVars.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (disabled) return;

        const allEnvVars = {
            ...formData.env,
            ...customVars.reduce((acc, { key, value }) => {
                if (key && value) acc[key] = value;
                return acc;
            }, {} as Record<string, string>),
        };

        onSubmit({
            ...formData,
            env: allEnvVars,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Project Name</label>
                    <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        pattern="[a-zA-Z0-9_\-]+"
                        disabled={disabled}
                        className={`w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Only letters, numbers, hyphens and underscores allowed
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Domain</label>
                    <input
                        type="text"
                        id="domain"
                        value={formData.domain}
                        onChange={handleInputChange}
                        required
                        disabled={disabled}
                        className={`w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Git Repo URL</label>
                    <input
                        type="text"
                        id="repo"
                        value={formData.repo}
                        onChange={handleInputChange}
                        required
                        disabled={disabled}
                        className={`w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium">Environment Variables</label>
                        <div className="text-xs text-gray-500">Predefined variables are highlighted</div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-gray-750 p-3 rounded-lg border border-gray-600">
                            <h3 className="text-xs font-semibold text-blue-400 mb-2">PRE-DEFINED VARIABLES</h3>
                            {predefinedVars.map((env) => (
                                <EnvVarInput
                                    key={env.key}
                                    name={env.key}
                                    description={env.description}
                                    value={formData.env[env.key] ?? env.defaultValue}
                                    onChange={(value) => handlePredefinedVarChange(env.key, value)}
                                    readOnlyKey

                                />
                            ))}
                        </div>

                        <div className="bg-gray-750 p-3 rounded-lg border border-gray-600">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs font-semibold text-green-400">CUSTOM VARIABLES</h3>
                                <button
                                    type="button"
                                    onClick={addCustomVar}
                                    disabled={disabled}
                                    className={`flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-xs rounded ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M8.75 4.25v1.5h1.5v1h-1.5v1.5h-1v-1.5H6.25v-1H7.75V4.25h1z" />
                                    </svg>
                                    Add Custom
                                </button>
                            </div>
                            {customVars.map((varItem, index) => (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                    <EnvVarInput
                                        value={varItem.key}
                                        onChange={(value) => handleCustomVarChange(index, value, varItem.value)}
                                        placeholder="VARIABLE_NAME"
                                    />
                                    <EnvVarInput
                                        value={varItem.value}
                                        onChange={(value) => handleCustomVarChange(index, varItem.key, value)}
                                        placeholder="VALUE"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeCustomVar(index)}
                                        disabled={disabled}
                                        className={`p-1 text-red-400 hover:text-red-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                            <path d="M8 1.5C4.41015 1.5 1.5 4.41015 1.5 8s2.91015 6.5 6.5 6.5 6.5-2.91015 6.5-6.5S11.5899 1.5 8 1.5zM8 0C12.4183 0 16 3.58172 16 8s-3.5817 8-8 8-8-3.58172-8-8 3.5817-8 8-8z" />
                                            <path d="M5 7.25h6v1.5h-6z" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
                <button
                    type="submit"
                    disabled={isSubmitting || disabled}
                    className={`w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-center items-center gap-2 ${isSubmitting || disabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    {isSubmitting ? (
                        <>
                            <span>Deploying...</span>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        </>
                    ) : (
                        <span>Deploy Now</span>
                    )}
                </button>
            </div>
        </form>
    );
};