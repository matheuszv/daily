import { Goal, DayCompletion, Reward, UserStats, DatabaseStatus } from '../types';

const API_BASE = '/api';

export const api = {
  // Database Status
  async getDbStatus(): Promise<DatabaseStatus> {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) throw new Error('Erro ao obter status do banco');
    return res.json();
  },

  async updateMongoUri(uri: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/config/mongo-uri`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri }),
    });
    return res.json();
  },

  // Goals
  async getGoals(): Promise<Goal[]> {
    const res = await fetch(`${API_BASE}/goals`);
    if (!res.ok) throw new Error('Erro ao carregar objetivos');
    return res.json();
  },

  async createGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal> {
    const res = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
    if (!res.ok) throw new Error('Erro ao criar objetivo');
    return res.json();
  },

  async updateGoal(id: string, goal: Partial<Goal>): Promise<Goal> {
    const res = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
    if (!res.ok) throw new Error('Erro ao atualizar objetivo');
    return res.json();
  },

  async deleteGoal(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao excluir objetivo');
    return res.json();
  },

  async setStreakGoal(id: string): Promise<Goal> {
    const res = await fetch(`${API_BASE}/goals/${id}/set-streak`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Erro ao definir meta principal do streak');
    return res.json();
  },

  // Completions
  async getCompletions(startDate?: string, endDate?: string): Promise<DayCompletion[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const res = await fetch(`${API_BASE}/completions?${params.toString()}`);
    if (!res.ok) throw new Error('Erro ao carregar conclusões');
    return res.json();
  },

  async toggleCompletion(goalId: string, date: string): Promise<{ completed: boolean; completion?: DayCompletion }> {
    const res = await fetch(`${API_BASE}/completions/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalId, date }),
    });
    if (!res.ok) throw new Error('Erro ao marcar/desmarcar objetivo');
    return res.json();
  },

  // Rewards
  async getRewards(): Promise<Reward[]> {
    const res = await fetch(`${API_BASE}/rewards`);
    if (!res.ok) throw new Error('Erro ao carregar recompensas');
    return res.json();
  },

  async createReward(reward: Omit<Reward, 'id' | 'createdAt' | 'status'>): Promise<Reward> {
    const res = await fetch(`${API_BASE}/rewards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reward),
    });
    if (!res.ok) throw new Error('Erro ao cadastrar recompensa');
    return res.json();
  },

  async updateReward(id: string, reward: Partial<Reward>): Promise<Reward> {
    const res = await fetch(`${API_BASE}/rewards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reward),
    });
    if (!res.ok) throw new Error('Erro ao atualizar recompensa');
    return res.json();
  },

  async markAsPurchased(id: string): Promise<{ success: boolean; reward: Reward; newBalance: number }> {
    const res = await fetch(`${API_BASE}/rewards/${id}/purchase`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Erro ao registrar compra da recompensa');
    }
    return res.json();
  },

  async deleteReward(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/rewards/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Erro ao remover recompensa');
    return res.json();
  },

  // Stats
  async getStats(date?: string): Promise<UserStats> {
    const params = date ? `?date=${date}` : '';
    const res = await fetch(`${API_BASE}/stats${params}`);
    if (!res.ok) throw new Error('Erro ao carregar estatísticas');
    return res.json();
  },
};
