import React, { useState, useEffect } from 'react';
import { X, Coins, Trash2 } from 'lucide-react';
import { Reward } from '../types';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rewardData: Partial<Reward>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  editingReward: Reward | null;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingReward,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Reward['category']>('lazer');
  const [costPoints, setCostPoints] = useState<number>(200);
  const [estimatedValueBrl, setEstimatedValueBrl] = useState<string>('');
  const [requiresAllDailyGoals, setRequiresAllDailyGoals] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingReward) {
      setTitle(editingReward.title);
      setDescription(editingReward.description || '');
      setCategory(editingReward.category);
      setCostPoints(editingReward.costPoints);
      setEstimatedValueBrl(editingReward.estimatedValueBrl ? String(editingReward.estimatedValueBrl) : '');
      setRequiresAllDailyGoals(Boolean(editingReward.requiresAllDailyGoals));
    } else {
      setTitle('');
      setDescription('');
      setCategory('lazer');
      setCostPoints(200);
      setEstimatedValueBrl('');
      setRequiresAllDailyGoals(false);
    }
  }, [editingReward, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      await onSave({
        title: title.trim(),
        description: description.trim(),
        category,
        costPoints: Number(costPoints) || 50,
        estimatedValueBrl: estimatedValueBrl ? Number(estimatedValueBrl) : undefined,
        requiresAllDailyGoals,
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar recompensa');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingReward || !onDelete) return;
    if (window.confirm('Tem certeza que deseja excluir esta recompensa?')) {
      try {
        setLoading(true);
        await onDelete(editingReward.id);
        onClose();
      } catch (err: any) {
        alert(err.message || 'Erro ao remover');
      } finally {
        setLoading(false);
      }
    }
  };

  const pointPresets = [100, 180, 250, 400, 600, 1000];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              {editingReward ? 'Editar Recompensa' : 'Cadastrar Recompensa da Vida Real'}
            </h3>
            <p className="text-xs text-stone-700">
              Defina o item ou experiência que você deseja comprar ao acumular pontos.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              O que você quer comprar na vida real? *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Jantar de hambúrguer, Livro novo, Tênis, Jogo do Steam"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Motivação / Detalhes (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Por que você quer comprar isso? Qual a comemoração associada?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
            />
          </div>

          {/* Category, Cost and Real Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white"
              >
                <option value="comida">Gastronomia / Comida Especial</option>
                <option value="compras">Compras & Vestuário</option>
                <option value="lazer">Lazer & Entretenimento</option>
                <option value="tecnologia">Tecnologia & Games</option>
                <option value="viagem">Passeio / Viagem</option>
                <option value="outro">Outro Desejo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Preço Real Estimado (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={estimatedValueBrl}
                onChange={(e) => setEstimatedValueBrl(e.target.value)}
                placeholder="Ex: 85.00"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>

          {/* Points Cost */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Custo em Pontos para Liberar *</span>
              <span className="text-amber-700 font-extrabold flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                {costPoints} pts
              </span>
            </label>
            <input
              type="number"
              min={10}
              max={10000}
              required
              value={costPoints}
              onChange={(e) => setCostPoints(Math.max(1, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
            
            <div className="mt-2 flex flex-wrap gap-1.5">
              {pointPresets.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setCostPoints(p)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors border ${
                    costPoints === p
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {p} pts
                </button>
              ))}
            </div>
          </div>

          {/* Checkbox: Requires Daily Goals */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 flex items-start gap-3">
            <input
              type="checkbox"
              id="requiresDailyGoals"
              checked={requiresAllDailyGoals}
              onChange={(e) => setRequiresAllDailyGoals(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-amber-600 rounded-sm focus:ring-amber-500"
            />
            <label htmlFor="requiresDailyGoals" className="text-xs text-stone-800 leading-snug cursor-pointer">
              <strong className="block text-stone-950 font-bold">
                Exigir cumprimento de 100% dos objetivos do dia
              </strong>
              Se marcado, essa compra só será liberada nos dias em que você cumprir todas as metas diárias, além de ter o saldo de pontos!
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
            {editingReward && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Excluir recompensa"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs sm:text-sm font-bold bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-xs transition-colors"
              >
                {loading ? 'Salvando...' : editingReward ? 'Salvar Alterações' : 'Cadastrar Recompensa'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
