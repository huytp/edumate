import React, { useState } from 'react';
import { GraduationCap, HeartHandshake, KeyRound, Loader2, Mail, Phone, User } from 'lucide-react';
import { Account, AccountRole, authApi } from '../../utils/api';

interface AuthScreenProps {
  onAuthenticated: (account: Account) => void;
}

const inputClass =
  'w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-200';

const Field: React.FC<{
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}> = ({ icon, label, children }) => (
  <div>
    <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-3 text-slate-400">{icon}</span>
      {children}
    </div>
  </div>
);

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<AccountRole>('teacher');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mode === 'register') {
      if (password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự.');
      if (password !== confirmPassword) return setError('Mật khẩu nhập lại không khớp.');
    }

    setSubmitting(true);
    try {
      const account =
        mode === 'login'
          ? await authApi.login(email.trim(), password)
          : await authApi.register({ role, name: name.trim(), email: email.trim(), phone: phone.trim(), password });
      onAuthenticated(account);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setError(
        message.includes('Email has already been taken')
          ? 'Email này đã được đăng ký. Vui lòng đăng nhập.'
          : message || 'Không kết nối được máy chủ. Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-sky-100 overflow-hidden">
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-2xl">🎒</div>
          <h1 className="text-lg font-extrabold text-slate-800">EduMate</h1>
          <p className="text-xs text-slate-500">Người bạn đồng hành của giáo viên & phụ huynh</p>
        </div>

        <div className="grid grid-cols-2 mx-6 p-1 gap-1 rounded-xl bg-slate-100">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`rounded-lg py-2 text-xs font-bold transition ${
                mode === m ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {mode === 'register' && (
            <>
              <div>
                <span className="block text-xs font-bold text-slate-700 mb-1">Bạn là</span>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { value: 'teacher', label: 'Giáo viên', icon: <GraduationCap className="h-4 w-4 text-sky-600" /> },
                      { value: 'parent', label: 'Phụ huynh', icon: <HeartHandshake className="h-4 w-4 text-emerald-600" /> },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition ${
                        role === option.value
                          ? 'border-sky-400 bg-sky-50 text-sky-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  {role === 'teacher'
                    ? 'Mỗi tài khoản giáo viên có một lớp học riêng.'
                    : 'Sau khi đăng ký, nhập Mã lớp, Mã học sinh và Mật khẩu do giáo viên cung cấp để xem thông tin của con.'}
                </p>
              </div>

              <Field icon={<User className="h-4 w-4" />} label="Họ và tên">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={role === 'teacher' ? 'Ví dụ: Cô Nguyễn Thị Hoa' : 'Ví dụ: Trần Văn Bình'}
                  className={inputClass}
                />
              </Field>
            </>
          )}

          <Field icon={<Mail className="h-4 w-4" />} label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="email@vidu.com"
              className={inputClass}
            />
          </Field>

          {mode === 'register' && (
            <Field icon={<Phone className="h-4 w-4" />} label="Số điện thoại (không bắt buộc)">
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            </Field>
          )}

          <Field icon={<KeyRound className="h-4 w-4" />} label="Mật khẩu">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder={mode === 'register' ? 'Ít nhất 6 ký tự' : ''}
              className={inputClass}
            />
          </Field>

          {mode === 'register' && (
            <Field icon={<KeyRound className="h-4 w-4" />} label="Nhập lại mật khẩu">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={inputClass}
              />
            </Field>
          )}

          {error && <p className="text-xs font-medium text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-sm font-bold text-white shadow-sm transition hover:from-sky-600 hover:to-blue-700 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>

          <p className="text-center text-xs text-slate-500">
            {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="font-bold text-sky-600 hover:underline"
            >
              {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};
