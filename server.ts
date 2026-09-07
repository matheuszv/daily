import express from 'express';
import path from 'path';
import fs from 'fs';
import { MongoClient, ObjectId } from 'mongodb';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const app = express();

app.use(express.json());

// Path for local fallback database
const DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial seed data
const initialGoals = [
  {
    id: 'goal_1',
    title: 'Treino ou Caminhada (45min)',
    description: 'Atividade física para manter o corpo e a mente ativos.',
    category: 'saude',
    points: 40,
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    active: true,
    countsForStreak: true, // Atividade específica que conta para o streak
    createdAt: new Date().toISOString(),
  },
  {
    id: 'goal_2',
    title: 'Estudar Programação / Leitura (1 hora)',
    description: 'Foco nos estudos ou desenvolvimento pessoal diário.',
    category: 'estudos',
    points: 50,
    daysOfWeek: [1, 2, 3, 4, 5],
    active: true,
    countsForStreak: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'goal_3',
    title: 'Beber 2.5L de água',
    description: 'Hidratação constante ao longo do dia.',
    category: 'saude',
    points: 15,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    active: true,
    countsForStreak: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'goal_4',
    title: 'Alimentação saudável sem exageros',
    description: 'Seguir o plano alimentar e evitar doces/ultraprocessados.',
    category: 'saude',
    points: 25,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    active: true,
    countsForStreak: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'goal_5',
    title: 'Organizar ambiente e planejar o dia seguinte',
    description: 'Deixar tudo pronto para um dia produtivo.',
    category: 'pessoal',
    points: 20,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    active: true,
    countsForStreak: false,
    createdAt: new Date().toISOString(),
  },
];

const initialRewards = [
  {
    id: 'reward_1',
    title: 'Pedir Delivery / Pizza no Fim de Semana',
    description: 'Uma refeição livre especial para comemorar as metas da semana.',
    category: 'comida',
    costPoints: 180,
    estimatedValueBrl: 80,
    status: 'locked',
    requiresAllDailyGoals: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reward_2',
    title: 'Comprar um Livro Desejado',
    description: 'Liberado após acumular consistência de estudos.',
    category: 'compras',
    costPoints: 250,
    estimatedValueBrl: 65,
    status: 'locked',
    requiresAllDailyGoals: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reward_3',
    title: 'Cinema com Pipoca ou Game Novo',
    description: 'Momento de lazer merecido com os pontos conquistados.',
    category: 'lazer',
    costPoints: 350,
    estimatedValueBrl: 120,
    status: 'locked',
    requiresAllDailyGoals: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reward_4',
    title: 'Jantar em Restaurante Especial',
    description: 'Conquista de grande meta após manter a sequência por semanas.',
    category: 'comida',
    costPoints: 600,
    estimatedValueBrl: 220,
    status: 'locked',
    requiresAllDailyGoals: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reward_5',
    title: 'Acessório / Item de Tecnologia Desejado',
    description: 'Aquela compra de eletrônico que você estava esperando para justificar!',
    category: 'tecnologia',
    costPoints: 1200,
    estimatedValueBrl: 450,
    status: 'locked',
    requiresAllDailyGoals: false,
    createdAt: new Date().toISOString(),
  },
];

// Helper for local storage
interface LocalStore {
  goals: any[];
  rewards: any[];
  completions: any[];
}

function ensureLocalDb(): LocalStore {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_FILE)) {
    const defaultData: LocalStore = {
      goals: initialGoals,
      rewards: initialRewards,
      completions: [],
    };
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.goals && parsed.goals.length > 0) {
      const hasStreakGoal = parsed.goals.some((g: any) => g.countsForStreak);
      if (!hasStreakGoal) {
        parsed.goals[0].countsForStreak = true;
        fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
      }
    }
    return parsed;
  } catch (e) {
    const fallback: LocalStore = {
      goals: initialGoals,
      rewards: initialRewards,
      completions: [],
    };
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

function saveLocalDb(data: LocalStore) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// MongoDB Client & State
let mongoClient: MongoClient | null = null;
let mongoDbInstance: any = null;
let mongoConnected = false;
let mongoErrorMessage = '';
let currentMongoUri = process.env.MONGODB_URI || '';

async function connectToMongo(uri: string): Promise<boolean> {
  if (!uri || uri.trim() === '') {
    mongoConnected = false;
    mongoErrorMessage = 'Nenhuma URI de MongoDB configurada (usando armazenamento local resiliente)';
    return false;
  }

  try {
    if (mongoClient) {
      await mongoClient.close();
      mongoClient = null;
    }
    console.log('Tentando conectar ao MongoDB...');
    mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    await mongoClient.connect();
    const dbName = uri.split('/').pop()?.split('?')[0] || 'metas_recompensas';
    mongoDbInstance = mongoClient.db(dbName);
    mongoConnected = true;
    mongoErrorMessage = '';
    console.log(`Conectado com sucesso ao MongoDB: ${dbName}`);

    // Seed if empty
    const goalsCount = await mongoDbInstance.collection('goals').countDocuments();
    if (goalsCount === 0) {
      console.log('Populando dados iniciais no MongoDB...');
      await mongoDbInstance.collection('goals').insertMany(initialGoals.map(g => ({ ...g, _id: g.id })));
      await mongoDbInstance.collection('rewards').insertMany(initialRewards.map(r => ({ ...r, _id: r.id })));
    }
    return true;
  } catch (err: any) {
    mongoConnected = false;
    mongoErrorMessage = err.message || 'Falha ao conectar no MongoDB';
    console.warn('Erro ao conectar no MongoDB:', mongoErrorMessage);
    return false;
  }
}

// Initialize connection on boot
if (currentMongoUri) {
  connectToMongo(currentMongoUri).catch(() => {});
} else {
  ensureLocalDb();
}

// Data Access Abstraction
const dbService = {
  async getGoals() {
    if (mongoConnected && mongoDbInstance) {
      const items = await mongoDbInstance.collection('goals').find({}).toArray();
      return items.map((item: any) => ({
        id: item._id?.toString() || item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        points: item.points,
        daysOfWeek: item.daysOfWeek,
        active: item.active !== false,
        countsForStreak: Boolean(item.countsForStreak),
        createdAt: item.createdAt,
      }));
    }
    const store = ensureLocalDb();
    return store.goals.map((g: any) => ({
      ...g,
      countsForStreak: Boolean(g.countsForStreak),
    }));
  },

  async createGoal(goal: any) {
    const id = 'goal_' + Date.now();
    const countsForStreak = Boolean(goal.countsForStreak);

    if (mongoConnected && mongoDbInstance) {
      if (countsForStreak) {
        await mongoDbInstance.collection('goals').updateMany({}, { $set: { countsForStreak: false } });
      }
      const newGoal = {
        ...goal,
        id,
        _id: id,
        countsForStreak,
        active: true,
        createdAt: new Date().toISOString(),
      };
      await mongoDbInstance.collection('goals').insertOne(newGoal);
      return newGoal;
    }

    const store = ensureLocalDb();
    if (countsForStreak) {
      store.goals.forEach((g) => {
        g.countsForStreak = false;
      });
    }
    const newGoal = {
      ...goal,
      id,
      countsForStreak,
      active: true,
      createdAt: new Date().toISOString(),
    };
    store.goals.push(newGoal);
    saveLocalDb(store);
    return newGoal;
  },

  async updateGoal(id: string, updates: any) {
    if (updates.countsForStreak === true) {
      if (mongoConnected && mongoDbInstance) {
        await mongoDbInstance.collection('goals').updateMany(
          { _id: { $ne: id } },
          { $set: { countsForStreak: false } }
        );
      } else {
        const store = ensureLocalDb();
        store.goals.forEach((g) => {
          if (g.id !== id) g.countsForStreak = false;
        });
        saveLocalDb(store);
      }
    }

    if (mongoConnected && mongoDbInstance) {
      await mongoDbInstance.collection('goals').updateOne(
        { $or: [{ _id: id }, { id }] },
        { $set: updates }
      );
      const updated = await mongoDbInstance.collection('goals').findOne({ $or: [{ _id: id }, { id }] });
      return {
        id: updated._id?.toString() || updated.id,
        ...updated,
        countsForStreak: Boolean(updated.countsForStreak),
      };
    }

    const store = ensureLocalDb();
    const index = store.goals.findIndex((g) => g.id === id);
    if (index !== -1) {
      store.goals[index] = { ...store.goals[index], ...updates };
      saveLocalDb(store);
      return store.goals[index];
    }
    throw new Error('Objetivo não encontrado');
  },

  async setStreakGoal(id: string) {
    return await this.updateGoal(id, { countsForStreak: true });
  },

  async deleteGoal(id: string) {
    if (mongoConnected && mongoDbInstance) {
      await mongoDbInstance.collection('goals').deleteOne({ $or: [{ _id: id }, { id }] });
      await mongoDbInstance.collection('completions').deleteMany({ goalId: id });
      return true;
    }

    const store = ensureLocalDb();
    store.goals = store.goals.filter((g) => g.id !== id);
    store.completions = store.completions.filter((c) => c.goalId !== id);
    saveLocalDb(store);
    return true;
  },

  async getCompletions(startDate?: string, endDate?: string) {
    if (mongoConnected && mongoDbInstance) {
      const query: any = {};
      if (startDate && endDate) {
        query.date = { $gte: startDate, $lte: endDate };
      } else if (startDate) {
        query.date = startDate;
      }
      const items = await mongoDbInstance.collection('completions').find(query).toArray();
      return items.map((c: any) => ({
        id: c._id?.toString() || c.id,
        goalId: c.goalId,
        date: c.date,
        completedAt: c.completedAt,
        pointsEarned: c.pointsEarned,
      }));
    }

    const store = ensureLocalDb();
    if (startDate && endDate) {
      return store.completions.filter((c) => c.date >= startDate && c.date <= endDate);
    } else if (startDate) {
      return store.completions.filter((c) => c.date === startDate);
    }
    return store.completions;
  },

  async toggleCompletion(goalId: string, date: string) {
    const goals = await this.getGoals();
    const targetGoal = goals.find((g: any) => g.id === goalId);
    if (!targetGoal) {
      throw new Error('Objetivo não encontrado');
    }

    if (mongoConnected && mongoDbInstance) {
      const existing = await mongoDbInstance.collection('completions').findOne({ goalId, date });
      if (existing) {
        await mongoDbInstance.collection('completions').deleteOne({ _id: existing._id });
        return { completed: false };
      } else {
        const id = 'comp_' + Date.now();
        const completion = {
          _id: id,
          id,
          goalId,
          date,
          completedAt: new Date().toISOString(),
          pointsEarned: targetGoal.points || 0,
        };
        await mongoDbInstance.collection('completions').insertOne(completion);
        return { completed: true, completion };
      }
    }

    const store = ensureLocalDb();
    const existingIndex = store.completions.findIndex((c) => c.goalId === goalId && c.date === date);
    if (existingIndex !== -1) {
      store.completions.splice(existingIndex, 1);
      saveLocalDb(store);
      return { completed: false };
    } else {
      const completion = {
        id: 'comp_' + Date.now(),
        goalId,
        date,
        completedAt: new Date().toISOString(),
        pointsEarned: targetGoal.points || 0,
      };
      store.completions.push(completion);
      saveLocalDb(store);
      return { completed: true, completion };
    }
  },

  async getRewards() {
    if (mongoConnected && mongoDbInstance) {
      const items = await mongoDbInstance.collection('rewards').find({}).toArray();
      return items.map((r: any) => ({
        id: r._id?.toString() || r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        costPoints: r.costPoints,
        estimatedValueBrl: r.estimatedValueBrl,
        status: r.status,
        requiresAllDailyGoals: r.requiresAllDailyGoals,
        unlockedAt: r.unlockedAt,
        purchasedAt: r.purchasedAt,
        createdAt: r.createdAt,
        notes: r.notes,
      }));
    }

    const store = ensureLocalDb();
    return store.rewards;
  },

  async createReward(reward: any) {
    const id = 'reward_' + Date.now();
    const newReward = {
      ...reward,
      id,
      status: 'locked',
      createdAt: new Date().toISOString(),
    };

    if (mongoConnected && mongoDbInstance) {
      await mongoDbInstance.collection('rewards').insertOne({
        ...newReward,
        _id: id,
      });
      return newReward;
    }

    const store = ensureLocalDb();
    store.rewards.push(newReward);
    saveLocalDb(store);
    return newReward;
  },

  async updateReward(id: string, updates: any) {
    if (mongoConnected && mongoDbInstance) {
      await mongoDbInstance.collection('rewards').updateOne(
        { $or: [{ _id: id }, { id }] },
        { $set: updates }
      );
      const updated = await mongoDbInstance.collection('rewards').findOne({ $or: [{ _id: id }, { id }] });
      return {
        id: updated._id?.toString() || updated.id,
        ...updated,
      };
    }

    const store = ensureLocalDb();
    const index = store.rewards.findIndex((r) => r.id === id);
    if (index !== -1) {
      store.rewards[index] = { ...store.rewards[index], ...updates };
      saveLocalDb(store);
      return store.rewards[index];
    }
    throw new Error('Recompensa não encontrada');
  },

  async deleteReward(id: string) {
    if (mongoConnected && mongoDbInstance) {
      await mongoDbInstance.collection('rewards').deleteOne({ $or: [{ _id: id }, { id }] });
      return true;
    }

    const store = ensureLocalDb();
    store.rewards = store.rewards.filter((r) => r.id !== id);
    saveLocalDb(store);
    return true;
  },

  async markRewardPurchased(id: string) {
    const rewards = await this.getRewards();
    const reward = rewards.find((r: any) => r.id === id);
    if (!reward) throw new Error('Recompensa não encontrada');

    const stats = await this.getStats();
    if (stats.currentBalance < reward.costPoints) {
      throw new Error(`Pontos insuficientes. Você tem ${stats.currentBalance} pontos, mas precisa de ${reward.costPoints}.`);
    }

    const updates = {
      status: 'purchased',
      purchasedAt: new Date().toISOString(),
    };

    return await this.updateReward(id, updates);
  },

  async getStats(todayStr?: string) {
    const today = todayStr || new Date().toISOString().split('T')[0];
    const goals = await this.getGoals();
    const completions = await this.getCompletions();
    const rewards = await this.getRewards();

    // Total points earned
    const totalPointsEarned = completions.reduce((sum: number, c: any) => sum + (c.pointsEarned || 0), 0);

    // Total points spent on purchased rewards
    const purchasedRewards = rewards.filter((r: any) => r.status === 'purchased');
    const totalPointsSpent = purchasedRewards.reduce((sum: number, r: any) => sum + (r.costPoints || 0), 0);

    const currentBalance = Math.max(0, totalPointsEarned - totalPointsSpent);

    // Today stats
    const todayDate = new Date(today + 'T12:00:00');
    const dayOfWeek = todayDate.getDay(); // 0-6

    // Filter goals active for today's day of week
    const todayGoals = goals.filter((g: any) => g.active && (!g.daysOfWeek || g.daysOfWeek.includes(dayOfWeek)));
    const todayCompletions = completions.filter((c: any) => c.date === today);

    const todayPoints = todayCompletions.reduce((sum: number, c: any) => sum + (c.pointsEarned || 0), 0);

    // Calculate streak (ONLY the specific designated streak activity counts, all others are extra points)
    const streakGoal = goals.find((g: any) => g.countsForStreak) || goals[0];
    let streak = 0;
    let isStreakMaintainedToday = false;

    const curDate = new Date(today + 'T12:00:00');
    const curStr = today;
    const yestDate = new Date(curDate);
    yestDate.setDate(yestDate.getDate() - 1);
    const yestStr = yestDate.toISOString().split('T')[0];

    if (streakGoal) {
      const streakCompletions = completions.filter((c: any) => c.goalId === streakGoal.id);
      const uniqueStreakDates = Array.from(new Set(streakCompletions.map((c: any) => c.date))).sort().reverse() as string[];
      isStreakMaintainedToday = uniqueStreakDates.includes(curStr);

      if (uniqueStreakDates.includes(curStr) || uniqueStreakDates.includes(yestStr)) {
        let checkDate = uniqueStreakDates.includes(curStr) ? new Date(curDate) : new Date(yestDate);
        while (true) {
          const dStr = checkDate.toISOString().split('T')[0];
          if (uniqueStreakDates.includes(dStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    return {
      totalPointsEarned,
      totalPointsSpent,
      currentBalance,
      todayPoints,
      todayCompletedCount: todayCompletions.length,
      todayTotalCount: todayGoals.length,
      currentStreak: streak,
      bestStreak: Math.max(streak, 7),
      streakGoalTitle: streakGoal?.title,
      isStreakMaintainedToday,
    };
  },
};

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    connected: mongoConnected,
    type: mongoConnected ? 'mongodb' : 'local_fallback',
    databaseName: mongoConnected ? (mongoDbInstance?.databaseName || 'metas_recompensas') : 'local_storage',
    message: mongoConnected
      ? 'Conectado ao MongoDB com sucesso!'
      : (mongoErrorMessage || 'Operando em modo local resiliente (adicione MONGODB_URI no .env para nuvem)'),
  });
});

app.post('/api/config/mongo-uri', async (req, res) => {
  const { uri } = req.body;
  currentMongoUri = uri;
  const success = await connectToMongo(uri);
  res.json({
    success,
    message: success ? 'Conectado com sucesso ao MongoDB!' : `Falha: ${mongoErrorMessage}`,
  });
});

app.get('/api/goals', async (req, res) => {
  try {
    const goals = await dbService.getGoals();
    res.json(goals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/goals', async (req, res) => {
  try {
    const { title, description, category, points, daysOfWeek, countsForStreak } = req.body;
    if (!title || !points) {
      return res.status(400).json({ error: 'Título e pontos são obrigatórios' });
    }
    const goal = await dbService.createGoal({
      title,
      description,
      category: category || 'geral',
      points: Number(points),
      daysOfWeek: daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
      countsForStreak: Boolean(countsForStreak),
    });
    res.status(201).json(goal);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/goals/:id/set-streak', async (req, res) => {
  try {
    const updated = await dbService.setStreakGoal(req.params.id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/goals/:id', async (req, res) => {
  try {
    const updated = await dbService.updateGoal(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/goals/:id', async (req, res) => {
  try {
    await dbService.deleteGoal(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/completions', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const completions = await dbService.getCompletions(startDate as string, endDate as string);
    res.json(completions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/completions/toggle', async (req, res) => {
  try {
    const { goalId, date } = req.body;
    if (!goalId || !date) {
      return res.status(400).json({ error: 'goalId e date são obrigatórios' });
    }
    const result = await dbService.toggleCompletion(goalId, date);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rewards', async (req, res) => {
  try {
    const rewards = await dbService.getRewards();
    res.json(rewards);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rewards', async (req, res) => {
  try {
    const { title, description, category, costPoints, estimatedValueBrl, requiresAllDailyGoals, notes } = req.body;
    if (!title || !costPoints) {
      return res.status(400).json({ error: 'Título e custo em pontos são obrigatórios' });
    }
    const reward = await dbService.createReward({
      title,
      description,
      category: category || 'lazer',
      costPoints: Number(costPoints),
      estimatedValueBrl: estimatedValueBrl ? Number(estimatedValueBrl) : undefined,
      requiresAllDailyGoals: Boolean(requiresAllDailyGoals),
      notes,
    });
    res.status(201).json(reward);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rewards/:id', async (req, res) => {
  try {
    const updated = await dbService.updateReward(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rewards/:id/purchase', async (req, res) => {
  try {
    const reward = await dbService.markRewardPurchased(req.params.id);
    const stats = await dbService.getStats();
    res.json({ success: true, reward, newBalance: stats.currentBalance });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/rewards/:id', async (req, res) => {
  try {
    await dbService.deleteReward(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await dbService.getStats(req.query.date as string);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite Middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
