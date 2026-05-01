import React, { useState, useEffect } from 'react';
import { Settings, X, Globe, Server, CheckCircle2, AlertCircle } from 'lucide-react';
import { OllamaClient } from '../utils/OllamaClient';

export function SettingsModal({ isOpen, onClose, config, onSave }) {
  const [url, setUrl] = useState(config.url);
  const [port, setPort] = useState(config.port);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setStatus(null);
    const client = new OllamaClient(`${url}:${port}`);
    const isOk = await client.testConnection();
    setTesting(false);
    setStatus(isOk ? 'success' : 'error');
  };

  const handleSave = () => {
    onSave({ url, port });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="glass-panel w-full max-w-md p-8 fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-500" />
            Connection Settings
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Server Host
            </label>
            <input
              type="text"
              className="input-field w-full"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2 flex items-center gap-2">
              <Server className="w-4 h-4" /> Port
            </label>
            <input
              type="text"
              className="input-field w-full"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="11434"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleTest}
              disabled={testing}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all font-medium"
            >
              {testing ? 'Testing...' : 'Test Connection'}
              {status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
            </button>
          </div>

          {status === 'error' && (
            <p className="text-xs text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              Connection failed. Ensure Ollama is running and CORS is configured (OLLAMA_ORIGINS="*").
            </p>
          )}

          <button onClick={handleSave} className="btn-primary w-full mt-4">
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
