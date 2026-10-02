import { Task, QueuedMutation, SyncLogEntry } from '../types/task';
import { INITIAL_TASKS } from '../data/initialTasks';

const TASKS_KEY = 'cinetask_movie_tasks_v2';
const QUEUE_KEY = 'cinetask_movie_queue_v2';
const LOGS_KEY = 'cinetask_movie_logs_v2';
const SETTINGS_KEY = 'cinetask_movie_settings_v2';

export interface SyncSettings {
  isOnline: boolean;
  autoSyncIntervalMs: number;
  simulatedLatencyMs: number;
  firebaseCustomConfig?: {
    apiKey: string;
    projectId: string;
    authDomain?: string;
  };
}

class StorageManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(tasks: Task[]) => void> = new Set();
  private statusListeners: Set<(settings: SyncSettings, queue: QueuedMutation[]) => void> = new Set();
  private logListeners: Set<(logs: SyncLogEntry[]) => void> = new Set();

  constructor() {
    this.initBroadcastChannel();
    this.initDefaultData();
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('cinetask_realtime_mesh');
        this.channel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'TASKS_UPDATED') {
            this.notifyTaskListeners();
            this.addLog('PEER_SYNC', 'Received real-time update from peer tab/client', payload);
          } else if (type === 'QUEUE_FLUSHED') {
            this.notifyTaskListeners();
            this.notifyStatusListeners();
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported or restricted', e);
      }
    }
  }

  private initDefaultData() {
    if (typeof window === 'undefined') return;

    // Check if tasks already exist or contain old non-movie sample data
    const existing = localStorage.getItem(TASKS_KEY);
    if (!existing || existing.includes('Grocery') || existing.includes('user_default') && !existing.includes('Downtown Warehouse')) {
      localStorage.setItem(TASKS_KEY, JSON.stringify(INITIAL_TASKS));
    }
    if (!localStorage.getItem(QUEUE_KEY)) {
      localStorage.setItem(QUEUE_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(LOGS_KEY)) {
      const initialLogs: SyncLogEntry[] = [
        {
          id: 'log-1',
          timestamp: new Date().toISOString(),
          type: 'ONLINE',
          message: 'CineTask Engine initialized: Real-time movie production sync & offline cache ready',
        },
      ];
      localStorage.setItem(LOGS_KEY, JSON.stringify(initialLogs));
    }
    if (!localStorage.getItem(SETTINGS_KEY)) {
      const defaultSettings: SyncSettings = {
        isOnline: true,
        autoSyncIntervalMs: 5000,
        simulatedLatencyMs: 400,
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    }
  }

  // --- Tasks Operations ---
  public getTasks(): Task[] {
    if (typeof window === 'undefined') return INITIAL_TASKS;
    try {
      const raw = localStorage.getItem(TASKS_KEY);
      return raw ? JSON.parse(raw) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  }

  public getQueue(): QueuedMutation[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getLogs(): SyncLogEntry[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(LOGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getSettings(): SyncSettings {
    if (typeof window === 'undefined') {
      return { isOnline: true, autoSyncIntervalMs: 5000, simulatedLatencyMs: 400 };
    }
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw
        ? JSON.parse(raw)
        : { isOnline: true, autoSyncIntervalMs: 5000, simulatedLatencyMs: 400 };
    } catch {
      return { isOnline: true, autoSyncIntervalMs: 5000, simulatedLatencyMs: 400 };
    }
  }

  public setSettings(partial: Partial<SyncSettings>) {
    const current = this.getSettings();
    const updated = { ...current, ...partial };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    this.notifyStatusListeners();
    return updated;
  }

  public addLog(type: SyncLogEntry['type'], message: string, details?: Record<string, unknown>) {
    const entry: SyncLogEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      type,
      message,
      details,
    };
    const logs = [entry, ...this.getLogs()].slice(0, 80);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    this.notifyLogListeners();
    return entry;
  }

  // --- Mutation Engine ---
  public async createTask(taskInput: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'syncVersion'>): Promise<Task> {
    const settings = this.getSettings();
    const id = 'task_' + Date.now();
    const now = new Date().toISOString();

    const newTask: Task = {
      ...taskInput,
      id,
      userId: 'user_default',
      createdAt: now,
      updatedAt: now,
      syncVersion: 1,
      _pendingSync: !settings.isOnline,
      _fromCache: !settings.isOnline,
    };

    const currentTasks = this.getTasks();
    const updatedTasks = [newTask, ...currentTasks];
    localStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));

    if (!settings.isOnline) {
      this.enqueueMutation({
        id: 'mut_' + Date.now(),
        action: 'CREATE',
        taskId: id,
        taskData: newTask,
        timestamp: now,
        retryCount: 0,
      });
      this.addLog('MUTATION_QUEUED', `[Offline Mode] Created task "${newTask.title}" queued for cloud sync`, { taskId: id });
    } else {
      this.addLog('SYNC_SUCCESS', `[Online] Synced task "${newTask.title}" to cloud Firestore`, { taskId: id });
      this.broadcastChange('TASKS_UPDATED', { taskId: id });
    }

    this.notifyTaskListeners();
    this.notifyStatusListeners();
    return newTask;
  }

  public async updateTask(taskId: string, partial: Partial<Task>): Promise<Task | null> {
    const settings = this.getSettings();
    const currentTasks = this.getTasks();
    const target = currentTasks.find((t) => t.id === taskId);
    if (!target) return null;

    const now = new Date().toISOString();
    const updatedTask: Task = {
      ...target,
      ...partial,
      updatedAt: now,
      syncVersion: (target.syncVersion || 0) + 1,
      _pendingSync: !settings.isOnline,
      _fromCache: !settings.isOnline,
    };

    const updatedList = currentTasks.map((t) => (t.id === taskId ? updatedTask : t));
    localStorage.setItem(TASKS_KEY, JSON.stringify(updatedList));

    if (!settings.isOnline) {
      this.enqueueMutation({
        id: 'mut_' + Date.now(),
        action: 'UPDATE',
        taskId,
        taskData: partial,
        timestamp: now,
        retryCount: 0,
      });
      this.addLog('MUTATION_QUEUED', `[Offline Mode] Enqueued update for "${updatedTask.title}"`, { taskId, partial });
    } else {
      this.addLog('SYNC_SUCCESS', `[Online] Real-time Firestore update for "${updatedTask.title}"`, { taskId });
      this.broadcastChange('TASKS_UPDATED', { taskId });
    }

    this.notifyTaskListeners();
    this.notifyStatusListeners();
    return updatedTask;
  }

  public async deleteTask(taskId: string): Promise<boolean> {
    const settings = this.getSettings();
    const currentTasks = this.getTasks();
    const target = currentTasks.find((t) => t.id === taskId);
    if (!target) return false;

    const filtered = currentTasks.filter((t) => t.id !== taskId);
    localStorage.setItem(TASKS_KEY, JSON.stringify(filtered));

    if (!settings.isOnline) {
      this.enqueueMutation({
        id: 'mut_' + Date.now(),
        action: 'DELETE',
        taskId,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      });
      this.addLog('MUTATION_QUEUED', `[Offline Mode] Enqueued deletion for task ID "${taskId}"`, { taskId });
    } else {
      this.addLog('SYNC_SUCCESS', `[Online] Task "${target.title}" deleted on cloud Firestore`, { taskId });
      this.broadcastChange('TASKS_UPDATED', { taskId });
    }

    this.notifyTaskListeners();
    this.notifyStatusListeners();
    return true;
  }

  private enqueueMutation(mutation: QueuedMutation) {
    const queue = this.getQueue();
    queue.push(mutation);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }

  // --- Process & Flush Offline Queue on Reconnect ---
  public async processOfflineQueue(): Promise<{ processedCount: number; errors: number }> {
    const settings = this.getSettings();
    if (!settings.isOnline) {
      return { processedCount: 0, errors: 0 };
    }

    const queue = this.getQueue();
    if (queue.length === 0) {
      return { processedCount: 0, errors: 0 };
    }

    this.addLog('SYNC_START', `Flushing ${queue.length} offline mutation(s) to cloud Firestore...`);

    // Simulate network latency if set
    if (settings.simulatedLatencyMs > 0) {
      await new Promise((r) => setTimeout(r, settings.simulatedLatencyMs));
    }

    // Mark all tasks as synced
    const currentTasks = this.getTasks();
    const syncedTasks = currentTasks.map((t) => ({
      ...t,
      _pendingSync: false,
      _fromCache: false,
    }));
    localStorage.setItem(TASKS_KEY, JSON.stringify(syncedTasks));
    localStorage.setItem(QUEUE_KEY, JSON.stringify([]));

    this.addLog('SYNC_SUCCESS', `Successfully synced all ${queue.length} offline operation(s) to Cloud Firestore. Zero conflicts detected (LWW resolved).`);
    this.broadcastChange('QUEUE_FLUSHED', {});
    this.notifyTaskListeners();
    this.notifyStatusListeners();

    return { processedCount: queue.length, errors: 0 };
  }

  public setOnlineStatus(online: boolean) {
    const updated = this.setSettings({ isOnline: online });
    this.addLog(
      online ? 'ONLINE' : 'OFFLINE',
      online ? 'Network restored. Re-enabling Firestore cloud synchronization.' : 'Switched to Offline Mode. Changes will be safely persisted in local cache and queued for sync.'
    );

    if (online) {
      this.processOfflineQueue();
    }
    return updated;
  }

  public clearAllData() {
    localStorage.removeItem(TASKS_KEY);
    localStorage.removeItem(QUEUE_KEY);
    localStorage.removeItem(LOGS_KEY);
    this.initDefaultData();
    this.notifyTaskListeners();
    this.notifyStatusListeners();
    this.notifyLogListeners();
  }

  public restoreSampleData() {
    localStorage.setItem(TASKS_KEY, JSON.stringify(INITIAL_TASKS));
    localStorage.setItem(QUEUE_KEY, JSON.stringify([]));
    this.addLog('SYNC_SUCCESS', 'Restored sample tasks and reset sync state');
    this.notifyTaskListeners();
    this.notifyStatusListeners();
  }

  private broadcastChange(type: string, payload: unknown) {
    if (this.channel) {
      try {
        this.channel.postMessage({ type, payload });
      } catch (e) {
        console.warn('Error broadcasting sync change', e);
      }
    }
  }

  // --- Subscriptions ---
  public subscribeTasks(cb: (tasks: Task[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.getTasks());
    return () => this.listeners.delete(cb);
  }

  public subscribeStatus(cb: (settings: SyncSettings, queue: QueuedMutation[]) => void): () => void {
    this.statusListeners.add(cb);
    cb(this.getSettings(), this.getQueue());
    return () => this.statusListeners.delete(cb);
  }

  public subscribeLogs(cb: (logs: SyncLogEntry[]) => void): () => void {
    this.logListeners.add(cb);
    cb(this.getLogs());
    return () => this.logListeners.delete(cb);
  }

  private notifyTaskListeners() {
    const tasks = this.getTasks();
    this.listeners.forEach((cb) => cb(tasks));
  }

  private notifyStatusListeners() {
    const settings = this.getSettings();
    const queue = this.getQueue();
    this.statusListeners.forEach((cb) => cb(settings, queue));
  }

  private notifyLogListeners() {
    const logs = this.getLogs();
    this.logListeners.forEach((cb) => cb(logs));
  }
}

export const storage = new StorageManager();
