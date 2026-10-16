import React from 'react';
import {
  Award,
  CalendarCheck2,
  Dices,
  Download,
  FileSpreadsheet,
  Gamepad2,
  HeartHandshake,
  LayoutDashboard,
  Menu,
  MessageSquareQuote,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { UserRole } from '../types';

export interface TabItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  highlight?: boolean;
}

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  role: UserRole;
  unreadCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const teacherNavItems: TabItem[] = [
  { id: 'overview', name: 'Tổng quan lớp học', icon: LayoutDashboard },
  { id: 'students', name: 'Quản lý học sinh', icon: Users },
  { id: 'attendance', name: 'Điểm danh hàng ngày', icon: CalendarCheck2 },
  { id: 'points', name: 'Tích điểm & Đổi quà', icon: Award },
  { id: 'random_picker', name: 'Vòng quay gọi tên', icon: Dices, highlight: true },
  { id: 'comments', name: 'Nhận xét Thông tư 27', icon: MessageSquareQuote },
  { id: 'games', name: 'Trò chơi tương tác', icon: Gamepad2 },
  { id: 'semester', name: 'Kết quả cuối kỳ (TT27)', icon: FileSpreadsheet },
  {
    id: 'parent_portal',
    name: 'Kết nối & Báo cáo PH',
    icon: HeartHandshake,
    badge: undefined,
  },
  { id: 'settings', name: 'Cài đặt hệ thống', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  role,
  unreadCount = 0,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const itemsWithBadge = teacherNavItems.map((item) => {
    if (item.id === 'parent_portal' && unreadCount > 0) {
      return { ...item, badge: unreadCount };
    }
    return item;
  });

  const renderNavContent = (isMobile: boolean = false) => (
    <div className="flex h-full flex-col justify-between p-3 sm:p-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 py-2 text-[11px] font-bold tracking-wider text-sky-800 uppercase">
          <span>{role === 'teacher' ? 'Bảng Điều Khiển Giáo Viên' : 'Cổng Thông Tin Phụ Huynh'}</span>
          {isMobile && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              title="Đóng menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="space-y-1">
          {itemsWithBadge.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (isMobile && onCloseMobile) {
                    onCloseMobile();
                  }
                }}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-200'
                    : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-600'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.highlight && !isActive && (
                    <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                  {item.badge !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? 'bg-white text-sky-700'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Download Zip & Banner */}
      <div className="mt-4 space-y-2.5">
        <a
          href="/edumate-source-code.zip"
          download="edumate-source-code.zip"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:from-emerald-600 hover:to-teal-700 transition"
          title="Tải toàn bộ mã nguồn ứng dụng .ZIP"
        >
          <Download className="h-4 w-4" />
          <span>Tải Mã Nguồn (.ZIP)</span>
        </a>

        <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/80 p-3 border border-sky-100 text-center">
          <div className="text-lg mb-0.5">🌟</div>
          <p className="text-xs font-bold text-sky-900">
            Thông tư 27/2020/TT-BGDĐT
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500 leading-relaxed">
            Chuẩn hóa đánh giá học sinh & tương tác toàn diện
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col border-r border-sky-100 bg-white">
        {renderNavContent(false)}
      </aside>

      {/* Mobile Drawer (Slide-out menu for mobile phone screens) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />

          {/* Drawer content */}
          <div className="relative flex w-4/5 max-w-xs flex-col bg-white shadow-2xl z-10 overflow-y-auto">
            {renderNavContent(true)}
          </div>
        </div>
      )}
    </>
  );
};

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenMoreMenu: () => void;
  unreadCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMoreMenu,
  unreadCount = 0,
}) => {
  const primaryMobileTabs = [
    { id: 'overview', name: 'Tổng quan', icon: LayoutDashboard },
    { id: 'attendance', name: 'Điểm danh', icon: CalendarCheck2 },
    { id: 'random_picker', name: 'Quay tên', icon: Dices },
    { id: 'games', name: 'Trò chơi', icon: Gamepad2 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-sky-100 bg-white/95 px-2 backdrop-blur-md shadow-lg md:hidden safe-bottom">
      {primaryMobileTabs.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-1 flex-col items-center justify-center py-1 transition ${
              isActive ? 'text-sky-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                isActive ? 'bg-sky-100 text-sky-600' : 'text-slate-400'
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] tracking-tight">{item.name}</span>
          </button>
        );
      })}

      {/* More / Menu Button */}
      <button
        onClick={onOpenMoreMenu}
        className="relative flex flex-1 flex-col items-center justify-center py-1 text-slate-500 hover:text-slate-800 transition"
      >
        <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Menu className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight font-medium">Menu</span>
      </button>
    </nav>
  );
};
