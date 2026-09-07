import React, { useState } from 'react';
import { X, Database, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, KeyRound } from 'lucide-react';
import { DatabaseStatus } from '../types';
import { api } from '../services/api';

interface MongoStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: DatabaseStatus | null;
  onRefresh: () => void;
}

export const MongoStatusModal: React.FC<MongoStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefresh,
}) => {
  const [mongoUri, setMongoUri] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mongoUri.trim()) return;

    try {
      setTesting(true);
      setTestResult(null);
      const res = await api.updateMongoUri(mongoUri.trim());
      setTestResult(res);
      onRefresh();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Erro ao tentar conectar',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              status?.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-700'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                Integração MongoDB
              </h3>
              <p className="text-xs text-stone-700">
                Status da conexão e persistência de dados
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Card */}
        <div className="mt-5 p-4 rounded-2xl border bg-stone-50 border-stone-200">
          <div className="flex items-start gap-3">
            {status?.connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            )}

            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
                Status Atual
              </span>
              <p className="text-sm font-bold text-stone-900 mt-0.5">
                {status?.connected ? 'Conectado ao MongoDB Remoto' : 'Operando em Armazenamento Local'}
              </p>
              <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                {status?.message}
              </p>
              {status?.databaseName && (
                <span className="inline-block mt-2 text-[11px] font-mono bg-stone-200/80 px-2 py-0.5 rounded-md text-stone-700">
                  Banco: {status.databaseName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-5 space-y-3 text-xs text-stone-700">
          <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-amber-600" />
            Como conectar ao seu MongoDB Atlas ou Servidor:
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
            <li>Obtenha sua Connection String no <strong>MongoDB Atlas</strong> (ex: <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px]">mongodb+srv://usuario:senha@cluster.mongodb.net/meubanco</code>).</li>
            <li>Configure a variável de ambiente <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px]">MONGODB_URI</code> no arquivo <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px]">.env</code> ou teste diretamente no campo abaixo.</li>
            <li>Enquanto nenhuma URI for fornecida, o app funciona <strong>100% de forma local e automática</strong> para você cadastrar e usar metas sem interrupções!</li>
          </ol>
        </div>

        {/* Live Test Form */}
        <form onSubmit={handleTestConnect} className="mt-5 pt-4 border-t border-stone-100 space-y-3">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
            Testar / Conectar Connection String
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mongoUri}
              onChange={(e) => setMongoUri(e.target.value)}
              placeholder="mongodb+srv://usuario:senha@cluster.mongodb.net/db"
              className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={testing || !mongoUri.trim()}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Conectar'}
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-xs font-medium ${
              testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {testResult.message}
            </div>
          )}
        </form>

        {/* Close */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl transition-colors"
          >
            Entendido / Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
