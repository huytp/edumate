import React from 'react';
import {
  Bell,
  GraduationCap,
  HeartHandshake,
  LogOut,
  Menu,
  UserCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AppSettings, Student, UserRole } from '../types';
import { soundManager } from '../utils/audio';

interface NavbarProps {
  settings: AppSettings;
  role: UserRole;
  currentStudent: Student | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onSignOut: () => void; // ends the teacher's account session
  accountName: string;
  onUpdateSettings: (settings: AppSettings) => void;
  unreadMessagesCount: number;
  onNavigateToTab: (tabId: string) => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  role,
  currentStudent,
  onOpenAuthModal,
  onLogout,
  onSignOut,
  accountName,
  onUpdateSettings,
  unreadMessagesCount,
  onNavigateToTab,
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {
  const toggleSound = () => {
    const updated = {
      ...settings,
      soundEffectsEnabled: !settings.soundEffectsEnabled,
    };
    onUpdateSettings(updated);
    soundManager.setEnabled(
      updated.soundEffectsEnabled,
      updated.speechEnabled,
      updated.speechRate,
      updated.speechPitch ?? 1.0,
      updated.preferredVoiceURI ?? ''
    );
    if (updated.soundEffectsEnabled) {
      soundManager.playTick();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-sky-100 bg-white/95 px-3 sm:px-6 backdrop-blur-md shadow-xs">
      {/* Brand & Class Info */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Menu Toggle */}
        {role === 'teacher' && onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-200 text-sky-700 bg-sky-50 hover:bg-sky-100 transition md:hidden"
            title="Mở menu chức năng"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-lg sm:text-xl shadow-xs text-white font-bold select-none">
          {settings.appLogo || '🎒'}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-sm font-bold text-slate-800 tracking-tight sm:text-base truncate">
              EduMate
            </h1>
            <span className="rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold text-sky-700 shrink-0">
              {settings.className}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate max-w-[120px] xs:max-w-[170px] sm:max-w-xs">
            {settings.schoolName}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Sound toggle button */}
        <button
          onClick={toggleSound}
          title={settings.soundEffectsEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-sky-600"
        >
          {settings.soundEffectsEnabled ? (
            <Volume2 className="h-4 w-4 text-sky-600" />
          ) : (
            <VolumeX className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {/* Messages Notification for Teacher */}
        {role === 'teacher' && (
          <button
            onClick={() => onNavigateToTab('parent_portal')}
            className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-sky-600"
            title="Tin nhắn phản hồi từ phụ huynh"
          >
            <Bell className="h-4 w-4" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse">
                {unreadMessagesCount}
              </span>
            )}
          </button>
        )}

        {/* User Identity / Role Pill */}
        {role === 'teacher' ? (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-sky-50 px-2 sm:px-3 py-1 sm:py-1.5 border border-sky-200/80">
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-sky-600 text-white shrink-0">
                <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-sky-950 flex items-center gap-1">
                  <span className="truncate max-w-[100px]">{settings.teacherName}</span>
                  <span className="text-[10px] bg-sky-200 text-sky-800 px-1 rounded font-normal">Quản trị</span>
                </div>
                <div className="text-[10px] text-sky-600 truncate max-w-[140px]" title={accountName}>{accountName}</div>
              </div>
            </div>

            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-slate-200 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              title="Chuyển sang chế độ xem của Phụ huynh"
            >
              <HeartHandshake className="h-3.5 w-3.5 text-sky-600 shrink-0" />
              <span className="hidden md:inline">Phụ huynh xem</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Đăng xuất khỏi tài khoản giáo viên?')) onSignOut();
              }}
              className="flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
              title="Đăng xuất"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Đăng xuất</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-emerald-50 px-2 sm:px-3 py-1 sm:py-1.5 border border-emerald-200">
              <span className="text-base sm:text-lg">{currentStudent?.avatar || '👦🏻'}</span>
              <div className="text-left">
                <div className="text-xs font-bold text-emerald-950 truncate max-w-[100px] sm:max-w-none">
                  Bé: {currentStudent?.name}
                </div>
                <div className="text-[10px] text-emerald-700 font-medium hidden xs:block">
                  Mã: {currentStudent?.code}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
