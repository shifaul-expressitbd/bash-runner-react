import { useSearchParams } from "react-router";
import { Terminal } from '../components/Terminal';

export const TerminalPage = () => {
    const [searchParams] = useSearchParams();
    const commandId = searchParams.get('command');
    const args = searchParams.get('args');

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
            <div className="max-w-4xl mx-auto h-[80vh]">
                <Terminal
                    commandId={commandId || undefined}
                    args={args ? JSON.parse(decodeURIComponent(args)) : undefined}
                />
            </div>
        </div>
    );
};