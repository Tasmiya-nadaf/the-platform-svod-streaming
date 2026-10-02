export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskCategory =
  | 'Pre-Production'
  | 'Script & Screenplay'
  | 'Casting'
  | 'Shooting & Set'
  | 'Post-Production'
  | 'Sound & Score'
  | 'Marketing & Release';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string; // ISO date string YYYY-MM-DD
  subtasks: Subtask[];
  tags: string[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  syncVersion: number;
  _pendingSync?: boolean; // Client-side indicator for uncommitted writes
  _fromCache?: boolean;    // Indicates if data came from local cache
}

export type QueueActionType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface QueuedMutation {
  id: string;
  action: QueueActionType;
  taskId: string;
  taskData?: Partial<Task>;
  timestamp: string;
  retryCount: number;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  type: 'ONLINE' | 'OFFLINE' | 'SYNC_START' | 'SYNC_SUCCESS' | 'SYNC_ERROR' | 'MUTATION_QUEUED' | 'CONFLICT_RESOLVED' | 'PEER_SYNC';
  message: string;
  details?: Record<string, unknown>;
}

export type ViewportMode = 'desktop' | 'ios' | 'android';
