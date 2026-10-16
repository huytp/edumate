import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  Gift,
  History,
  Minus,
  Plus,
  Search,
  Sparkles,
  Star,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import {
  AppSettings,
  PointHistory,
  RewardItem,
  RewardRedemption,
  Student,
} from '../../types';
import { soundManager } from '../../utils/audio';
import { getTodayDateStr } from '../../utils/storage';

interface PointsRewardsViewProps {
  students: Student[];
  pointsHistory: PointHistory[];
  rewards: RewardItem[];
  redemptions: RewardRedemption[];
  settings: AppSettings;
  onUpdateStudents: (students: Student[]) => void;
  onUpdatePointsHistory: (history: PointHistory[]) => void;
  onUpdateRewards: (rewards: RewardItem[]) => void;
  onUpdateRedemptions: (redemptions: RewardRedemption[]) => void;
}

export const PointsRewardsView: React.FC<PointsRewardsViewProps> = ({
  students,
  pointsHistory,
  rewards,
  redemptions,
  settings,
  onUpdateStudents,
  onUpdatePointsHistory,
  onUpdateRewards,
  onUpdateRedemptions,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'store' | 'history'>('leaderboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Give points modal
  const [isGiveModalOpen, setIsGiveModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isBatchAll, setIsBatchAll] = useState(false);
  const [customDelta, setCustomDelta] = useState<number>(1);
  const [reason, setReason] = useState<string>('Phát biểu bài hăng hái');

  // New reward item modal
  const [isNewRewardModalOpen, setIsNewRewardModalOpen] = useState(false);
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardCost, setNewRewardCost] = useState(15);
  const [newRewardIcon, setNewRewardIcon] = useState('🎁');
  const [newRewardStock, setNewRewardStock] = useState(10);
  const [newRewardDesc, setNewRewardDesc] = useState('');

  const PRESET_REASONS = [
    { label: 'Phát biểu hăng hái', delta: 1, icon: '🙋‍♂️' },
    { label: 'Bài làm sạch đẹp, đúng hết', delta: 2, icon: '✨' },
    { label: 'Giúp đỡ bạn bè', delta: 1, icon: '🤝' },
    { label: 'Giải bài khó xuất sắc', delta: 3, icon: '💡' },
    { label: 'Giữ vệ sinh bàn học tốt', delta: 1, icon: '🧹' },
    { label: 'Chăm chỉ đọc sách', delta: 2, icon: '📖' },
    { label: 'Nhắc nhở mất trật tự', delta: -1, icon: '⚠️' },
  ];

  // Open modal for single student
  const handleOpenSingle = (student: Student) => {
    setSelectedStudent(student);
    setIsBatchAll(false);
    setCustomDelta(1);
    setReason('Phát biểu bài hăng hái');
    setIsGiveModalOpen(true);
  };

  // Open modal for all students
  const handleOpenBatch = () => {
    setSelectedStudent(null);
    setIsBatchAll(true);
    setCustomDelta(2);
    setReason('Cả lớp học tập chăm ngoan và tích cực');
    setIsGiveModalOpen(true);
  };

  // Submit points
  const handleSavePoints = (e: React.FormEvent) => {
    e.preventDefault();
    const today = getTodayDateStr();

    if (isBatchAll) {
      // Award all
      const updatedStudents = students.map((s) => ({
        ...s,
        points: Math.max(0, s.points + customDelta),
        stars: customDelta > 0 ? s.stars + 1 : s.stars,
      }));
      onUpdateStudents(updatedStudents);

      const newHistories: PointHistory[] = students.map((s) => ({
        id: `ph-${Date.now()}-${s.id}`,
        studentId: s.id,
        studentName: s.name,
        delta: customDelta,
        reason,
        date: today,
        timestamp: Date.now(),
      }));
      onUpdatePointsHistory([...newHistories, ...pointsHistory]);

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      soundManager.playApplause();
    } else if (selectedStudent) {
      // Award single
      const updatedStudents = students.map((s) =>
        s.id === selectedStudent.id
          ? {
              ...s,
              points: Math.max(0, s.points + customDelta),
              stars: customDelta > 0 ? s.stars + 1 : s.stars,
            }
          : s
      );
      onUpdateStudents(updatedStudents);

      const newHistory: PointHistory = {
        id: `ph-${Date.now()}`,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        delta: customDelta,
        reason,
        date: today,
        timestamp: Date.now(),
      };
      onUpdatePointsHistory([newHistory, ...pointsHistory]);

      if (customDelta > 0) {
        soundManager.playCoin();
      } else {
        soundManager.playTick();
      }
    }

    setIsGiveModalOpen(false);
  };

  // Redeem Reward for student
  const handleRedeemGift = (student: Student, reward: RewardItem) => {
    if (student.points < reward.pointsCost) {
      alert(`Em ${student.name} cần thêm ${reward.pointsCost - student.points} điểm để đổi món quà này!`);
      return;
    }

    if (reward.stock <= 0) {
      alert('Món quà này tạm thời đã hết hàng.');
      return;
    }

    // Deduct points
    const updatedStudents = students.map((s) =>
      s.id === student.id ? { ...s, points: s.points - reward.pointsCost } : s
    );
    onUpdateStudents(updatedStudents);

    // Deduct stock
    const updatedRewards = rewards.map((r) =>
      r.id === reward.id ? { ...r, stock: r.stock - 1 } : r
    );
    onUpdateRewards(updatedRewards);

    // Add redemption record
    const newRedemption: RewardRedemption = {
      id: `rd-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      rewardId: reward.id,
      rewardName: reward.name,
      pointsSpent: reward.pointsCost,
      date: getTodayDateStr(),
      status: 'delivered',
    };
    onUpdateRedemptions([newRedemption, ...redemptions]);

    confetti({ particleCount: 50, spread: 60 });
    soundManager.playSuccess();
    soundManager.speakSlowly(`Chúc mừng em ${student.name} đã đổi phần quà ${reward.name} nha!`, 'vi-VN');
  };

  // Add new reward to store
  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewardName.trim()) return;

    const newRw: RewardItem = {
      id: `rw-${Date.now()}`,
      name: newRewardName.trim(),
      pointsCost: newRewardCost,
      icon: newRewardIcon || '🎁',
      stock: newRewardStock,
      description: newRewardDesc.trim() || 'Phần quà động viên học tập',
    };
    onUpdateRewards([...rewards, newRw]);
    soundManager.playSuccess();
    setIsNewRewardModalOpen(false);
    setNewRewardName('');
    setNewRewardDesc('');
  };

  // Sorted students for leaderboard
  const sortedStudents = [...students].sort((a, b) => b.points - a.points);
  const filteredStudents = sortedStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Tích Điểm Thi Đua & Đổi Quà
          </h2>
          <p className="text-xs text-slate-500">
            Khen thưởng kịp thời, khích lệ tinh thần thi đua tích cực của học sinh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenBatch}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:from-amber-600 hover:to-orange-600 transition active:scale-95"
          >
            <Trophy className="h-4 w-4" />
            Thưởng Cả Lớp
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-sky-100 bg-white p-1 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'leaderboard'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trophy className="h-4 w-4" />
          Bảng Xếp Hạng ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('store')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'store'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Gift className="h-4 w-4" />
          Cửa Hàng Quà Tặng ({rewards.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="h-4 w-4" />
          Lịch Sử Tích Điểm ({pointsHistory.length})
        </button>
      </div>

      {/* TAB 1: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Top 2 Silver */}
            {sortedStudents[1] && (
              <div className="order-2 sm:order-1 rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-5 text-center shadow-xs">
                <div className="inline-block rounded-full bg-slate-200 px-3 py-1 text-xs font-extrabold text-slate-700 mb-2">
                  🥈 Hạng 2
                </div>
                <div className="text-4xl my-2">{sortedStudents[1].avatar}</div>
                <h4 className="font-extrabold text-slate-800 text-sm">{sortedStudents[1].name}</h4>
                <div className="text-xs text-amber-600 font-extrabold mt-1">
                  {sortedStudents[1].points} Điểm
                </div>
                <button
                  onClick={() => handleOpenSingle(sortedStudents[1])}
                  className="mt-3 w-full rounded-xl bg-sky-50 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100"
                >
                  + Tặng Điểm
                </button>
              </div>
            )}

            {/* Top 1 Gold Champion */}
            {sortedStudents[0] && (
              <div className="order-1 sm:order-2 rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-amber-50/70 to-white p-6 text-center shadow-md sm:-translate-y-2">
                <div className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3.5 py-1 text-xs font-extrabold text-amber-950 mb-2 shadow-xs">
                  👑 Quán Quân Hạng 1
                </div>
                <div className="text-5xl my-2">{sortedStudents[0].avatar}</div>
                <h4 className="font-extrabold text-slate-900 text-base">{sortedStudents[0].name}</h4>
                <div className="text-sm text-amber-600 font-black mt-1">
                  ⭐ {sortedStudents[0].points} Điểm ({sortedStudents[0].stars} Sao)
                </div>
                <button
                  onClick={() => handleOpenSingle(sortedStudents[0])}
                  className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2 text-xs font-bold text-white hover:from-amber-600 hover:to-orange-600 shadow-xs"
                >
                  + Thưởng Nóng
                </button>
              </div>
            )}

            {/* Top 3 Bronze */}
            {sortedStudents[2] && (
              <div className="order-3 sm:order-3 rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50/30 to-white p-5 text-center shadow-xs">
                <div className="inline-block rounded-full bg-amber-200 px-3 py-1 text-xs font-extrabold text-amber-900 mb-2">
                  🥉 Hạng 3
                </div>
                <div className="text-4xl my-2">{sortedStudents[2].avatar}</div>
                <h4 className="font-extrabold text-slate-800 text-sm">{sortedStudents[2].name}</h4>
                <div className="text-xs text-amber-600 font-extrabold mt-1">
                  {sortedStudents[2].points} Điểm
                </div>
                <button
                  onClick={() => handleOpenSingle(sortedStudents[2])}
                  className="mt-3 w-full rounded-xl bg-sky-50 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100"
                >
                  + Tặng Điểm
                </button>
              </div>
            )}
          </div>

          {/* Full List */}
          <div className="rounded-2xl border border-sky-100 bg-white shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm học sinh trong bảng xếp hạng..."
                  className="w-full rounded-xl border border-slate-200 py-1.5 pl-8 pr-3 text-xs focus:border-sky-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredStudents.map((student, idx) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50/80 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        idx === 0
                          ? 'bg-amber-400 text-amber-950 font-black'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-800 font-black'
                          : idx === 2
                          ? 'bg-amber-600 text-white font-black'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-2xl">{student.avatar}</span>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                        {student.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {student.code} • {student.stars} ⭐ sao
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-black text-amber-600">
                        {student.points} pts
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenSingle(student)}
                      className="inline-flex items-center gap-1 rounded-xl bg-sky-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-600 transition active:scale-95 shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Thưởng
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STORE */}
      {activeTab === 'store' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600">
              Danh mục quà đổi thưởng dành cho học sinh
            </span>
            <button
              onClick={() => setIsNewRewardModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-700"
            >
              <Plus className="h-4 w-4" />
              Thêm Quà Mới
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex flex-col justify-between rounded-2xl border border-sky-100 bg-white p-5 shadow-xs transition hover:border-sky-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">{reward.icon}</span>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-800">
                      {reward.pointsCost} Điểm
                    </span>
                  </div>
                  <h4 className="mt-3 font-bold text-slate-800 text-sm">{reward.name}</h4>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    {reward.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>Còn lại trong kho:</span>
                    <span className="font-bold text-slate-700">{reward.stock} phần</span>
                  </div>

                  {/* Quick student redemption picker */}
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const s = students.find((st) => st.id === e.target.value);
                      if (s) handleRedeemGift(s, reward);
                      e.target.value = '';
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-700 focus:border-sky-500 focus:outline-hidden"
                  >
                    <option value="" disabled>
                      Chọn học sinh để đổi quà này...
                    </option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.points} pts)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Redemptions log */}
          {redemptions.length > 0 && (
            <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-xs">
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-3">
                Lịch sử học sinh đã đổi quà ({redemptions.length})
              </h4>
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {redemptions.map((rd) => (
                  <div key={rd.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{rd.studentName}</span> đã đổi{' '}
                      <span className="font-bold text-sky-700">"{rd.rewardName}"</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="font-bold text-amber-600">-{rd.pointsSpent} pts</span>
                      <span>• {rd.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HISTORY */}
      {activeTab === 'history' && (
        <div className="rounded-2xl border border-sky-100 bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 font-bold text-xs text-slate-700">
            Lịch sử khen thưởng & cộng trừ điểm gần nhất ({pointsHistory.length})
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {pointsHistory.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between p-3.5 hover:bg-slate-50 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
                      h.delta > 0
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {h.delta > 0 ? `+${h.delta}` : h.delta}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">{h.studentName}</h5>
                    <p className="text-[11px] text-slate-500">{h.reason}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">{h.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Give Points Modal */}
      {isGiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-sky-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-sky-50/70 px-6 py-4">
              <h3 className="font-bold text-slate-800 text-sm">
                {isBatchAll ? 'Khen Thưởng Toàn Lớp' : `Tặng Điểm Cho Em: ${selectedStudent?.name}`}
              </h3>
              <button
                onClick={() => setIsGiveModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePoints} className="p-6 space-y-4">
              {/* Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Chọn nhanh lý do khen thưởng:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_REASONS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setReason(preset.label);
                        setCustomDelta(preset.delta);
                      }}
                      className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs transition ${
                        reason === preset.label
                          ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-200 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{preset.icon}</span>
                      <div className="truncate">
                        <div className="truncate">{preset.label}</div>
                        <span
                          className={`text-[10px] font-bold ${
                            preset.delta > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {preset.delta > 0 ? `+${preset.delta}` : preset.delta} điểm
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Delta */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điểm thưởng / trừ
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomDelta(customDelta - 1)}
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={customDelta}
                      onChange={(e) => setCustomDelta(Number(e.target.value))}
                      className="w-full text-center font-bold text-base border border-slate-300 rounded-lg py-1.5 focus:border-sky-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomDelta(customDelta + 1)}
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lý do cụ thể
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    placeholder="Nhập lý do..."
                    className="w-full rounded-lg border border-slate-300 py-1.5 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGiveModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:from-sky-600 hover:to-blue-700"
                >
                  Xác nhận tặng {customDelta > 0 ? `+${customDelta}` : customDelta} điểm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Reward Modal */}
      {isNewRewardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-sky-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-sky-50/70 px-6 py-4">
              <h3 className="font-bold text-slate-800 text-sm">Thêm Món Quà Mới Vào Cửa Hàng</h3>
              <button
                onClick={() => setIsNewRewardModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReward} className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên phần quà *
                </label>
                <input
                  type="text"
                  value={newRewardName}
                  onChange={(e) => setNewRewardName(e.target.value)}
                  placeholder="Ví dụ: Hộp bút chì màu, Thẻ miễn bài..."
                  required
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Biểu tượng</label>
                  <input
                    type="text"
                    value={newRewardIcon}
                    onChange={(e) => setNewRewardIcon(e.target.value)}
                    placeholder="🎁"
                    className="w-full text-center text-xl rounded-xl border border-slate-300 py-1.5 focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Điểm đổi</label>
                  <input
                    type="number"
                    value={newRewardCost}
                    onChange={(e) => setNewRewardCost(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-bold text-amber-600 focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số lượng</label>
                  <input
                    type="number"
                    value={newRewardStock}
                    onChange={(e) => setNewRewardStock(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả quà tặng</label>
                <textarea
                  value={newRewardDesc}
                  onChange={(e) => setNewRewardDesc(e.target.value)}
                  placeholder="Mô tả ngắn gọn về món quà..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewRewardModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:from-sky-600 hover:to-blue-700"
                >
                  Tạo quà tặng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
