import React, { useState } from 'react';
import { Gift, Plus, CheckCircle2, Lock, Sparkles, Coins, ShoppingBag, Tag, Trash2, Edit3, ShieldAlert, Check } from 'lucide-react';
import { Reward, UserStats } from '../types';

interface RewardsStoreProps {
  rewards: Reward[];
  stats: UserStats | null;
  todayCompletedAll: boolean;
  onPurchaseReward: (rewardId: string) => Promise<void>;
  onOpenAddReward: () => void;
  onOpenEditReward: (reward: Reward) => void;
  onDeleteReward: (rewardId: string) => void;
}

export const RewardsStore: React.FC<RewardsStoreProps> = ({
  rewards,
  stats,
  todayCompletedAll,
  onPurchaseReward,
  onOpenAddReward,
  onOpenEditReward,
  onDeleteReward,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked' | 'purchased'>('all');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [confirmDialogReward, setConfirmDialogReward] = useState<Reward | null>(null);

  const currentBalance = stats ? stats.currentBalance : 0;

  // Filter rewards logic
  const filteredRewards = rewards.filter((r) => {
    const isPurchased = r.status === 'purchased';
    const hasEnoughPoints = currentBalance >= r.costPoints;
    const meetsDailyReq = !r.requiresAllDailyGoals || todayCompletedAll;
    const isUnlocked = !isPurchased && hasEnoughPoints && meetsDailyReq;

    if (filter === 'purchased') return isPurchased;
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isPurchased && !isUnlocked;
    return true; // 'all'
  });

  const handleConfirmPurchase = async () => {
    if (!confirmDialogReward) return;
    try {
      setPurchasingId(confirmDialogReward.id);
      await onPurchaseReward(confirmDialogReward.id);
      setConfirmDialogReward(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar compra');
    } finally {
      setPurchasingId(null);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'comida':
        return { label: 'Gastronomia & Lanches', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'lazer':
        return { label: 'Lazer & Entretenimento', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'compras':
        return { label: 'Compras & Estilo', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'tecnologia':
        return { label: 'Tecnologia & Games', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'viagem':
        return { label: 'Passeio & Viagem', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'Outro Desejo', bg: 'bg-stone-100 text-stone-700 border-stone-200' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Real-world Release and Points Status */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistema de Liberação para Compras Reais</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Suas Recompensas da Vida Real
            </h2>
            <p className="text-stone-300 text-sm sm:text-base mt-2 leading-relaxed">
              Transforme seus pontos e a consistência diária em permissão para comprar o que você deseja sem culpa! Cumpra seus objetivos, desbloqueie o item e marque como comprado.
            </p>
          </div>

          {/* Points & Daily Unlock Status Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 flex flex-col sm:flex-row items-stretch sm:items-center gap-5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-md shrink-0">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-stone-300 font-medium">Saldo Disponível</span>
                <p className="text-2xl sm:text-3xl font-black text-amber-300 leading-none">
                  {currentBalance} <span className="text-xs font-normal text-stone-300">pts</span>
                </p>
              </div>
            </div>

            <div className="h-px sm:h-12 w-full sm:w-px bg-white/20" />

            <div>
              <span className="text-xs text-stone-300 font-medium">Meta de Hoje</span>
              <div className="flex items-center gap-1.5 mt-1">
                {todayCompletedAll ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-md border border-emerald-400/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    100% Batida (Liberado!)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-200 bg-amber-500/15 px-2.5 py-1 rounded-md border border-amber-400/20">
                    Em andamento
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action button inside banner */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-stone-300">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Cadastre itens, jogos, livros, jantares e passeios que você quer comprar na vida real.</span>
          </div>

          <button
            id="btn-add-reward"
            onClick={onOpenAddReward}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Cadastrar Novo Desejo / Compra
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-2 rounded-lg transition-all ${
              filter === 'all' ? 'bg-white text-stone-950 shadow-xs font-bold' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Todos ({rewards.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              filter === 'unlocked' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Liberados para Comprar
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              filter === 'locked' ? 'bg-white text-stone-950 shadow-xs font-bold' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-stone-600" />
            A Conquistar
          </button>
          <button
            onClick={() => setFilter('purchased')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              filter === 'purchased' ? 'bg-white text-stone-950 shadow-xs font-bold' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Check className="w-3.5 h-3.5 text-stone-600" />
            Já Comprados na Vida Real
          </button>
        </div>

        <button
          onClick={onOpenAddReward}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Item
        </button>
      </div>

      {/* Rewards Grid */}
      {filteredRewards.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-stone-200 p-12 text-center">
          <Gift className="w-12 h-12 text-stone-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">
            Nenhuma recompensa encontrada nesta categoria
          </h3>
          <p className="text-xs sm:text-sm text-stone-700 max-w-sm mx-auto mt-1">
            Cadastre aquilo que você quer comprar na vida real para se motivar a cumprir seus objetivos todos os dias!
          </p>
          <button
            onClick={onOpenAddReward}
            className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-colors"
          >
            Cadastrar Recompensa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRewards.map((reward) => {
            const isPurchased = reward.status === 'purchased';
            const hasEnoughPoints = currentBalance >= reward.costPoints;
            const meetsDailyReq = !reward.requiresAllDailyGoals || todayCompletedAll;
            const isUnlocked = !isPurchased && hasEnoughPoints && meetsDailyReq;
            const catBadge = getCategoryBadge(reward.category);

            const pointsProgress = Math.min(100, Math.round((currentBalance / reward.costPoints) * 100));
            const pointsRemaining = Math.max(0, reward.costPoints - currentBalance);

            return (
              <div
                key={reward.id}
                className={`flex flex-col justify-between rounded-2xl border transition-all duration-300 p-5 ${
                  isPurchased
                    ? 'bg-stone-50 border-stone-200 opacity-90'
                    : isUnlocked
                    ? 'bg-white border-emerald-400 shadow-md ring-2 ring-emerald-400/20'
                    : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
                }`}
              >
                <div>
                  {/* Status Banner */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${catBadge.bg}`}>
                      {catBadge.label}
                    </span>

                    {isPurchased ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Comprado!
                      </span>
                    ) : isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 animate-pulse">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        LIBERADO P/ COMPRA
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        <Lock className="w-3 h-3 text-stone-600" />
                        Bloqueado
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className={`text-base sm:text-lg font-bold ${isPurchased ? 'text-stone-700' : 'text-stone-950'}`}>
                    {reward.title}
                  </h3>

                  {reward.description && (
                    <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                      {reward.description}
                    </p>
                  )}

                  {/* Price info & Points cost */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-600 block">Custo</span>
                      <span className="text-base font-extrabold text-amber-700 flex items-center gap-1">
                        <Coins className="w-4 h-4 text-amber-600" />
                        {reward.costPoints} pts
                      </span>
                    </div>

                    {reward.estimatedValueBrl && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-stone-600 block">Valor Real</span>
                        <span className="text-sm font-semibold text-stone-700">
                          R$ {reward.estimatedValueBrl.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Requirement details */}
                  {reward.requiresAllDailyGoals && (
                    <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 font-medium flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Exige cumprir 100% das metas do dia para liberar</span>
                    </div>
                  )}

                  {/* Progress bar if locked */}
                  {!isPurchased && !isUnlocked && (
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px] font-medium text-stone-700 mb-1">
                        <span>Progresso de pontos</span>
                        <span>{pointsRemaining > 0 ? `Faltam ${pointsRemaining} pts` : 'Pontos OK!'}</span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pointsProgress}%` }}
                        />
                      </div>
                      {hasEnoughPoints && !meetsDailyReq && (
                        <p className="text-[11px] text-amber-800 font-semibold mt-1">
                          ⚠️ Você tem os pontos, mas precisa bater a meta do dia de hoje para liberar!
                        </p>
                      )}
                    </div>
                  )}

                  {/* Purchased Date Stamp */}
                  {isPurchased && reward.purchasedAt && (
                    <p className="text-[11px] text-stone-700 mt-3 pt-2 border-t border-stone-100 font-medium">
                      Conquistado e comprado em {new Date(reward.purchasedAt).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditReward(reward)}
                      className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                      title="Editar recompensa"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteReward(reward.id)}
                      className="p-1.5 text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Excluir recompensa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {isPurchased ? (
                    <span className="text-xs font-bold text-stone-600 py-1.5 px-3 bg-stone-100 rounded-lg">
                      Item Já Resgatado
                    </span>
                  ) : isUnlocked ? (
                    <button
                      id={`btn-buy-reward-${reward.id}`}
                      onClick={() => setConfirmDialogReward(reward)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Marcar como Comprada na Vida Real
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-600 cursor-not-allowed"
                    >
                      Bloqueado ({reward.costPoints} pts)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal to Mark as Purchased in Real Life */}
      {confirmDialogReward && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-stone-900 text-center">
              Liberado para Comprar na Vida Real!
            </h3>

            <p className="text-xs sm:text-sm text-stone-700 text-center mt-2 leading-relaxed">
              Parabéns pela sua disciplina e foco! Você conquistou o direito de comprar:
            </p>

            <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200 text-center">
              <span className="text-base font-bold text-stone-900 block">
                {confirmDialogReward.title}
              </span>
              <span className="text-xs font-semibold text-amber-700 mt-1 block">
                Custo: {confirmDialogReward.costPoints} pontos • Saldo restante: {currentBalance - confirmDialogReward.costPoints} pontos
              </span>
            </div>

            <p className="text-[11px] text-stone-600 text-center mt-3">
              Ao confirmar, essa recompensa será marcada como "Comprada na Vida Real" e os pontos serão debitados do seu saldo.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialogReward(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPurchase}
                disabled={purchasingId === confirmDialogReward.id}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {purchasingId === confirmDialogReward.id ? (
                  <span>Processando...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Compra</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
