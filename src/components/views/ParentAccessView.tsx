import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, ExternalLink, Eye, KeyRound, QrCode, UserCheck } from 'lucide-react';
import { AppSettings, Student } from '../../types';
import { parentInviteMessage, parentPortalUrl } from '../../utils/api';
import { soundManager } from '../../utils/audio';

interface ParentAccessViewProps {
  students: Student[];
  settings: AppSettings;
  onSwitchToParentView: (student: Student) => void;
}

const isImage = (avatar: string) => avatar.startsWith('data:image') || avatar.startsWith('http');

// The class link + QR that parents open, and each student's sign-in code and password.
export const ParentAccessView: React.FC<ParentAccessViewProps> = ({ students, settings, onSwitchToParentView }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const link = settings.classCode ? parentPortalUrl(settings.classCode) : '';

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    soundManager.playTick();
    setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white shadow-md sm:p-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
          <UserCheck className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Cổng phụ huynh</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100">
          Phụ huynh mở link riêng của lớp, nhập mã học sinh và mật khẩu để theo dõi thông tin của con trên điện thoại.
        </p>
      </div>

      <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 lg:grid-cols-[1fr_auto]">
        <div className="min-w-0 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Link dành riêng cho phụ huynh lớp này</h3>
            <p className="mt-1 text-sm text-slate-500">
              Gửi link hoặc mã QR cùng mã học sinh và mật khẩu riêng cho từng phụ huynh. Phụ huynh không cần tài khoản
              giáo viên.
            </p>
          </div>

          {link ? (
            <>
              <div className="break-all rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-indigo-700">
                {link}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => copy('link', link)}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  {copiedId === 'link' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedId === 'link' ? 'Đã sao chép' : 'Sao chép link'}
                </button>
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
                >
                  <ExternalLink className="h-4 w-4" />
                  Xem trang phụ huynh
                </a>
              </div>
            </>
          ) : (
            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Chưa có mã lớp. Vui lòng tải lại trang.
            </p>
          )}
        </div>

        {link && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-indigo-50 p-5">
            <div className="rounded-2xl bg-white p-3">
              <QRCodeSVG value={link} size={168} marginSize={0} />
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700">
              <QrCode className="h-4 w-4" />
              Quét để mở trên điện thoại
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
        <div>
          <h3 className="text-base font-extrabold text-slate-800">Mã đăng nhập của từng học sinh</h3>
          <p className="mt-1 text-sm text-slate-500">
            Chỉ gửi mã và mật khẩu của một học sinh cho phụ huynh tương ứng. Có thể đổi mật khẩu trong Quản lý học sinh.
          </p>
        </div>

        {students.length === 0 ? (
          <p className="text-sm text-slate-500">Lớp chưa có học sinh.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {students.map((student) => (
              <div key={student.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-100 text-2xl">
                  {isImage(student.avatar) ? (
                    <img src={student.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span>{student.avatar || '🧒'}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-slate-800">{student.name}</div>
                  <div className="text-xs text-slate-500">
                    Mã: <span className="font-bold text-slate-700">{student.code}</span>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-600">
                  <KeyRound className="h-3.5 w-3.5" />
                  {student.password || <em className="text-rose-500">chưa có</em>}
                </span>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => copy(student.id, parentInviteMessage(student, settings))}
                    disabled={!link || !student.password}
                    title="Sao chép tin nhắn gửi phụ huynh (Zalo)"
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-indigo-600 disabled:opacity-40"
                  >
                    {copiedId === student.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => onSwitchToParentView(student)}
                    title="Xem thử trang phụ huynh của em này"
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-indigo-600"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
