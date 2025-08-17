import { useState } from 'react';

export type DockerTagServerFormData = {
    action: 'run' | 'list' | 'delete';
    subdomain?: string;
    config?: string;
    name?: string;
    containerName?: string;
    all?: boolean;
};

interface DockerTagServerFormProps {
    onSubmit: (data: DockerTagServerFormData) => void;
    isSubmitting: boolean;
    disabled?: boolean;
}

export const DockerTagServerForm = ({ onSubmit, isSubmitting, disabled = false }: DockerTagServerFormProps) => {
    const [formData, setFormData] = useState<DockerTagServerFormData>({
        action: 'run',
        subdomain: '',
        config: '',
        name: 'gtm-unified',
        containerName: '',
        all: false,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (disabled) return;
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const { id, checked } = e.target;
        setFormData((prev) => ({ ...prev, [id]: checked }));
    };

    const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (disabled) return;
        const value = e.target.value as DockerTagServerFormData['action'];
        setFormData((prev) => ({
            action: value,
            subdomain: value === 'run' ? prev.subdomain || '' : '',
            config: value === 'run' ? prev.config || '' : '',
            name: value === 'run' ? prev.name || 'gtm-unified' : 'gtm-unified',
            containerName: value === 'delete' ? prev.containerName || '' : '',
            all: value === 'delete' ? prev.all || false : false,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (disabled) return;

        const submitData: Partial<DockerTagServerFormData> = { action: formData.action };

        if (formData.action === 'run') {
            submitData.subdomain = formData.subdomain;
            submitData.config = formData.config;
            submitData.name = formData.name;
        } else if (formData.action === 'delete') {
            if (formData.all) {
                submitData.all = true;
            } else if (formData.containerName) {
                submitData.containerName = formData.containerName;
            }
        }

        // Remove undefined values
        const cleanedData = Object.fromEntries(
            Object.entries(submitData).filter(([_, v]) => v !== undefined && v !== '')
        ) as DockerTagServerFormData;

        onSubmit(cleanedData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 gap-6">
                {/* Action Selector */}
                <div>
                    <label htmlFor="action" className="block text-sm font-medium mb-1">Action</label>
                    <select
                        id="action"
                        value={formData.action}
                        onChange={handleActionChange}
                        disabled={disabled}
                        className={`w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <option value="run">Run Container</option>
                        <option value="list">List Containers</option>
                        <option value="delete">Delete Container(s)</option>
                    </select>
                </div>

                {/* Run-specific fields */}
                {formData.action === 'run' && (
                    <>
                        <div>
                            <label htmlFor="subdomain" className="block text-sm font-medium mb-1">Subdomain</label>
                            <input
                                type="text"
                                id="subdomain"
                                value={formData.subdomain || ''}
                                onChange={handleInputChange}
                                required
                                disabled={disabled}
                                placeholder="server.example.com"
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                The subdomain where the tag server will be accessible (e.g., server.yourdomain.com)
                            </p>
                        </div>

                        <div>
                            <label htmlFor="config" className="block text-sm font-medium mb-1">Container Config</label>
                            <input
                                type="text"
                                id="config"
                                value={formData.config || ''}
                                onChange={handleInputChange}
                                required
                                disabled={disabled}
                                placeholder="aWQ9R1RN..."
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Base64-encoded config (e.g., <code>id=...&env=...&auth=...</code>)
                            </p>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1">Container Name Prefix</label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name || ''}
                                onChange={handleInputChange}
                                required
                                disabled={disabled}
                                placeholder="gtm-unified"
                                pattern="^[a-zA-Z0-9_-]+$"
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Only letters, numbers, hyphens and underscores allowed.
                            </p>
                        </div>
                    </>
                )}

                {/* Delete-specific fields */}
                {formData.action === 'delete' && (
                    <>
                        <div>
                            <label htmlFor="containerName" className="block text-sm font-medium mb-1">Container Name (Optional)</label>
                            <input
                                type="text"
                                id="containerName"
                                value={formData.containerName || ''}
                                onChange={handleInputChange}
                                disabled={disabled || formData.all}
                                placeholder="gtm-unified-tags_bikobazaar_xyz-12001"
                                className={`w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${disabled || formData.all ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Specify a container name to delete, or check "All" below to delete all containers
                            </p>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="all"
                                checked={formData.all || false}
                                onChange={handleCheckboxChange}
                                disabled={disabled}
                                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                            />
                            <label htmlFor="all" className="ml-2 text-sm font-medium">
                                Delete all containers
                            </label>
                        </div>
                    </>
                )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-700">
                <button
                    type="submit"
                    disabled={isSubmitting || disabled}
                    className={`w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-center items-center gap-2 ${isSubmitting || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isSubmitting ? (
                        <>
                            <span>Processing...</span>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </>
                    ) : (
                        <span>
                            {formData.action === 'run' && '🚀 Run Container'}
                            {formData.action === 'list' && '📋 List Containers'}
                            {formData.action === 'delete' && '🗑️ Delete Container(s)'}
                        </span>
                    )}
                </button>
            </div>
        </form>
    );
};