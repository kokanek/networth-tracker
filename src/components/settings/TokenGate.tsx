import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function TokenGate() {
    const setToken = useAuthStore((s) => s.setToken);
    const [value, setValue] = useState('');

    const handleSave = () => {
        const trimmed = value.trim();
        if (!trimmed) return;
        setToken(trimmed);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 p-8">
                <h1 className="text-lg font-semibold text-gray-900 mb-1">Net Worth Tracker</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Enter your API token to continue. It is stored locally in your browser and sent as a bearer
                    token with every request.
                </p>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSave();
                    }}
                    className="flex flex-col gap-3"
                >
                    <input
                        type="password"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Enter API token"
                        autoComplete="off"
                        autoFocus
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={!value.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
}
