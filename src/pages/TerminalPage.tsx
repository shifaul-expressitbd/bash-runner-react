import { useSearchParams } from 'react-router-dom';
import { Terminal } from '../components/Terminal';

export const TerminalPage = () => {
    const [searchParams] = useSearchParams();
    const commandId = searchParams.get('command');
    const argsParam = searchParams.get('args');
    const args = argsParam ? JSON.parse(decodeURIComponent(argsParam)) : undefined;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
            <div className="max-w-4xl mx-auto h-[80vh]">
                <Terminal commandId={commandId || undefined} args={args} />
            </div>
        </div>
    );
};