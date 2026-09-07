import React from 'react';
import { Check, Plus, Sparkles, Award, ShieldCheck, Dumbbell, BookOpen, Briefcase, User, Wallet, HeartPulse, Clock, Flame } from 'lucide-react';
import { Goal, DayCompletion } from '../types';

interface DailyGoalsListProps {
  selectedDate: string; // YYYY-MM-DD
  goals: Goal[];
  completions: DayCompletion[];
  onToggleGoal: (goalId: string) => void;
  onOpenAddGoal: () => void;
  onOpenEditGoal: (goal: Goal) => void;
  onNavigateToRewards: () => void;
}

export const DailyGoalsList: React.FC<DailyGoalsListProps> = ({
  selectedDate,
  goals,
  completions,
  onToggleGoal,
  onOpenAddGoal,
  onOpenEditGoal,
  onNavigateToRewards,
}) => {
  const dateObj = new Date(selectedDate + 'T12:00:00');
  const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 1 is Monday...

  const dayNames = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const formattedDateTitle = `${dayNames[dayOfWeek]}, ${dateObj.getDate()} de ${monthNames[dateObj.getMonth()]}`;

  // Filter goals active for this weekday
  const activeDayGoals = goals.filter(
    (g) => g.active && (!g.daysOfWeek || g.daysOfWeek.includes(dayOfWeek as any))
  );

  // Completions for this day
  const dayCompletions = completions.filter((c) => c.date === selectedDate);
  const completedGoalIds = new Set(dayCompletions.map((c) => c.goalId));

  const completedCount = dayCompletions.length;
  const totalCount = activeDayGoals.length;
  const isAllCompleted = totalCount > 0 && completedCount >= totalCount;
  const percentCompleted = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalPointsEarnedToday = dayCompletions.reduce((sum, c) => sum + (c.pointsEarned || 0), 0);
  const potentialTotalPoints = activeDayGoals.reduce((sum, g) => sum + (g.points || 0), 0);

  // Streak-specific goal for this day
  const streakGoalForDay = activeDayGoals.find((g) => g.countsForStreak);
  const isStreakGoalCompleted = streakGoalForDay ? completedGoalIds.has(streakGoalForDay.id) : false;

  // Category helpers
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

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-xs">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-stone-900">
              {formattedDateTitle}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 mt-1">
            {completedCount} de {totalCount} concluídos ({percentCompleted}%) • <strong className="text-amber-700">+{totalPointsEarnedToday} pontos</strong> ganhos hoje de {potentialTotalPoints} possíveis
          </p>
        </div>

        <button
          onClick={onOpenAddGoal}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-stone-900 hover:bg-stone-800 text-white transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Novo Objetivo
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isAllCompleted ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${percentCompleted}%` }}
          />
        </div>
      </div>

      {/* Streak-Specific Goal Callout */}
      {streakGoalForDay && (
        <div className={`mt-3.5 p-3 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
          isStreakGoalCompleted
            ? 'bg-orange-50/70 border-orange-300 text-orange-950'
            : 'bg-stone-50 border-orange-200 text-stone-900'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isStreakGoalCompleted ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700'
            }`}>
              <Flame className={`w-4 h-4 ${isStreakGoalCompleted ? 'fill-white' : 'fill-orange-500'}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-800">
                  Meta Principal do Streak:
                </span>
                <span className="text-xs font-bold text-stone-900 truncate">
                  "{streakGoalForDay.title}"
                </span>
              </div>
              <p className="text-[11px] text-stone-600 mt-0.5">
                {isStreakGoalCompleted
                  ? '🔥 Sequência garantida para esta data! As outras metas contam como extras valendo pontos.'
                  : '⚡ Esta é a única atividade que conta para manter seu streak. Conclua-a para não quebrar a sequência!'}
              </p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-md shrink-0 self-start sm:self-auto ${
            isStreakGoalCompleted
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-amber-100 text-amber-900 border border-amber-200'
          }`}>
            {isStreakGoalCompleted ? 'Streak Garantido ✓' : 'Pendente para Streak'}
          </span>
        </div>
      )}

      {/* Real-World Release Banner When Today's Goals are met */}
      {isAllCompleted && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                Liberação Conquistada! Metas do Dia 100% Cumpridas
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Você bateu todos os objetivos do dia! Suas recompensas da vida real estão liberadas para resgate.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToRewards}
            className="px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors shrink-0 whitespace-nowrap"
          >
            Ver Recompensas Liberadas →
          </button>
        </div>
      )}

      {/* Goals Checklist Container */}
      <div className="mt-5 space-y-3">
        {activeDayGoals.length === 0 ? (
          <div className="text-center py-10 px-4 border-2 border-dashed border-stone-200 rounded-xl">
            <Clock className="w-10 h-10 mx-auto text-stone-600 mb-2" />
            <h4 className="text-sm font-semibold text-stone-800">
              Nenhum objetivo agendado para este dia da semana
            </h4>
            <p className="text-xs text-stone-700 mt-1 max-w-md mx-auto">
              Cadastre objetivos que se repetem neste dia para pontuar e liberar suas recompensas.
            </p>
            <button
              onClick={onOpenAddGoal}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Objetivo
            </button>
          </div>
        ) : (
          activeDayGoals.map((goal) => {
            const isCompleted = completedGoalIds.has(goal.id);
            const catInfo = getCategoryInfo(goal.category);
            const CatIcon = catInfo.icon;

            return (
              <div
                key={goal.id}
                className={`flex items-start sm:items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all duration-200 ${
                  isCompleted
                    ? 'bg-stone-50/70 border-emerald-300 text-stone-700'
                    : 'bg-white border-stone-200 hover:border-amber-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0 mr-3">
                  
                  {/* Interactive Checkbox */}
                  <button
                    id={`goal-checkbox-${goal.id}`}
                    onClick={() => onToggleGoal(goal.id)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'border-2 border-stone-300 hover:border-amber-500 bg-white'
                    }`}
                    aria-label={`Marcar ${goal.title}`}
                  >
                    {isCompleted && <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />}
                  </button>

                  {/* Title, description, tags */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm sm:text-base font-semibold leading-snug cursor-pointer ${
                          isCompleted
                            ? 'line-through text-stone-600'
                            : 'text-stone-900'
                        }`}
                        onClick={() => onToggleGoal(goal.id)}
                      >
                        {goal.title}
                      </span>

                      {/* Streak Tag vs Extra Tag */}
                      {goal.countsForStreak ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-300 shadow-2xs">
                          <Flame className="w-3 h-3 text-orange-600 fill-orange-600" />
                          Meta do Streak
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded-md border border-stone-200">
                          Extra
                        </span>
                      )}

                      {/* Category Badge */}
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${catInfo.bg}`}>
                        <CatIcon className="w-3 h-3" />
                        {catInfo.label}
                      </span>
                    </div>

                    {goal.description && (
                      <p className="text-xs text-stone-700 mt-0.5 line-clamp-1">
                        {goal.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Points Badge & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1 transition-colors ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100/80 text-amber-900 border border-amber-200'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>+{goal.points} pts</span>
                  </div>

                  <button
                    onClick={() => onOpenEditGoal(goal)}
                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors text-xs"
                    title="Editar objetivo"
                  >
                    Editar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
