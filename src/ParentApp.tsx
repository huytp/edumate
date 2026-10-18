import React, { useCallback, useEffect, useState } from 'react';
import { GraduationCap, Loader2, Lock } from 'lucide-react';
import { ParentChildView } from './components/views/ParentChildView';
import { AppSettings, ParentMessage } from './types';
import { authApi, ChildPortalData, parentApi, setUnauthorizedHandler } from './utils/api';
import { soundManager } from './utils/audio';
import { DEFAULT_SETTINGS } from './utils/storage';

type PortalState =
  | { status: 'loading' }
  | { status: 'guest' }
  | { status: 'error' }
  | { status: 'ready'; portal: ChildPortalData };

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-400 focus:border-indigo-400 focus:outline-hidden focus:ring-4 focus:ring-indigo-100';

const Header: React.FC = () => (
  <header className="border-b border-slate-200 bg-white">
    <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
        <GraduationCap className="h-5 w-5" />
      </div>
      <div>
        <div className="text-sm font-bold text-slate-800">EduMate</div>
        <div className="text-xs text-slate-500">Cổng thông tin phụ huynh</div>
      </div>
    </div>
  </header>
);

// The class code comes from the link the teacher shares (?lop=); it is asked for only when missing.
const LoginScreen: React.FC<{ onSignedIn: () => void }> = ({ onSignedIn }) => {
  const linkClassCode = new URLSearchParams(window.location.search).get('lop')?.trim() ?? '';
  const [classCode, setClassCode] = useState(linkClassCode);
  const [studentCode, setStudentCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await parentApi.login(classCode.trim(), studentCode.trim(), password.trim());
      soundManager.playSuccess();
      onSignedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không kết nối được máy chủ. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800">
      <Header />
      <main className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 md:grid-cols-2 md:py-20">
        <section className="space-y-6">
          <span className="inline-block rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700">
            Theo dõi hành trình học tập của con
          </span>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Mỗi ngày đến lớp, phụ huynh đều nắm rõ.
          </h1>
          <p className="text-base leading-relaxed text-slate-600">
            Xem nhận xét của giáo viên, điểm danh, điểm thưởng và kết quả trò chơi của riêng con. Thông tin được cập nhật
            từ lớp học của giáo viên.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Nhận xét hàng ngày', 'Chuyên cần', 'Điểm thưởng'].map((label) => (
              <span key={label} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-indigo-700 shadow-xs">
                ✦ {label}
              </span>
            ))}
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-indigo-100/60 sm:p-8"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Xem thông tin của con</h2>
            <p className="mt-1 text-sm text-slate-500">Nhập mã học sinh và mật khẩu giáo viên đã cung cấp.</p>
          </div>

          {!linkClassCode && (
            <label className="block space-y-2">
              <span className="text-sm font-bold text-slate-800">Mã lớp</span>
              <input
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                required
                placeholder="Mã lớp (6 ký tự)"
                className={`${inputClass} uppercase placeholder:normal-case`}
              />
            </label>
          )}

          <label className="block space-y-2">
            <span className="text-sm font-bold text-slate-800">Mã học sinh</span>
            <input
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              required
              autoComplete="username"
              placeholder="Ví dụ: HS001"
              className={`${inputClass} uppercase placeholder:normal-case`}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-bold text-slate-800">Mật khẩu</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Mật khẩu do giáo viên cấp"
              className={inputClass}
            />
          </label>

          {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-base font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Xem kết quả học tập
          </button>
        </form>
      </main>
    </div>
  );
};

// Parent page (/phu-huynh): sign in with the student's code and password, then see that child's portal.
export default function ParentApp() {
  const [state, setState] = useState<PortalState>(() =>
    authApi.hasToken() ? { status: 'loading' } : { status: 'guest' }
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      setState({ status: 'ready', portal: await parentApi.childData() });
    } catch (error) {
      console.error(error);
      setState(authApi.hasToken() ? { status: 'error' } : { status: 'guest' });
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setState({ status: 'guest' }));
    if (authApi.hasToken()) load();
  }, [load]);

  const portal = state.status === 'ready' ? state.portal : null;
  const settings: AppSettings = { ...DEFAULT_SETTINGS, ...portal?.settings };

  useEffect(() => {
    if (!portal) return;
    soundManager.setEnabled(
      settings.soundEffectsEnabled,
      settings.speechEnabled,
      settings.speechRate,
      settings.speechPitch ?? 1.0,
      settings.preferredVoiceURI ?? ''
    );
  }, [portal]); // eslint-disable-line react-hooks/exhaustive-deps

  const logout = async () => {
    await parentApi.logout().catch(() => {});
    setState({ status: 'guest' });
  };

  // The view builds the whole message; the server only takes the content and fills in the rest.
  const handleSendMessage = async (msg: ParentMessage) => {
    try {
      const saved = await parentApi.sendMessage(msg.content);
      setState((prev) =>
        prev.status === 'ready' ? { ...prev, portal: { ...prev.portal, messages: [saved, ...prev.portal.messages] } } : prev
      );
    } catch {
      alert('Gửi tin nhắn thất bại. Vui lòng thử lại.');
    }
  };

  if (state.status === 'guest') return <LoginScreen onSignedIn={load} />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header />
      <main className="mx-auto max-w-5xl p-4">
        {portal ? (
          <ParentChildView
            student={portal.student}
            allAttendance={portal.attendance}
            allComments={portal.comments}
            allResults={portal.semesterResults}
            allMessages={portal.messages}
            allPointsHistory={portal.pointsHistory}
            allRedemptions={portal.redemptions}
            settings={settings}
            onSendMessage={handleSendMessage}
            onLogout={logout}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 py-20 text-sm text-slate-500">
            {state.status === 'error' ? (
              <>
                <p className="font-semibold text-rose-600">Không tải được dữ liệu. Vui lòng thử lại.</p>
                <button onClick={load} className="rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white">
                  Thử lại
                </button>
              </>
            ) : (
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
