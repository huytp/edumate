import {
  AppSettings,
  AttendanceRecord,
  DailyComment,
  ParentMessage,
  PointHistory,
  RewardRedemption,
  SemesterResult,
  Student,
} from '../types';

const API_BASE = (import.meta.env?.VITE_API_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'edumate_auth_token';

export type AccountRole = 'teacher' | 'parent';

export interface Account {
  id: number;
  role: AccountRole;
  name: string;
  email: string;
  phone?: string;
  classCode?: string;
}

export interface LinkedChild {
  id: number;
  name: string;
  code: string;
  avatar?: string;
  className?: string;
  schoolName?: string;
  teacherName?: string;
}

export interface ChildPortalData {
  settings: Partial<AppSettings>;
  student: Student;
  attendance: AttendanceRecord[];
  comments: DailyComment[];
  semesterResults: SemesterResult[];
  pointsHistory: PointHistory[];
  redemptions: RewardRedemption[];
  messages: ParentMessage[];
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const readToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const writeToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage unavailable (private mode): the session lasts until the tab is closed.
  }
};

let token = readToken();

// Called when the server rejects the token (expired / logged out elsewhere).
let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

export const apiRequest = async (path: string, init: RequestInit = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (res.status === 401 && token) {
    token = null;
    writeToken(null);
    onUnauthorized();
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || `${init.method || 'GET'} ${path} failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
};

const startSession = (data: { token: string; user: Account }) => {
  token = data.token;
  writeToken(token);
  return data.user;
};

export const authApi = {
  hasToken: () => !!token,

  register: async (payload: { role: AccountRole; name: string; email: string; phone?: string; password: string }) =>
    startSession(await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) })),

  login: async (email: string, password: string) =>
    startSession(await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })),

  me: async (): Promise<Account> => (await apiRequest('/auth/me')).user,

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'DELETE' });
    } finally {
      token = null;
      writeToken(null);
    }
  },
};

export const parentApi = {
  children: (): Promise<LinkedChild[]> => apiRequest('/parent/children'),

  linkChild: (classCode: string, studentCode: string, password: string): Promise<LinkedChild> =>
    apiRequest('/parent/children', { method: 'POST', body: JSON.stringify({ classCode, studentCode, password }) }),

  unlinkChild: (childId: number) => apiRequest(`/parent/children/${childId}`, { method: 'DELETE' }),

  childData: (childId: number): Promise<ChildPortalData> => apiRequest(`/parent/children/${childId}`),

  sendMessage: (childId: number, content: string): Promise<ParentMessage> =>
    apiRequest(`/parent/children/${childId}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
};
