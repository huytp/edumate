import React, { useState } from 'react';
import {
  Award,
  CalendarCheck2,
  Clock,
  FileSpreadsheet,
  Gamepad2,
  Heart,
  HeartHandshake,
  LogOut,
  MessageSquare,
  Send,
  Sparkles,
  Star,
  UserCheck,
  UserX,
} from 'lucide-react';
import {
  AppSettings,
  AttendanceRecord,
  DailyComment,
  ParentMessage,
  PointHistory,
  RewardRedemption,
  SemesterResult,
  Student,
} from '../../types';
import { soundManager } from '../../utils/audio';
import { getTodayDateStr } from '../../utils/storage';

interface ParentChildViewProps {
  student: Student;
  allAttendance: AttendanceRecord[];
  allComments: DailyComment[];
  allResults: SemesterResult[];
  allMessages: ParentMessage[];
  allPointsHistory: PointHistory[];
  allRedemptions: RewardRedemption[];
  settings: AppSettings;
  onSendMessage: (msg: ParentMessage) => void;
  onLogout: () => void;
}

export const ParentChildView: React.FC<ParentChildViewProps> = ({
  student,
  allAttendance,
  allComments,
  allResults,
  allMessages,
  allPointsHistory,
  allRedemptions,
  settings,
  onSendMessage,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'semester' | 'messages'>('overview');
  const [messageContent, setMessageContent] = useState('');
  const [isSentSuccess, setIsSentSuccess] = useState(false);

  const todayStr = getTodayDateStr();

  // Filter records specifically for this student
  const studentAttendance = allAttendance.filter((r) => r.studentId === student.id);
  const todayRecord = studentAttendance.find((r) => r.date === todayStr);

  const studentComments = allComments.filter((c) => c.studentId === student.id);
  const studentSemesterResults = allResults.filter((r) => r.studentId === student.id);
  const studentMessages = allMessages.filter((m) => m.studentId === student.id);
  const studentPointsHistory = allPointsHistory.filter((p) => p.studentId === student.id);
  const studentRedemptions = allRedemptions.filter((r) => r.studentId === student.id);

  // Send message to teacher
  const handleSendToTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg: ParentMessage = {
      id: `msg-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      content: messageContent.trim(),
      date: formatted,
      isRead: false,
    };

    onSendMessage(newMsg);
    soundManager.playSuccess();
    setMessageContent('');
    setIsSentSuccess(true);
    setTimeout(() => setIsSentSuccess(false), 3000);
  };

  // Status badge helper
  const getAttendanceBadge = () => {
    const status = todayRecord?.status || 'present';
    if (status === 'present') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
          <UserCheck className="h-4 w-4 text-emerald-600" />
          Hôm nay có mặt tại lớp
        </span>
      );
    }
    if (status === 'late') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">
          <Clock className="h-4 w-4 text-orange-600" />
          Đi muộn {todayRecord?.note ? `(${todayRecord.note})` : ''}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
        <UserX className="h-4 w-4 text-rose-600" />
        Vắng {status === 'excused' ? 'có phép' : 'không phép'}{' '}
        {todayRecord?.note ? `(${todayRecord.note})` : ''}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Warm Parent Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 p-6 md:p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 text-9xl opacity-10 select-none">
          🎒
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/20 text-5xl backdrop-blur-md shadow-inner border border-white/30">
              {student.avatar.startsWith('data:image') || student.avatar.startsWith('http') ? (
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="h-full w-full object-cover rounded-3xl"
                />
              ) : (
                <span>{student.avatar}</span>
              )}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-xs mb-1">
                <span>Cổng thông tin phụ huynh</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">{student.name}</h2>
              <p className="text-xs text-emerald-100">
                Mã học sinh: <strong className="font-mono text-white">{student.code}</strong> • {settings.className} ({settings.schoolName})
              </p>
              <div className="mt-2">{getAttendanceBadge()}</div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="rounded-2xl bg-white/15 p-3 text-right backdrop-blur-md border border-white/20">
              <span className="text-[11px] text-emerald-100 block">Giáo viên chủ nhiệm:</span>
              <strong className="text-sm font-bold block">{settings.teacherName}</strong>
              <span className="text-[11px] text-emerald-200">SĐT/Zalo: {settings.teacherPhone}</span>
            </div>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/30 backdrop-blur-xs transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Parent */}
      <div className="flex items-center gap-2 border-b border-sky-100 bg-white p-1 rounded-2xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="h-4 w-4" />
          Tổng Quan Thi Đua
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'comments'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Lời Nhận Xét Của Cô ({studentComments.length})
        </button>

        <button
          onClick={() => setActiveTab('semester')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'semester'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Kết Quả Cuối Kỳ (TT27)
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'messages'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Hòm Thư Trao Đổi 2 Chiều ({studentMessages.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & POINTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs text-center">
              <span className="text-3xl">⭐</span>
              <div className="mt-1 text-2xl font-black text-amber-600">{student.points}</div>
              <span className="text-[11px] font-bold text-amber-800">Điểm thi đua</span>
            </div>

            <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 shadow-xs text-center">
              <span className="text-3xl">✨</span>
              <div className="mt-1 text-2xl font-black text-sky-600">{student.stars}</div>
              <span className="text-[11px] font-bold text-sky-800">Sao chăm ngoan</span>
            </div>

            <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 shadow-xs text-center">
              <span className="text-3xl">🎮</span>
              <div className="mt-1 text-2xl font-black text-purple-600">
                {student.gameParticipationCount}
              </div>
              <span className="text-[11px] font-bold text-purple-800">Lượt chơi game</span>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs text-center">
              <span className="text-3xl">🎁</span>
              <div className="mt-1 text-2xl font-black text-emerald-600">
                {studentRedemptions.length}
              </div>
              <span className="text-[11px] font-bold text-emerald-800">Phần quà đã nhận</span>
            </div>
          </div>

          {/* Points History */}
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-xs">
            <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Lịch sử khen thưởng & điểm số của con
            </h4>

            {studentPointsHistory.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Chưa có lịch sử điểm số.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {studentPointsHistory.map((h) => (
                  <div key={h.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-black rounded-lg px-2 py-0.5 text-xs ${
                          h.delta > 0
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {h.delta > 0 ? `+${h.delta}` : h.delta}
                      </span>
                      <span className="text-slate-700">{h.reason}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{h.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CIRCULAR 27 COMMENTS */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-sky-50 p-4 border border-sky-100 text-xs text-sky-900 leading-relaxed">
            Các lời nhận xét của cô giáo được xây dựng chuẩn mực theo Thông tư 27 Bộ Giáo dục, tập trung vào tiến bộ, ưu điểm và giải pháp đồng hành giữa nhà trường và gia đình.
          </div>

          {studentComments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <Sparkles className="mx-auto h-12 w-12 text-slate-300" />
              <h4 className="mt-2 text-sm font-bold text-slate-700">Chưa có nhận xét nào</h4>
              <p className="mt-1 text-xs text-slate-400">
                Khi cô giáo cập nhật đánh giá, quý phụ huynh sẽ xem được ngay tại đây.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {studentComments.map((cm) => (
                <div
                  key={cm.id}
                  className="rounded-2xl border border-sky-100 bg-white p-5 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-800">
                        {cm.subject || 'Đánh giá chung'}
                      </span>
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                        Mức: {cm.level}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{cm.date}</span>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    "{cm.content}"
                  </p>

                  {cm.encouragement && (
                    <div className="rounded-xl bg-emerald-50/80 p-3 text-xs text-emerald-900 border border-emerald-100 italic">
                      <span className="font-bold not-italic">Lời dặn của cô giáo: </span>
                      "{cm.encouragement}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SEMESTER EVALUATION (TT27) */}
      {activeTab === 'semester' && (
        <div className="space-y-4">
          {studentSemesterResults.map((res) => (
            <div
              key={res.id}
              className="rounded-3xl border border-sky-200 bg-white p-6 shadow-xs space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Bảng Đánh Giá Kết Quả Giáo Dục - {res.semester}
                  </h3>
                  <span className="text-xs text-slate-500">Năm học: {res.schoolYear}</span>
                </div>

                <div className="rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-black text-emerald-800 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-emerald-600" />
                  {res.awardTitle}
                </div>
              </div>

              {/* Subject Grades Grid */}
              <div>
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  1. Môn học & Hoạt động giáo dục
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-sky-50/70 p-3 border border-sky-100">
                    <span className="text-xs font-bold text-slate-700 block">Toán</span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl font-black text-sky-700">{res.mathScore}</span>
                      <span className="text-xs font-semibold text-sky-600">
                        (Mức {res.mathLevel})
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-sky-50/70 p-3 border border-sky-100">
                    <span className="text-xs font-bold text-slate-700 block">Tiếng Việt</span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl font-black text-sky-700">{res.vietnameseScore}</span>
                      <span className="text-xs font-semibold text-sky-600">
                        (Mức {res.vietnameseLevel})
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-sky-50/70 p-3 border border-sky-100">
                    <span className="text-xs font-bold text-slate-700 block">Tiếng Anh</span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl font-black text-sky-700">{res.englishScore}</span>
                      <span className="text-xs font-semibold text-sky-600">
                        (Mức {res.englishLevel})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Competencies & Qualities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <h5 className="font-bold text-xs text-slate-800 mb-2">2. Năng lực cốt lõi</h5>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Tự chủ và tự học:</span>
                      <strong className="text-emerald-700 font-bold">Mức {res.selfAutonomy}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Giao tiếp và hợp tác:</span>
                      <strong className="text-emerald-700 font-bold">Mức {res.communication}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Giải quyết vấn đề:</span>
                      <strong className="text-emerald-700 font-bold">Mức {res.problemSolving}</strong>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <h5 className="font-bold text-xs text-slate-800 mb-2">3. Phẩm chất chủ yếu</h5>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Chăm chỉ & Trách nhiệm:</span>
                      <strong className="text-emerald-700 font-bold">Tốt</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Trung thực & Nhân ái:</span>
                      <strong className="text-emerald-700 font-bold">Tốt</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Yêu nước & Giữ gìn kỉ luật:</span>
                      <strong className="text-emerald-700 font-bold">Tốt</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher Overall Note */}
              <div className="rounded-2xl bg-amber-50/70 p-4 border border-amber-200">
                <span className="text-xs font-bold text-amber-900 block mb-1">
                  Nhận xét chung của giáo viên chủ nhiệm:
                </span>
                <p className="text-xs text-slate-800 italic leading-relaxed">
                  "{res.overallComment}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: 2-WAY MESSAGING WITH TEACHER */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          {/* Send Box */}
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-xs">
            <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
              <Send className="h-4 w-4 text-sky-600" />
              Gửi lời nhắn / phản hồi đến cô giáo {settings.teacherName}
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Phụ huynh có thể trao đổi về tình hình học tập, xin phép nghỉ hoặc nhắn gửi các lưu ý về sức khỏe của con.
            </p>

            <form onSubmit={handleSendToTeacher} className="space-y-3">
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Nhập nội dung lời nhắn gửi đến cô giáo..."
                rows={3}
                required
                className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-sky-500 focus:outline-hidden"
              />

              {isSentSuccess && (
                <div className="rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-800 font-bold border border-emerald-200">
                  ✓ Lời nhắn đã được gửi đến cô giáo thành công!
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:from-emerald-600 hover:to-teal-700 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  Gửi Lời Nhắn
                </button>
              </div>
            </form>
          </div>

          {/* Conversation History */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Lịch sử trao đổi giữa phụ huynh và cô giáo ({studentMessages.length})
            </h4>

            {studentMessages.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Chưa có tin nhắn nào được gửi.</p>
            ) : (
              studentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2"
                >
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span className="font-bold text-slate-700">Gia đình gửi:</span>
                    <span className="font-mono">{msg.date}</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl">
                    "{msg.content}"
                  </p>

                  {msg.reply ? (
                    <div className="mt-2 rounded-xl bg-emerald-50/80 p-3 border border-emerald-100 text-xs">
                      <div className="flex justify-between text-[11px] text-emerald-800 font-bold mb-1">
                        <span>Cô giáo phản hồi:</span>
                        <span className="font-normal text-slate-400">{msg.replyDate}</span>
                      </div>
                      <p className="text-slate-800">"{msg.reply}"</p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-600 font-medium">
                      ⏳ Đang chờ cô giáo xem và phản hồi...
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
