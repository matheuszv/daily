import React from 'react';
import { Sparkles, Flame, Coins, Database, Calendar, Gift, ListTodo, BarChart3 } from 'lucide-react';
import { DatabaseStatus, UserStats } from '../types';

interface HeaderProps {
  activeTab: 'calendar' | 'rewards' | 'goals' | 'stats';
  setActiveTab: (tab: 'calendar' | 'rewards' | 'goals' | 'stats') => void;
  stats: UserStats | null;
  dbStatus: DatabaseStatus | null;
  onOpenMongoModal: () => void;
  unlockedRewardsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  stats,
  dbStatus,
  onOpenMongoModal,
  unlockedRewardsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur-sm shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0 font-bold text-lg">
              <Sparkles className="w-5 h-5 text-amber-100" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-stone-900 tracking-tight leading-tight truncate">
                Metas & Recompensas
              </h1>
              <p className="text-xs text-stone-700 truncate hidden sm:block">
                Cumpra objetivos diários e libere compras na vida real
              </p>
            </div>
          </div>

          {/* Gamification Badges (Points & Streak) */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* Streak Badge */}
            <div
              id="header-streak-badge"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs sm:text-sm font-semibold"
              title={stats?.streakGoalTitle ? `Sequência mantida pela meta: "${stats.streakGoalTitle}"` : "Sequência diária"}
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>{stats ? stats.currentStreak : 0} dias</span>
              {stats?.isStreakMaintainedToday && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Streak de hoje garantido!" />
              )}
            </div>

            {/* Points Balance Badge */}
            <div
              id="header-points-badge"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-sm font-bold shadow-xs"
              title="Saldo atual de pontos para liberar compras"
            >
              <Coins className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>{stats ? stats.currentBalance : 0} <span className="text-xs font-normal text-amber-700">pts</span></span>
            </div>

            {/* MongoDB Connection Status Pill */}
            <button
              id="header-db-status-btn"
              onClick={onOpenMongoModal}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                dbStatus?.connected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
              }`}
              title="Clique para ver o status da conexão MongoDB"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {dbStatus?.connected ? 'MongoDB Conectado' : 'Modo Local (MongoDB)'}
              </span>
              <span className="md:hidden">
                {dbStatus?.connected ? 'Mongo' : 'Local'}
              </span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 border-t border-stone-100 py-1 overflow-x-auto no-scrollbar">
          <button
            id="tab-calendar"
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-stone-900 text-white'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendário & Metas do Dia
          </button>

          <button
            id="tab-rewards"
            onClick={() => setActiveTab('rewards')}
            className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'rewards'
                ? 'bg-stone-900 text-white'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Gift className="w-4 h-4" />
            Recompensas da Vida Real
            {unlockedRewardsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-white animate-pulse">
                {unlockedRewardsCount}
              </span>
            )}
          </button>

          <button
            id="tab-goals"
            onClick={() => setActiveTab('goals')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'goals'
                ? 'bg-stone-900 text-white'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            Cadastrar / Gerenciar Objetivos
          </button>

          <button
            id="tab-stats"
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'stats'
                ? 'bg-stone-900 text-white'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Histórico & Pontos
          </button>
        </div>

      </div>
    </header>
  );
};
