import React from 'react';
import { Coins, Flame, CheckCircle2, ShoppingBag, Award, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { UserStats, Reward, DayCompletion, Goal } from '../types';

interface StatsDashboardProps {
  stats: UserStats | null;
  rewards: Reward[];
  completions: DayCompletion[];
  goals: Goal[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  rewards,
  completions,
  goals,
}) => {
  const purchasedRewards = rewards.filter((r) => r.status === 'purchased');

  // Total saved / invested value in R$
  const totalBrlValue = purchasedRewards.reduce((sum, r) => sum + (r.estimatedValueBrl || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-stone-900">
          Painel de Pontos & Conquistas
        </h2>
        <p className="text-xs sm:text-sm text-stone-700 mt-1">
          Acompanhe seu saldo, evolução de hábitos e as compras da vida real que você já desbloqueou.
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Saldo Atual */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Saldo de Pontos</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-stone-950">
            {stats ? stats.currentBalance : 0}
          </p>
          <span className="text-xs text-stone-700 mt-1 block">
            Prontos para liberar compras reais
          </span>
        </div>

        {/* Card 2: Total Ganhos na Vida */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Conquistado</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-800">
            +{stats ? stats.totalPointsEarned : 0}
          </p>
          <span className="text-xs text-stone-700 mt-1 block">
            Acumulados cumprindo metas diárias
          </span>
        </div>

        {/* Card 3: Pontos Trocados em Compras */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pontos Resgatados</span>
            <div className="p-2 rounded-xl bg-stone-100 text-stone-700">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-stone-700">
            -{stats ? stats.totalPointsSpent : 0}
          </p>
          <span className="text-xs text-stone-700 mt-1 block">
            {purchasedRewards.length} compras na vida real feitas
          </span>
        </div>

        {/* Card 4: Sequência Diária */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Sequência de Dias</span>
            <div className="p-2 rounded-xl bg-orange-50 text-orange-700">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-orange-600">
            {stats ? stats.currentStreak : 0} dias
          </p>
          <span className="text-xs text-stone-700 mt-1 block truncate" title={stats?.streakGoalTitle}>
            {stats?.streakGoalTitle ? `Meta: "${stats.streakGoalTitle}"` : 'Atividade principal'}
          </span>
        </div>

      </div>

      {/* Real-World Purchases Ledger */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              Histórico de Compras da Vida Real Conquistadas
            </h3>
            <p className="text-xs text-stone-700 mt-0.5">
              Itens que você mereceu comprar pelo seu próprio esforço
            </p>
          </div>

          {totalBrlValue > 0 && (
            <div className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl">
              Total investido em você: R$ {totalBrlValue.toFixed(2)}
            </div>
          )}
        </div>

        {purchasedRewards.length === 0 ? (
          <div className="py-10 text-center">
            <Award className="w-10 h-10 mx-auto text-stone-600 mb-2" />
            <p className="text-sm font-semibold text-stone-700">
              Nenhuma compra registrada ainda
            </p>
            <p className="text-xs text-stone-700 mt-1 max-w-sm mx-auto">
              Cumpra seus objetivos diários para juntar pontos e liberar seus primeiros itens na loja de recompensas!
            </p>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-stone-100">
            {purchasedRewards.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">
                      {item.title}
                    </h4>
                    <span className="text-xs text-stone-700">
                      {item.purchasedAt ? new Date(item.purchasedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }) : 'Conquistado'}
                      {item.estimatedValueBrl ? ` • R$ ${item.estimatedValueBrl.toFixed(2)}` : ''}
                    </span>
                  </div>
                </div>

                <span className="text-xs sm:text-sm font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  -{item.costPoints} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
