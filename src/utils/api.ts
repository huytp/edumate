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

// Parents open the class link (/phu-huynh?lop=<mã lớp>) and sign in with a student code, no account needed.
export const PARENT_PORTAL_PATH = '/phu-huynh';
export const isParentPortal = () => window.location.pathname.replace(/\/$/, '') === PARENT_PORTAL_PATH;
export const parentPortalUrl = (classCode: string) =>
  `${window.location.origin}${PARENT_PORTAL_PATH}?lop=${encodeURIComponent(classCode)}`;

// Ready-to-send message (Zalo) with the class link and one student's sign-in details.
export const parentInviteMessage = (student: Student, settings: AppSettings) =>
  `Kính gửi phụ huynh em ${student.name} (${settings.className} - ${settings.schoolName}).\n` +
  `Để xem thông tin học tập của con trên EduMate, phụ huynh mở link: ${parentPortalUrl(settings.classCode ?? '')}\n` +
  `- Mã học sinh: ${student.code}\n- Mật khẩu: ${student.password}\n` +
  `- Giáo viên chủ nhiệm: ${settings.teacherName}${settings.teacherPhone ? ` (${settings.teacherPhone})` : ''}`;

// A parent session is kept apart so a teacher can open the parent page in the same browser.
const TOKEN_KEY = isParentPortal() ? 'edumate_parent_token' : 'edumate_auth_token';

export type AccountRole = 'teacher' | 'parent';

export interface Account {
  id: number;
  role: AccountRole;
  name: string;
  email: string;
  phone?: string;
  classCode?: string;
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

const saveToken = (value: string | null) => {
  token = value;
  writeToken(value);
};

const startSession = (data: { token: string; user: Account }) => {
  saveToken(data.token);
  return data.user;
};

export const authApi = {
  hasToken: () => !!token,

  // Only teachers register; parents sign in with parentApi.login.
  register: async (payload: { name: string; email: string; phone?: string; password: string }) =>
    startSession(await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) })),

  login: async (email: string, password: string) =>
    startSession(await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })),

  me: async (): Promise<Account> => (await apiRequest('/auth/me')).user,

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'DELETE' });
    } finally {
      saveToken(null);
    }
  },
};

export const parentApi = {
  login: async (classCode: string, studentCode: string, password: string) => {
    const data = await apiRequest('/parent/session', {
      method: 'POST',
      body: JSON.stringify({ classCode, studentCode, password }),
    });
    saveToken(data.token);
  },

  logout: async () => {
    try {
      await apiRequest('/parent/session', { method: 'DELETE' });
    } finally {
      saveToken(null);
    }
  },

  childData: (): Promise<ChildPortalData> => apiRequest('/parent/child'),

  sendMessage: (content: string): Promise<ParentMessage> =>
    apiRequest('/parent/child/messages', { method: 'POST', body: JSON.stringify({ content }) }),
};
