export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: 'saude' | 'estudos' | 'trabalho' | 'pessoal' | 'financas' | 'fitness';
  points: number; // Cada objetivo dá pontos diferentes
  daysOfWeek: WeekDay[]; // Em quais dias da semana esse objetivo aparece (ex: [1,2,3,4,5] para seg-sex)
  active: boolean;
  countsForStreak?: boolean; // Apenas esta atividade específica conta para a sequência de dias (streak)
  createdAt: string;
}

export interface DayCompletion {
  id: string;
  goalId: string;
  date: string; // Formato YYYY-MM-DD
  completedAt: string;
  pointsEarned: number;
}

export type RewardStatus = 'locked' | 'unlocked' | 'purchased';

export interface Reward {
  id: string;
  title: string;
  description?: string;
  category: 'lazer' | 'comida' | 'compras' | 'tecnologia' | 'viagem' | 'outro';
  costPoints: number; // Custo em pontos para liberar
  estimatedValueBrl?: number; // Preço estimado em R$
  status: RewardStatus;
  requiresAllDailyGoals?: boolean; // Se exige também cumprir a meta do dia para liberação
  unlockedAt?: string;
  purchasedAt?: string;
  createdAt: string;
  notes?: string;
}

export interface UserStats {
  totalPointsEarned: number;
  totalPointsSpent: number;
  currentBalance: number;
  todayPoints: number;
  todayCompletedCount: number;
  todayTotalCount: number;
  currentStreak: number;
  bestStreak: number;
  streakGoalTitle?: string;
  isStreakMaintainedToday?: boolean;
}

export interface DatabaseStatus {
  connected: boolean;
  type: 'mongodb' | 'local_fallback';
  databaseName?: string;
  message: string;
}
