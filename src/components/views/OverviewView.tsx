import React, { useState } from 'react';
import {
  Award,
  CalendarCheck2,
  ChevronRight,
  Dices,
  ExternalLink,
  Film,
  Gamepad2,
  GraduationCap,
  Headphones,
  HeartHandshake,
  Maximize2,
  MessageSquare,
  Music2,
  Play,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
  Volume2,
  X,
} from 'lucide-react';
import {
  AppSettings,
  AttendanceRecord,
  DailyComment,
  MusicItem,
  ParentMessage,
  PointHistory,
  Student,
} from '../../types';
import { getTodayDateStr } from '../../utils/storage';
import { soundManager } from '../../utils/audio';

interface OverviewViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  pointsHistory: PointHistory[];
  comments: DailyComment[];
  messages: ParentMessage[];
  settings: AppSettings;
  music: MusicItem[];
  onUpdateMusic: (music: MusicItem[]) => void;
  onNavigateToTab: (tabId: string) => void;
  onOpenQuickRandom: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  students,
  attendance,
  pointsHistory,
  comments,
  messages,
  settings,
  music,
  onUpdateMusic,
  onNavigateToTab,
  onOpenQuickRandom,
}) => {
  const todayStr = getTodayDateStr();

  // Music section states
  const [selectedMusicCategory, setSelectedMusicCategory] = useState<'all' | 'warmup' | 'english' | 'fun' | 'relax'>('all');
  const [playingMusic, setPlayingMusic] = useState<MusicItem | null>(null);
  const [isAddMusicModalOpen, setIsAddMusicModalOpen] = useState(false);
  const [musicToDelete, setMusicToDelete] = useState<MusicItem | null>(null);

  // New music form
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<'warmup' | 'english' | 'fun' | 'relax'>('warmup');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('🎵');

  // Attendance metrics for today
  const todayRecords = attendance.filter((r) => r.date === todayStr);
  const presentCount = todayRecords.filter((r) => r.status === 'present').length;
  const absentCount = todayRecords.filter((r) => r.status === 'excused' || r.status === 'unexcused').length;
  const lateCount = todayRecords.filter((r) => r.status === 'late').length;
  const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 100;

  // Unread messages
  const unreadMessages = messages.filter((m) => !m.isRead);

  // Top 5 students by points
  const topStudents = [...students].sort((a, b) => b.points - a.points).slice(0, 5);

  // Total points
  const totalPoints = students.reduce((acc, curr) => acc + curr.points, 0);

  // Filtered music
  const filteredMusic = music.filter((m) => {
    if (selectedMusicCategory === 'all') return true;
    return m.category === selectedMusicCategory;
  });

  // Helper to extract YouTube video ID or construct embed URL
  const getEmbedUrl = (url: string): string => {
    try {
      if (url.includes('youtube.com/embed/')) {
        return url.includes('autoplay') ? url : `${url}?autoplay=1`;
      }
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`;
      }
      return url;
    } catch {
      return url;
    }
  };

  // Check if URL is YouTube
  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Play music handler
  const handlePlayMusic = (item: MusicItem) => {
    soundManager.playTick();
    setPlayingMusic(item);
    const updated = music.map((m) =>
      m.id === item.id ? { ...m, playCount: m.playCount + 1 } : m
    );
    onUpdateMusic(updated);
  };

  // Add new music submit
  const handleAddMusicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    const newItem: MusicItem = {
      id: `music-${Date.now()}`,
      title: newTitle.trim(),
      url: newUrl.trim(),
      category: newCategory,
      description: newDesc.trim() || 'Bài hát khởi động vui nhộn cho học sinh lớp 1',
      icon: newIcon || '🎵',
      playCount: 1,
    };

    onUpdateMusic([newItem, ...music]);
    setIsAddMusicModalOpen(false);
    setNewTitle('');
    setNewUrl('');
    setNewDesc('');
    soundManager.playSuccess();
  };

  // Delete music handler
  const confirmDeleteMusic = () => {
    if (!musicToDelete) return;
    const updated = music.filter((m) => m.id !== musicToDelete.id);
    onUpdateMusic(updated);
    if (playingMusic?.id === musicToDelete.id) {
      setPlayingMusic(null);
    }
    setMusicToDelete(null);
    soundManager.playTick();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-6 text-white shadow-lg shadow-sky-600/10">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 text-9xl opacity-10 select-none">
          🎒
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>EduMate – Trợ lý giáo dục hiện đại</span>
          </div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Chào mừng {settings.teacherName}!
          </h2>
          <p className="mt-1.5 text-sm text-sky-100/90 leading-relaxed">
            Hôm nay lớp {settings.className} có {students.length} học sinh. Chúc cô và các con có một ngày học tập hứng khởi và tràn đầy năng lượng tích cực!
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenQuickRandom}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-900 shadow-md hover:bg-amber-300 transition active:scale-95"
            >
              <Dices className="h-4 w-4" />
              Quay gọi tên ngẫu nhiên
            </button>
            <button
              onClick={() => onNavigateToTab('attendance')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/25 transition active:scale-95"
            >
              <CalendarCheck2 className="h-4 w-4" />
              Điểm danh hôm nay
            </button>
            <button
              onClick={() => onNavigateToTab('games')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/25 transition active:scale-95"
            >
              <Gamepad2 className="h-4 w-4" />
              Mở trò chơi tương tác
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigateToTab('students')}
          className="group cursor-pointer rounded-2xl border border-sky-100 bg-white p-5 shadow-xs transition hover:shadow-md hover:border-sky-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Sĩ số lớp</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{students.length}</span>
            <span className="text-xs font-medium text-slate-500">học sinh</span>
          </div>
          <p className="mt-1 text-[11px] text-sky-600 font-medium flex items-center gap-1">
            Xem danh sách <ChevronRight className="h-3 w-3" />
          </p>
        </div>

        {/* Attendance Rate */}
        <div
          onClick={() => onNavigateToTab('attendance')}
          className="group cursor-pointer rounded-2xl border border-sky-100 bg-white p-5 shadow-xs transition hover:shadow-md hover:border-sky-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Chuyên cần hôm nay</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{attendanceRate}%</span>
            <span className="text-xs text-slate-500">({presentCount}/{students.length})</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {absentCount > 0 ? `${absentCount} vắng` : 'Đủ học sinh'} • {lateCount > 0 ? `${lateCount} muộn` : 'Đúng giờ'}
          </p>
        </div>

        {/* Total Points Awarded */}
        <div
          onClick={() => onNavigateToTab('points')}
          className="group cursor-pointer rounded-2xl border border-sky-100 bg-white p-5 shadow-xs transition hover:shadow-md hover:border-sky-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Tổng điểm thi đua</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{totalPoints}</span>
            <span className="text-xs font-medium text-slate-500">điểm</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-600 font-medium flex items-center gap-1">
            Bảng xếp hạng <ChevronRight className="h-3 w-3" />
          </p>
        </div>

        {/* Feedback Messages */}
        <div
          onClick={() => onNavigateToTab('parent_portal')}
          className="group cursor-pointer rounded-2xl border border-sky-100 bg-white p-5 shadow-xs transition hover:shadow-md hover:border-sky-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Tin nhắn phụ huynh</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600">{messages.length}</span>
            {unreadMessages.length > 0 && (
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {unreadMessages.length} mới
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-purple-600 font-medium flex items-center gap-1">
            Xem phản hồi 2 chiều <ChevronRight className="h-3 w-3" />
          </p>
        </div>
      </div>

      {/* SECTION: ÂM NHẠC VUI NHỘN TRÊN BẢNG ĐIỀU KHIỂN */}
      <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-xs space-y-5">
        {/* Header of Music Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 text-white shadow-md">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">
                  Âm Nhạc Vui Nhộn & Video Khởi Động
                </h3>
                <span className="rounded-full bg-pink-100 text-pink-700 px-2.5 py-0.5 text-[10px] font-black uppercase">
                  Lớp 1 Thích Mê
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mở video khởi động thể dục, ca nhạc tiếng Anh và thư giãn trực tiếp ngay trên bảng điều khiển.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddMusicModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:from-sky-600 hover:to-blue-700 transition active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Thêm Video / Link Nhạc Mới
          </button>
        </div>

        {/* Filter categories */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => setSelectedMusicCategory('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              selectedMusicCategory === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🌟 Tất cả ({music.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedMusicCategory('warmup')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              selectedMusicCategory === 'warmup'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
            }`}
          >
            🏃 Khởi động thể dục ({music.filter((m) => m.category === 'warmup').length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedMusicCategory('english')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              selectedMusicCategory === 'english'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            🗣️ Tiếng Anh vui nhộn ({music.filter((m) => m.category === 'english').length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedMusicCategory('fun')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              selectedMusicCategory === 'fun'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            🪘 Đồng dao & Trò chơi ({music.filter((m) => m.category === 'fun').length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedMusicCategory('relax')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              selectedMusicCategory === 'relax'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            🌿 Thư giãn giữa giờ ({music.filter((m) => m.category === 'relax').length})
          </button>
        </div>

        {/* Music Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMusic.map((item) => {
            const isYt = isYouTubeUrl(item.url);

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-sky-300 hover:shadow-md transition"
              >
                <div>
                  {/* Top bar with icon and category */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-xl border border-sky-100">
                        {item.icon || '🎵'}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                          item.category === 'warmup'
                            ? 'bg-pink-100 text-pink-700'
                            : item.category === 'english'
                            ? 'bg-purple-100 text-purple-700'
                            : item.category === 'fun'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.category === 'warmup'
                          ? 'Khởi động'
                          : item.category === 'english'
                          ? 'Tiếng Anh'
                          : item.category === 'fun'
                          ? 'Đồng dao'
                          : 'Thư giãn'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMusicToDelete(item)}
                      className="rounded-lg p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Xóa bài hát / video này"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-sky-600 transition leading-snug">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {item.description || 'Giai điệu vui tươi giúp học sinh thư giãn và năng lượng.'}
                  </p>
                </div>

                {/* Bottom Action buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <Music2 className="h-3 w-3 text-sky-500" />
                    <span>{item.playCount} lượt mở</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Open original link in new tab */}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition"
                      title="Mở liên kết gốc trong tab mới"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Tab mới
                    </a>

                    {/* Play directly in Theater Modal */}
                    <button
                      type="button"
                      onClick={() => handlePlayMusic(item)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:from-pink-600 hover:to-rose-700 active:scale-95 transition"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Phát ngay
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top 5 Leaderboard Column */}
        <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600 font-bold">
                ⭐
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Bảng Vinh Danh Top Đầu</h3>
            </div>
            <button
              onClick={() => onNavigateToTab('points')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              Tất cả
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {topStudents.map((student, idx) => (
              <div
                key={student.id}
                className="flex items-center justify-between rounded-xl bg-slate-50/70 p-3 hover:bg-sky-50 transition border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${
                      idx === 0
                        ? 'bg-amber-400 text-amber-950 shadow-xs'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-800'
                        : idx === 2
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className="text-2xl">{student.avatar}</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{student.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{student.code}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-extrabold text-amber-600 flex items-center gap-1 justify-end">
                    <span>{student.points}</span>
                    <span className="text-[10px]">pts</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {student.stars} ⭐ sao
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Circular 27 & Quick Actions Hub */}
        <div className="space-y-6 lg:col-span-2">
          {/* Quick Hub Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* TT27 Card */}
            <div
              onClick={() => onNavigateToTab('comments')}
              className="cursor-pointer rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/50 to-white p-5 shadow-xs transition hover:border-sky-300 hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Nhận xét Thông tư 27</h4>
                  <p className="text-[11px] text-slate-500">Mẫu sẵn chuẩn Bộ Giáo dục</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đánh giá nhanh Môn học, Năng lực & Phẩm chất chỉ với 1 click. Copy trực tiếp hoặc xuất báo cáo.
              </p>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold text-sky-600">
                <span>{comments.length} nhận xét đã lưu</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>

            {/* Semester Evaluation Card */}
            <div
              onClick={() => onNavigateToTab('semester')}
              className="cursor-pointer rounded-2xl border border-sky-100 bg-gradient-to-br from-emerald-50/50 to-white p-5 shadow-xs transition hover:border-emerald-300 hover:shadow-md"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Đánh giá Định kỳ Học kỳ</h4>
                  <p className="text-[11px] text-slate-500">Xuất biểu mẫu Word & Excel</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bảng điểm tổng hợp, danh hiệu Học sinh Xuất sắc, Tiêu biểu theo đúng mẫu quyết định TT27.
              </p>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold text-emerald-600">
                <span>Xuất file Word & Excel</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Recent Inquiries & Activity */}
          <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-sky-600" />
                Phản hồi gần nhất từ Phụ Huynh
              </h3>
              <button
                onClick={() => onNavigateToTab('parent_portal')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700"
              >
                Mở hòm thư
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {messages.slice(0, 3).map((msg) => (
                <div key={msg.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {msg.parentName} ({msg.studentName})
                    </span>
                    <span className="text-[10px] text-slate-400">{msg.date}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-1 italic">
                    "{msg.content}"
                  </p>
                  {msg.reply ? (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Cô đã trả lời: "{msg.reply}"
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Chờ cô phản hồi
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* THEATER VIDEO / MUSIC PLAYER MODAL */}
      {playingMusic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl space-y-0">
            {/* Player Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/80 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{playingMusic.icon || '🎵'}</span>
                <div>
                  <h4 className="text-sm font-bold truncate max-w-xs sm:max-w-md">
                    {playingMusic.title}
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Phát trực tiếp cho học sinh lớp {settings.className}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={playingMusic.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-slate-700/80 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition flex items-center gap-1"
                  title="Mở trên YouTube / nguồn gốc"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Mở ngoài</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPlayingMusic(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                  title="Đóng trình phát"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Embedded Screen / Iframe */}
            <div className="relative aspect-video w-full bg-black">
              {isYouTubeUrl(playingMusic.url) ? (
                <iframe
                  src={getEmbedUrl(playingMusic.url)}
                  title={playingMusic.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center space-y-4">
                  <Film className="h-16 w-16 text-sky-400 animate-pulse" />
                  <div>
                    <h5 className="font-bold text-base">{playingMusic.title}</h5>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">
                      Liên kết âm nhạc ngoài. Bạn có thể mở trực tiếp để phát cho học sinh nghe.
                    </p>
                  </div>
                  <a
                    href={playingMusic.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:from-pink-600 hover:to-rose-700 transition"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Mở Liên Kết Trực Tiếp
                  </a>
                </div>
              )}
            </div>

            {/* Player Footer Description */}
            <div className="px-5 py-3 bg-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
              <span className="truncate mr-4">{playingMusic.description}</span>
              <button
                type="button"
                onClick={() => setPlayingMusic(null)}
                className="text-sky-400 hover:text-sky-300 font-bold shrink-0"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THÊM VIDEO / LINK NHẠC MỚI */}
      {isAddMusicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                  <Music2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Thêm Video / Bài Hát Vui Nhộn</h3>
                  <p className="text-[11px] text-slate-500">Dán link YouTube hoặc video khởi động cho học sinh lớp 1</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddMusicModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddMusicSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên bài hát / Video: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tập Tầm Vông vui nhộn, Vũ điệu rửa tay..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đường link Video / YouTube: *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=... hoặc link video"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs focus:border-sky-500 focus:outline-hidden font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Hỗ trợ link YouTube xem trực tiếp hoặc các link video web trường học.
                </span>
              </div>

              {/* Category & Icon */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thể loại:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs bg-white focus:border-sky-500 focus:outline-hidden"
                  >
                    <option value="warmup">🏃 Khởi động thể dục</option>
                    <option value="english">🗣️ Tiếng Anh vui nhộn</option>
                    <option value="fun">🪘 Đồng dao & Trò chơi</option>
                    <option value="relax">🌿 Thư giãn giữa giờ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Biểu tượng Icon:
                  </label>
                  <div className="flex gap-1.5">
                    {['🎵', '🏃', '🗣️', '🦈', '🎒', '🐣', '🪘', '⭐'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewIcon(emoji)}
                        className={`h-9 w-9 rounded-xl text-base flex items-center justify-center transition ${
                          newIcon === emoji
                            ? 'bg-sky-500 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô tả / Lưu ý khi sử dụng:
                </label>
                <textarea
                  rows={2}
                  placeholder="Gợi ý hoạt động, cách hướng dẫn các em nhảy theo..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMusicModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:from-sky-600 hover:to-blue-700 transition"
                >
                  <Plus className="h-4 w-4" />
                  Lưu bài hát
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DELETE MUSIC */}
      {musicToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <Trash2 className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Xác nhận xóa bài hát / video
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Bạn có chắc chắn muốn xóa bài hát <strong className="text-slate-800">"{musicToDelete.title}"</strong> khỏi danh sách âm nhạc của lớp không?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMusicToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmDeleteMusic}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 active:scale-95 transition shadow-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Xóa bài hát
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
