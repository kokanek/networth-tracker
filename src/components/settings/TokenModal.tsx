import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function TokenModal({ onClose }: { onClose: () => void }) {
    const { token, setToken } = useAuthStore();
    const [value, setValue] = useState(token);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setToken(value.trim());
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md bg-white rounded-xl border border-gray-200 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-1">
                    <h2 className="text-lg font-semibold text-gray-900">API Token</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                    >
                        ×
                    </button>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                    Sent as a bearer token with every API request. Stored locally in your browser.
                </p>

                <div className="flex items-center gap-2">
                    <input
                        type="password"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
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
        </div>
    );
}
