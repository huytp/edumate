import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  HeartHandshake,
  MessageSquare,
  Send,
  TrendingUp,
} from 'lucide-react';
import {
  AppSettings,
  ParentLoginLog,
  ParentMessage,
  Student,
} from '../../types';
import { soundManager } from '../../utils/audio';

interface ParentPortalAndReportsViewProps {
  students: Student[];
  messages: ParentMessage[];
  loginLogs: ParentLoginLog[];
  settings: AppSettings;
  onUpdateMessages: (messages: ParentMessage[]) => void;
  onSwitchToParentView: (student: Student) => void;
}

export const ParentPortalAndReportsView: React.FC<ParentPortalAndReportsViewProps> = ({
  students,
  messages,
  loginLogs,
  settings,
  onUpdateMessages,
  onSwitchToParentView,
}) => {
  const [activeTab, setActiveTab] = useState<'messages' | 'logs'>('messages');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // Group login logs by student to calculate total login counts
  const loginStatsByStudent = students.map((student) => {
    const studentLogs = loginLogs.filter((l) => l.studentId === student.id);
    const lastLogin = studentLogs[0]?.loginTime || 'Chưa đăng nhập';
    return {
      student,
      loginCount: studentLogs.length,
      lastLogin,
    };
  });

  // Reply to parent message
  const handleSendReply = (messageId: string) => {
    const replyContent = replyTextMap[messageId];
    if (!replyContent || !replyContent.trim()) return;

    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updated = messages.map((m) =>
      m.id === messageId
        ? {
            ...m,
            reply: replyContent.trim(),
            replyDate: formatted,
            isRead: true,
          }
        : m
    );

    onUpdateMessages(updated);
    soundManager.playSuccess();
    setReplyTextMap((prev) => ({ ...prev, [messageId]: '' }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <HeartHandshake className="h-6 w-6 text-sky-600" />
          Kết Nối 2 Chiều Phụ Huynh & Báo Cáo
        </h2>
        <p className="text-xs text-slate-500">
          Theo dõi phụ huynh đăng nhập và phản hồi tin nhắn của phụ huynh
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-sky-100 bg-white p-1 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'messages'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Hòm Thư Phụ Huynh ({messages.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'logs'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Báo Cáo Phụ Huynh Đăng Nhập ({loginLogs.length})
        </button>
      </div>

      {/* TAB 1: 2-WAY MESSAGES */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
              <h4 className="mt-2 text-sm font-bold text-slate-700">Hòm thư chưa có tin nhắn</h4>
              <p className="mt-1 text-xs text-slate-400">
                Khi phụ huynh đăng nhập và gửi lời nhắn, nội dung sẽ hiển thị ngay tại đây.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-2xl border border-sky-100 bg-white p-5 shadow-xs transition hover:border-sky-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                        PH
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                          {msg.parentName} (Phụ huynh em {msg.studentName})
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>SĐT: {msg.parentPhone}</span>
                          <span>• {msg.date}</span>
                        </div>
                      </div>
                    </div>

                    {!msg.reply && (
                      <span className="self-start sm:self-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                        Chờ cô trả lời
                      </span>
                    )}
                  </div>

                  {/* Parent Message Content */}
                  <div className="py-3 text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-xl mt-3 border border-slate-100">
                    "{msg.content}"
                  </div>

                  {/* Existing Teacher Reply */}
                  {msg.reply && (
                    <div className="mt-3 rounded-xl bg-sky-50/70 p-3 border border-sky-100 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-sky-900 mb-1">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-sky-600" />
                          Cô giáo {settings.teacherName} đã phản hồi:
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {msg.replyDate}
                        </span>
                      </div>
                      <p className="text-slate-800 leading-relaxed">"{msg.reply}"</p>
                    </div>
                  )}

                  {/* Reply Input Form */}
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      value={replyTextMap[msg.id] || ''}
                      onChange={(e) =>
                        setReplyTextMap((prev) => ({
                          ...prev,
                          [msg.id]: e.target.value,
                        }))
                      }
                      placeholder={
                        msg.reply
                          ? 'Nhập câu trả lời bổ sung cho phụ huynh...'
                          : 'Nhập câu trả lời gửi đến phụ huynh...'
                      }
                      className="flex-1 rounded-xl border border-slate-200 py-2 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
                    />
                    <button
                      onClick={() => handleSendReply(msg.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-sky-700 transition active:scale-95"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Gửi trả lời
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LOGIN LOGS & ACCESS REPORTS */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-500">
                Tổng lượt phụ huynh truy cập
              </span>
              <div className="mt-2 text-2xl font-black text-sky-600">
                {loginLogs.length} lượt
              </div>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-500">
                Số phụ huynh đã kết nối
              </span>
              <div className="mt-2 text-2xl font-black text-emerald-600">
                {loginStatsByStudent.filter((s) => s.loginCount > 0).length} / {students.length} PH
              </div>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-500">
                Tỷ lệ quan tâm tương tác
              </span>
              <div className="mt-2 text-2xl font-black text-amber-600">
                {Math.round(
                  (loginStatsByStudent.filter((s) => s.loginCount > 0).length /
                    (students.length || 1)) *
                    100
                )}%
              </div>
            </div>
          </div>

          {/* Student-by-Student Parent Engagement Table */}
          <div className="rounded-2xl border border-sky-100 bg-white shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/70 font-bold text-xs text-slate-700">
              Báo cáo số lần phụ huynh đăng nhập theo từng học sinh
            </div>
            <div className="divide-y divide-slate-100">
              {loginStatsByStudent.map(({ student, loginCount, lastLogin }) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{student.avatar}</span>
                    <div>
                      <h4 className="font-bold text-slate-800">{student.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        PH: {student.parentName} ({student.parentPhone})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-black text-sky-700">
                        {loginCount} lần đăng nhập
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Lần cuối: {lastLogin}
                      </div>
                    </div>

                    <button
                      onClick={() => onSwitchToParentView(student)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                      title="Xem giao diện như phụ huynh bé này"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Xem thử
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Access History Log */}
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-xs">
            <h4 className="font-bold text-xs sm:text-sm text-slate-800 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              Nhật ký truy cập chi tiết gần đây
            </h4>
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {loginLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{log.parentName}</span> (PH em{' '}
                    <span className="font-semibold text-sky-700">{log.studentName}</span>)
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="hidden sm:inline font-mono">{log.deviceInfo}</span>
                    <span className="font-mono text-slate-500">{log.loginTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
