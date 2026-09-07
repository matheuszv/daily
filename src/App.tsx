/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { Goal, DayCompletion, Reward, UserStats, DatabaseStatus } from './types';
import { Header } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { DailyGoalsList } from './components/DailyGoalsList';
import { RewardsStore } from './components/RewardsStore';
import { GoalsManagerView } from './components/GoalsManagerView';
import { StatsDashboard } from './components/StatsDashboard';
import { GoalModal } from './components/GoalModal';
import { RewardModal } from './components/RewardModal';
import { MongoStatusModal } from './components/MongoStatusModal';
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export default function App() {
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [activeTab, setActiveTab] = useState<'calendar' | 'rewards' | 'goals' | 'stats'>('calendar');

  const [goals, setGoals] = useState<Goal[]>([]);
  const [completions, setCompletions] = useState<DayCompletion[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  const [isMongoModalOpen, setIsMongoModalOpen] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [goalsRes, completionsRes, rewardsRes, statsRes, dbRes] = await Promise.all([
        api.getGoals(),
        api.getCompletions(),
        api.getRewards(),
        api.getStats(selectedDate),
        api.getDbStatus().catch(() => ({
          connected: false,
          type: 'local_fallback' as const,
          message: 'Operando localmente',
        })),
      ]);

      setGoals(goalsRes);
      setCompletions(completionsRes);
      setRewards(rewardsRes);
      setStats(statsRes);
      setDbStatus(dbRes);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError('Não foi possível sincronizar com o servidor. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check if today's goals are completely finished
  const todayStr = getTodayStr();
  const todayDateObj = new Date(todayStr + 'T12:00:00');
  const todayDayOfWeek = todayDateObj.getDay();
  const todayGoals = goals.filter(
    (g) => g.active && (!g.daysOfWeek || g.daysOfWeek.includes(todayDayOfWeek as any))
  );
  const todayCompletions = completions.filter((c) => c.date === todayStr);
  const todayCompletedAll = todayGoals.length > 0 && todayCompletions.length >= todayGoals.length;

  // Unlocked rewards counter
  const currentBalance = stats ? stats.currentBalance : 0;
  const unlockedRewardsCount = rewards.filter(
    (r) => r.status !== 'purchased' && currentBalance >= r.costPoints && (!r.requiresAllDailyGoals || todayCompletedAll)
  ).length;

  // Handlers
  const handleToggleGoal = async (goalId: string) => {
    try {
      const targetGoal = goals.find((g) => g.id === goalId);
      const isAlreadyCompleted = completions.some((c) => c.goalId === goalId && c.date === selectedDate);

      // Optimistic update
      if (isAlreadyCompleted) {
        setCompletions((prev) => prev.filter((c) => !(c.goalId === goalId && c.date === selectedDate)));
      } else {
        const dummyComp: DayCompletion = {
          id: 'temp_' + Date.now(),
          goalId,
          date: selectedDate,
          completedAt: new Date().toISOString(),
          pointsEarned: targetGoal?.points || 0,
        };
        setCompletions((prev) => [...prev, dummyComp]);

        // Celebration Toast
        if (targetGoal) {
          setCelebrationMessage(`+${targetGoal.points} pontos conquistados! 🎯`);
          setTimeout(() => setCelebrationMessage(null), 3000);
        }
      }

      await api.toggleCompletion(goalId, selectedDate);
      
      // Refresh stats in background
      const updatedStats = await api.getStats(selectedDate);
      setStats(updatedStats);
    } catch (err: any) {
      alert('Erro ao atualizar meta: ' + err.message);
      loadData();
    }
  };

  const handleSaveGoal = async (goalData: Partial<Goal>) => {
    if (editingGoal) {
      await api.updateGoal(editingGoal.id, goalData);
    } else {
      await api.createGoal(goalData as any);
    }
    await loadData();
  };

  const handleDeleteGoal = async (id: string) => {
    await api.deleteGoal(id);
    await loadData();
  };

  const handleToggleGoalActive = async (id: string, currentActive: boolean) => {
    await api.updateGoal(id, { active: !currentActive });
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, active: !currentActive } : g)));
  };

  const handleSetStreakGoal = async (id: string) => {
    try {
      await api.setStreakGoal(id);
      const targetGoal = goals.find((g) => g.id === id);
      if (targetGoal) {
        setCelebrationMessage(`"${targetGoal.title}" definida como a meta do Streak! 🔥`);
        setTimeout(() => setCelebrationMessage(null), 3000);
      }
      await loadData();
    } catch (err: any) {
      alert('Erro ao definir meta de streak: ' + err.message);
    }
  };

  const handleSaveReward = async (rewardData: Partial<Reward>) => {
    if (editingReward) {
      await api.updateReward(editingReward.id, rewardData);
    } else {
      await api.createReward(rewardData as any);
    }
    await loadData();
  };

  const handlePurchaseReward = async (rewardId: string) => {
    const res = await api.markAsPurchased(rewardId);
    if (res.success) {
      setCelebrationMessage(`Compra realizada com sucesso! Parabéns pela conquista! 🛍️`);
      setTimeout(() => setCelebrationMessage(null), 4000);
    }
    await loadData();
  };

  const handleDeleteReward = async (rewardId: string) => {
    if (window.confirm('Tem certeza que deseja remover esta recompensa?')) {
      await api.deleteReward(rewardId);
      await loadData();
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col selection:bg-amber-200">
      
      {/* Toast Celebration Message */}
      {celebrationMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-amber-400/40 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-semibold">{celebrationMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        dbStatus={dbStatus}
        onOpenMongoModal={() => setIsMongoModalOpen(true)}
        unlockedRewardsCount={unlockedRewardsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadData()}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-200 hover:bg-rose-300 transition-colors shrink-0"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {loading && !goals.length ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
            <p className="text-xs sm:text-sm font-medium text-stone-600">
              Carregando calendário e recompensas...
            </p>
          </div>
        ) : (
          <div>
            {/* TAB 1: CALENDAR & DAILY CHECKLIST */}
            {activeTab === 'calendar' && (
              <div className="space-y-6">
                <CalendarView
                  selectedDate={selectedDate}
                  onSelectDate={(date) => setSelectedDate(date)}
                  goals={goals}
                  completions={completions}
                />

                <DailyGoalsList
                  selectedDate={selectedDate}
                  goals={goals}
                  completions={completions}
                  onToggleGoal={handleToggleGoal}
                  onOpenAddGoal={() => {
                    setEditingGoal(null);
                    setIsGoalModalOpen(true);
                  }}
                  onOpenEditGoal={(goal) => {
                    setEditingGoal(goal);
                    setIsGoalModalOpen(true);
                  }}
                  onNavigateToRewards={() => setActiveTab('rewards')}
                />
              </div>
            )}

            {/* TAB 2: REWARDS STORE (COMPRAS NA VIDA REAL) */}
            {activeTab === 'rewards' && (
              <RewardsStore
                rewards={rewards}
                stats={stats}
                todayCompletedAll={todayCompletedAll}
                onPurchaseReward={handlePurchaseReward}
                onOpenAddReward={() => {
                  setEditingReward(null);
                  setIsRewardModalOpen(true);
                }}
                onOpenEditReward={(reward) => {
                  setEditingReward(reward);
                  setIsRewardModalOpen(true);
                }}
                onDeleteReward={handleDeleteReward}
              />
            )}

            {/* TAB 3: GOAL MANAGEMENT */}
            {activeTab === 'goals' && (
              <GoalsManagerView
                goals={goals}
                onOpenAddGoal={() => {
                  setEditingGoal(null);
                  setIsGoalModalOpen(true);
                }}
                onOpenEditGoal={(goal) => {
                  setEditingGoal(goal);
                  setIsGoalModalOpen(true);
                }}
                onToggleActive={handleToggleGoalActive}
                onDeleteGoal={handleDeleteGoal}
                onSetStreakGoal={handleSetStreakGoal}
              />
            )}

            {/* TAB 4: STATS & PROGRESS */}
            {activeTab === 'stats' && (
              <StatsDashboard
                stats={stats}
                rewards={rewards}
                completions={completions}
                goals={goals}
              />
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-700 gap-2">
          <span>
            Metas & Recompensas • Gamifique seus dias e libere suas compras na vida real
          </span>
          <button
            onClick={() => setIsMongoModalOpen(true)}
            className="hover:text-stone-900 font-semibold underline"
          >
            Configurar MongoDB Atlas
          </button>
        </div>
      </footer>

      {/* MODALS */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
        editingGoal={editingGoal}
      />

      <RewardModal
        isOpen={isRewardModalOpen}
        onClose={() => {
          setIsRewardModalOpen(false);
          setEditingReward(null);
        }}
        onSave={handleSaveReward}
        onDelete={handleDeleteReward}
        editingReward={editingReward}
      />

      <MongoStatusModal
        isOpen={isMongoModalOpen}
        onClose={() => setIsMongoModalOpen(false)}
        status={dbStatus}
        onRefresh={loadData}
      />

    </div>
  );
}
