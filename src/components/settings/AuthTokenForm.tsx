import { useState } from 'react';
import { getAuthToken, setAuthToken } from '@/lib/auth';

export function AuthTokenForm() {
    const [token, setToken] = useState(getAuthToken());
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setAuthToken(token.trim());
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">API Token</h2>
            <p className="text-sm text-gray-500 mb-6">
                Sent as a bearer token with every API request. Stored locally in your browser.
            </p>

            <div className="flex items-center gap-2">
                <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter API token"
                    autoComplete="off"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
                >
                    Save
                </button>
            </div>
            {saved && <span className="inline-block mt-3 text-sm text-green-600">Saved!</span>}
        </div>
    );
}
