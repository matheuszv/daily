import React, { useState, useEffect } from 'react';
import { X, Award, Trash2, Flame } from 'lucide-react';
import { Goal, WeekDay } from '../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: Partial<Goal>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  editingGoal: Goal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingGoal,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Goal['category']>('saude');
  const [points, setPoints] = useState<number>(30);
  const [daysOfWeek, setDaysOfWeek] = useState<WeekDay[]>([1, 2, 3, 4, 5]);
  const [countsForStreak, setCountsForStreak] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setDescription(editingGoal.description || '');
      setCategory(editingGoal.category);
      setPoints(editingGoal.points);
      setDaysOfWeek(editingGoal.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]);
      setCountsForStreak(Boolean(editingGoal.countsForStreak));
    } else {
      setTitle('');
      setDescription('');
      setCategory('saude');
      setPoints(30);
      setDaysOfWeek([1, 2, 3, 4, 5]);
      setCountsForStreak(false);
    }
  }, [editingGoal, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (day: WeekDay) => {
    if (daysOfWeek.includes(day)) {
      if (daysOfWeek.length === 1) return; // keep at least 1 day
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort());
    }
  };

  const handleQuickDays = (type: 'all' | 'weekdays' | 'weekend') => {
    if (type === 'all') setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
    if (type === 'weekdays') setDaysOfWeek([1, 2, 3, 4, 5]);
    if (type === 'weekend') setDaysOfWeek([0, 6]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      await onSave({
        title: title.trim(),
        description: description.trim(),
        category,
        points: Number(points) || 10,
        daysOfWeek,
        countsForStreak,
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar objetivo');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingGoal || !onDelete) return;
    if (window.confirm('Tem certeza que deseja remover este objetivo?')) {
      try {
        setLoading(true);
        await onDelete(editingGoal.id);
        onClose();
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir');
      } finally {
        setLoading(false);
      }
    }
  };

  const dayLabels: { day: WeekDay; label: string }[] = [
    { day: 1, label: 'Seg' },
    { day: 2, label: 'Ter' },
    { day: 3, label: 'Qua' },
    { day: 4, label: 'Qui' },
    { day: 5, label: 'Sex' },
    { day: 6, label: 'Sáb' },
    { day: 0, label: 'Dom' },
  ];

  const pointPresets = [10, 20, 30, 40, 50, 80, 100];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              {editingGoal ? 'Editar Objetivo' : 'Cadastrar Novo Objetivo'}
            </h3>
            <p className="text-xs text-stone-700">
              Defina a meta, dias em que se repete e quantos pontos ela concede.
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
              Título do Objetivo *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Treino de Academia 45min, Estudar 1h, Beber 2L água"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Descrição / Detalhes (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dicas ou detalhes de como cumprir..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
            />
          </div>

          {/* Category & Points in two columns */}
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
                <option value="saude">Saúde & Bem-Estar</option>
                <option value="fitness">Treino & Esportes</option>
                <option value="estudos">Estudos & Aprendizado</option>
                <option value="trabalho">Trabalho & Foco</option>
                <option value="financas">Finanças Pessoais</option>
                <option value="pessoal">Hábito Pessoal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Pontos Concedidos *</span>
                <span className="text-amber-700 font-extrabold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  {points} pts
                </span>
              </label>
              <input
                type="number"
                min={5}
                max={500}
                required
                value={points}
                onChange={(e) => setPoints(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>

          {/* Quick points presets */}
          <div>
            <span className="text-[11px] text-stone-700 font-medium block mb-1.5">
              Atalhos de pontuação (cada meta vale pontos diferentes):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {pointPresets.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPoints(p)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors border ${
                    points === p
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  +{p} pts
                </button>
              ))}
            </div>
          </div>

          {/* Days of week selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Dias da Semana Aplicáveis
              </label>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickDays('all')}
                  className="text-amber-700 hover:underline font-semibold"
                >
                  Todos
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleQuickDays('weekdays')}
                  className="text-amber-700 hover:underline font-semibold"
                >
                  Seg-Sex
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleQuickDays('weekend')}
                  className="text-amber-700 hover:underline font-semibold"
                >
                  Fim de Semana
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {dayLabels.map(({ day, label }) => {
                const isSelected = daysOfWeek.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Streak Activity Designation */}
          <div className={`p-4 rounded-2xl border transition-all ${
            countsForStreak
              ? 'bg-orange-50/80 border-orange-300 ring-2 ring-orange-400/20'
              : 'bg-stone-50 border-stone-200 hover:bg-stone-100/70'
          }`}>
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                id="countsForStreak"
                checked={countsForStreak}
                onChange={(e) => setCountsForStreak(e.target.checked)}
                className="mt-1 w-4 h-4 text-orange-600 rounded-sm focus:ring-orange-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-900 text-sm">
                  <Flame className={`w-4 h-4 ${countsForStreak ? 'text-orange-500 fill-orange-500' : 'text-stone-400'}`} />
                  <span>Meta Principal do Streak (Sequência de Dias)</span>
                  {countsForStreak && (
                    <span className="text-[10px] uppercase font-black tracking-wider bg-orange-600 text-white px-2 py-0.5 rounded-full">
                      Ativa
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Quando marcada, <strong>somente esta atividade específica</strong> contará para manter ou avançar a sequência diária (streak). Todas as demais atividades continuarão existindo normalmente como extras valendo pontos!
                </p>
              </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
            {editingGoal && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Excluir este objetivo"
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
                {loading ? 'Salvando...' : editingGoal ? 'Salvar Alterações' : 'Criar Objetivo'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
