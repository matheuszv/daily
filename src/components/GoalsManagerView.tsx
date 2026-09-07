import React, { useState } from 'react';
import { Plus, Edit3, Trash2, CheckCircle2, Dumbbell, BookOpen, Briefcase, User, Wallet, HeartPulse, Flame } from 'lucide-react';
import { Goal, WeekDay } from '../types';

interface GoalsManagerViewProps {
  goals: Goal[];
  onOpenAddGoal: () => void;
  onOpenEditGoal: (goal: Goal) => void;
  onToggleActive: (id: string, currentActive: boolean) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
  onSetStreakGoal?: (id: string) => Promise<void>;
}

export const GoalsManagerView: React.FC<GoalsManagerViewProps> = ({
  goals,
  onOpenAddGoal,
  onOpenEditGoal,
  onToggleActive,
  onDeleteGoal,
  onSetStreakGoal,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [updatingStreakId, setUpdatingStreakId] = useState<string | null>(null);

  const filteredGoals = goals.filter((g) => {
    if (categoryFilter === 'all') return true;
    return g.category === categoryFilter;
  });

  const streakGoal = goals.find((g) => g.countsForStreak);

  const handleMakeStreakGoal = async (id: string) => {
    if (!onSetStreakGoal) return;
    try {
      setUpdatingStreakId(id);
      await onSetStreakGoal(id);
    } finally {
      setUpdatingStreakId(null);
    }
  };

  const getCategoryInfo = (cat: string) => {
    switch (cat) {
      case 'saude':
        return { label: 'Saúde', icon: HeartPulse, bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'fitness':
        return { label: 'Treino', icon: Dumbbell, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'estudos':
        return { label: 'Estudos', icon: BookOpen, bg: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'trabalho':
        return { label: 'Trabalho', icon: Briefcase, bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'financas':
        return { label: 'Finanças', icon: Wallet, bg: 'bg-teal-50 text-teal-700 border-teal-200' };
      default:
        return { label: 'Pessoal', icon: User, bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
  };

  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            Cadastrar e Gerenciar Objetivos
          </h2>
          <p className="text-xs sm:text-sm text-stone-700 mt-1 max-w-xl">
            Cada objetivo cadastrado tem pontuações próprias. Você escolhe qual é a <strong>meta principal do streak</strong> e quais são as <strong>atividades extras</strong>.
          </p>
        </div>

        <button
          onClick={onOpenAddGoal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Novo Objetivo
        </button>
      </div>

      {/* Streak Rule Callout */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50/90 via-amber-50/80 to-stone-50 border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              Regra da Sequência (Streak): Apenas 1 Meta Conta para o Streak!
            </h4>
            <p className="text-xs text-stone-700 mt-0.5 leading-relaxed">
              Meta principal selecionada atual: <strong className="text-orange-900 font-bold">{streakGoal ? `"${streakGoal.title}"` : 'Nenhuma selecionada ainda'}</strong>. As outras metas são extras e garantem pontos para liberar suas compras!
            </p>
          </div>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        {['all', 'saude', 'fitness', 'estudos', 'trabalho', 'financas', 'pessoal'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap capitalize ${
              categoryFilter === cat
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {cat === 'all' ? 'Todos os Objetivos' : cat}
          </button>
        ))}
      </div>

      {/* Goals Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGoals.map((goal) => {
          const catInfo = getCategoryInfo(goal.category);
          const CatIcon = catInfo.icon;
          const isStreak = Boolean(goal.countsForStreak);

          return (
            <div
              key={goal.id}
              className={`p-5 rounded-2xl border bg-white transition-all ${
                isStreak
                  ? 'border-orange-300 ring-2 ring-orange-200/60 shadow-xs'
                  : goal.active
                  ? 'border-stone-200 shadow-xs'
                  : 'border-stone-200 opacity-60 bg-stone-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {isStreak ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-300 shadow-xs">
                        <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-600" />
                        Meta Principal do Streak 🔥
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                        Atividade Extra
                      </span>
                    )}

                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${catInfo.bg}`}>
                      <CatIcon className="w-3 h-3" />
                      {catInfo.label}
                    </span>

                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      +{goal.points} pontos
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900">
                    {goal.title}
                  </h3>

                  {goal.description && (
                    <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                      {goal.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onOpenEditGoal(goal)}
                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                    title="Editar objetivo"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-1.5 text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Excluir objetivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick action to make this the streak goal */}
              {!isStreak && onSetStreakGoal && (
                <div className="mt-3 pt-2">
                  <button
                    onClick={() => handleMakeStreakGoal(goal.id)}
                    disabled={updatingStreakId === goal.id}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-800 hover:text-orange-950 bg-orange-50 hover:bg-orange-100/80 px-2.5 py-1 rounded-lg border border-orange-200 transition-colors"
                  >
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    {updatingStreakId === goal.id ? 'Atualizando...' : 'Definir como Meta do Streak'}
                  </button>
                </div>
              )}

              {/* Days of week pill indicators */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                    const isIncluded = goal.daysOfWeek?.includes(d as WeekDay);
                    return (
                      <span
                        key={d}
                        className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center ${
                          isIncluded
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                        title={`${dayLabels[d]}: ${isIncluded ? 'Ativo' : 'Não agendado'}`}
                      >
                        {dayLabels[d].slice(0, 1)}
                      </span>
                    );
                  })}
                </div>

                <button
                  onClick={() => onToggleActive(goal.id, goal.active)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                    goal.active
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                      : 'text-stone-700 bg-stone-100 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  {goal.active ? 'Ativo' : 'Pausado'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
