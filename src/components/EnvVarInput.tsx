interface EnvVarInputProps {
    name?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    description?: string;
    readOnlyKey?: boolean;
    onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}

export const EnvVarInput = ({
    value,
    onChange,
    placeholder = '',
    description,
    readOnlyKey = false,
}: EnvVarInputProps) => {
    return (
        <div className="w-full mb-2">
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    readOnly={readOnlyKey}
                    className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 font-mono text-sm ${readOnlyKey
                        ? 'bg-gray-600 cursor-not-allowed text-blue-400'
                        : 'focus:ring-blue-500'
                        }`}
                />
            </div>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
    );
};