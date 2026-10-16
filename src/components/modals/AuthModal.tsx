import React, { useState } from 'react';
import {
  CheckCircle2,
  HeartHandshake,
  KeyRound,
  User,
  X,
} from 'lucide-react';
import { AppSettings, Student } from '../../types';
import { soundManager } from '../../utils/audio';
import { storageService } from '../../utils/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  students: Student[];
  onLoginAsParent: (student: Student) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  settings,
  students,
  onLoginAsParent,
}) => {

  // Parent form state
  const [parentCode, setParentCode] = useState('');
  const [parentPass, setParentPass] = useState('');
  const [parentError, setParentError] = useState('');

  if (!isOpen) return null;

  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = parentCode.trim().toUpperCase();
    const student = students.find((s) => s.code.toUpperCase() === cleanCode);

    if (!student) {
      setParentError(`Không tìm thấy học sinh với mã "${cleanCode}". Vui lòng kiểm tra lại.`);
      return;
    }

    if (student.password && student.password !== parentPass.trim()) {
      setParentError('Mật khẩu không chính xác. (Mặc định cho phụ huynh là 123)');
      return;
    }

    // Success
    storageService.addLoginLog(student);
    soundManager.playSuccess();
    onLoginAsParent(student);
    setParentCode('');
    setParentPass('');
    setParentError('');
    onClose();
  };

  const handleQuickParentPick = (student: Student) => {
    storageService.addLoginLog(student);
    soundManager.playSuccess();
    onLoginAsParent(student);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-sky-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-sky-50/70 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white font-bold">
              {settings.appLogo || '🎒'}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Xem với vai trò Phụ huynh</h3>
              <p className="text-xs text-slate-500">EduMate – {settings.className}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <form onSubmit={handleParentSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã số học sinh (của con)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={parentCode}
                    onChange={(e) => {
                      setParentCode(e.target.value);
                      setParentError('');
                    }}
                    placeholder="Ví dụ: HS001, HS002..."
                    className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm uppercase placeholder:normal-case focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu đăng nhập
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={parentPass}
                    onChange={(e) => {
                      setParentPass(e.target.value);
                      setParentError('');
                    }}
                    placeholder="Mật khẩu phụ huynh (Mặc định: 123)"
                    className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              </div>

              {parentError && (
                <p className="text-xs text-rose-500 font-medium">{parentError}</p>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-xs font-bold text-white shadow-sm hover:from-emerald-600 hover:to-teal-700 transition"
              >
                Đăng nhập xem thông tin con
              </button>
            </form>

            {/* Quick test student picker for convenience */}
            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Hoặc chọn nhanh học sinh để thử:
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {students.slice(0, 6).map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => handleQuickParentPick(student)}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 text-xs hover:border-emerald-200 hover:bg-emerald-50/60 transition group text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{student.avatar}</span>
                      <div>
                        <span className="font-semibold text-slate-800 group-hover:text-emerald-800">
                          {student.name}
                        </span>
                        <span className="ml-1 text-[11px] text-slate-400 font-mono">
                          ({student.code})
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-100/60 px-1.5 py-0.5 rounded">
                      Đăng nhập
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
