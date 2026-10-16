import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, KeyRound, Link2, Loader2, LogOut, School, User } from 'lucide-react';
import { ParentChildView } from './components/views/ParentChildView';
import { AppSettings, ParentMessage } from './types';
import { Account, ChildPortalData, LinkedChild, parentApi } from './utils/api';
import { soundManager } from './utils/audio';
import { DEFAULT_SETTINGS } from './utils/storage';

interface ParentAppProps {
  account: Account;
  onLogout: () => void;
}

const inputClass =
  'w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-200';

// Parent accounts: link children with the codes handed out by the teacher, then view each child's portal.
export default function ParentApp({ account, onLogout }: ParentAppProps) {
  const [children, setChildren] = useState<LinkedChild[] | null>(null);
  const [activeChild, setActiveChild] = useState<LinkedChild | null>(null);
  const [portal, setPortal] = useState<ChildPortalData | null>(null);
  const [loadError, setLoadError] = useState('');

  const [classCode, setClassCode] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linking, setLinking] = useState(false);

  const openChild = useCallback(async (child: LinkedChild) => {
    setActiveChild(child);
    setPortal(null);
    setLoadError('');
    try {
      setPortal(await parentApi.childData(child.id));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Không tải được dữ liệu.');
    }
  }, []);

  useEffect(() => {
    parentApi
      .children()
      .then((list) => {
        setChildren(list);
        if (list.length === 1) openChild(list[0]);
      })
      .catch(() => setLoadError('Không tải được danh sách con. Vui lòng thử lại.'));
  }, [openChild]);

  const settings: AppSettings = { ...DEFAULT_SETTINGS, ...portal?.settings };

  useEffect(() => {
    soundManager.setEnabled(
      settings.soundEffectsEnabled,
      settings.speechEnabled,
      settings.speechRate,
      settings.speechPitch ?? 1.3,
      settings.preferredVoiceURI ?? ''
    );
  }, [portal]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError('');
    setLinking(true);
    try {
      const child = await parentApi.linkChild(classCode.trim(), studentCode.trim(), studentPassword.trim());
      setChildren((prev) => [...(prev ?? []).filter((c) => c.id !== child.id), child]);
      setClassCode('');
      setStudentCode('');
      setStudentPassword('');
      soundManager.playSuccess();
      openChild(child);
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'Không liên kết được.');
    } finally {
      setLinking(false);
    }
  };

  // The view builds the whole message; the server only takes the content and fills in the rest.
  const handleSendMessage = async (msg: ParentMessage) => {
    if (!activeChild) return;
    try {
      const saved = await parentApi.sendMessage(activeChild.id, msg.content);
      setPortal((prev) => (prev ? { ...prev, messages: [saved, ...prev.messages] } : prev));
    } catch {
      alert('Gửi tin nhắn thất bại. Vui lòng thử lại.');
    }
  };

  if (activeChild) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur">
          <button
            onClick={() => {
              setActiveChild(null);
              setPortal(null);
            }}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Danh sách con
          </button>
          <span className="text-xs text-slate-500 truncate">{account.name}</span>
        </header>
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
              onLogout={onLogout}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-20 text-sm text-slate-500">
              {loadError ? (
                <>
                  <p className="font-semibold text-rose-600">{loadError}</p>
                  <button onClick={() => openChild(activeChild)} className="rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white">
                    Thử lại
                  </button>
                </>
              ) : (
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-4">
      <div className="mx-auto max-w-lg space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-slate-800">Xin chào, {account.name}</h1>
            <p className="text-xs text-slate-500">Cổng thông tin phụ huynh EduMate</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
          >
            <LogOut className="h-3.5 w-3.5" />
            Đăng xuất
          </button>
        </div>

        {children === null ? (
          <div className="flex justify-center py-10">
            {loadError ? (
              <p className="text-sm font-semibold text-rose-600">{loadError}</p>
            ) : (
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            )}
          </div>
        ) : (
          children.length > 0 && (
            <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-xs space-y-2">
              <h2 className="text-sm font-bold text-slate-800">Con của bạn</h2>
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => openChild(child)}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
                >
                  {child.avatar?.startsWith('data:') ? (
                    <img src={child.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl">{child.avatar || '🧒'}</span>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-800">{child.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {child.code} • {child.className} • {child.schoolName}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        )}

        <form onSubmit={handleLink} className="rounded-2xl border border-sky-100 bg-white p-4 shadow-xs space-y-3">
          <div>
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <Link2 className="h-4 w-4 text-sky-600" />
              {children?.length ? 'Liên kết thêm con' : 'Liên kết với con của bạn'}
            </h2>
            <p className="text-[11px] text-slate-500">Nhập các thông tin do giáo viên chủ nhiệm cung cấp.</p>
          </div>

          <div className="relative">
            <School className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              required
              placeholder="Mã lớp (6 ký tự)"
              className={`${inputClass} uppercase placeholder:normal-case`}
            />
          </div>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              required
              placeholder="Mã học sinh, ví dụ HS001"
              className={`${inputClass} uppercase placeholder:normal-case`}
            />
          </div>
          <div className="relative">
            <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="password"
              value={studentPassword}
              onChange={(e) => setStudentPassword(e.target.value)}
              required
              placeholder="Mật khẩu học sinh"
              className={inputClass}
            />
          </div>

          {linkError && <p className="text-xs font-medium text-rose-600">{linkError}</p>}

          <button
            type="submit"
            disabled={linking}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-sm font-bold text-white shadow-sm hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60"
          >
            {linking && <Loader2 className="h-4 w-4 animate-spin" />}
            Liên kết
          </button>
        </form>
      </div>
    </div>
  );
}
