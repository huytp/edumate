import React, { useState } from 'react';
import {
  BookOpen,
  Check,
  Copy,
  Filter,
  GraduationCap,
  MessageSquareQuote,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import {
  AppSettings,
  DailyComment,
  QualityEvaluationLevel,
  Student,
  SubjectEvaluationLevel,
} from '../../types';
import { soundManager } from '../../utils/audio';
import { copyText } from '../../utils/clipboard';
import { TT27_COMMENT_TEMPLATES, getTodayDateStr } from '../../utils/storage';

interface Circular27CommentsViewProps {
  students: Student[];
  comments: DailyComment[];
  settings: AppSettings;
  onUpdateComments: (comments: DailyComment[]) => void;
}

export const Circular27CommentsView: React.FC<Circular27CommentsViewProps> = ({
  students,
  comments,
  settings,
  onUpdateComments,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [category, setCategory] = useState<'mon_hoc' | 'nang_luc' | 'pham_chat'>('mon_hoc');
  const [subject, setSubject] = useState<string>('Toán');
  const [level, setLevel] = useState<SubjectEvaluationLevel | QualityEvaluationLevel>('T');
  const [commentText, setCommentText] = useState<string>('');
  const [encouragementText, setEncouragementText] = useState<string>('');
  const [filterStudent, setFilterStudent] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Template categories from TT27
  const getTemplates = () => {
    if (category === 'mon_hoc') {
      if (subject === 'Toán') return TT27_COMMENT_TEMPLATES.mon_toan;
      if (subject === 'Tiếng Việt') return TT27_COMMENT_TEMPLATES.mon_tieng_viet;
      return TT27_COMMENT_TEMPLATES.mon_tieng_anh;
    }
    if (category === 'nang_luc') return TT27_COMMENT_TEMPLATES.nang_luc;
    return TT27_COMMENT_TEMPLATES.pham_chat;
  };

  const applyTemplate = (tpl: { content: string; encouragement: string; level: string }) => {
    setCommentText(tpl.content);
    setEncouragementText(tpl.encouragement);
    setLevel(tpl.level as SubjectEvaluationLevel);
    soundManager.playTick();
  };

  const handleSaveComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedStudentId) return;

    const newComment: DailyComment = {
      id: `cm-${Date.now()}`,
      studentId: selectedStudentId,
      date: getTodayDateStr(),
      category,
      subject: category === 'mon_hoc' ? subject : category === 'nang_luc' ? 'Năng lực' : 'Phẩm chất',
      level,
      content: commentText.trim(),
      encouragement: encouragementText.trim(),
    };

    onUpdateComments([newComment, ...comments]);
    soundManager.playSuccess();
    setCommentText('');
    setEncouragementText('');
  };

  const handleDeleteComment = (id: string) => {
    onUpdateComments(comments.filter((c) => c.id !== id));
    soundManager.playTick();
  };

  const copyComment = (comment: DailyComment, studentName: string) => {
    const full = `[${comment.date}] Em ${studentName} - ${comment.subject || ''} (Mức ${comment.level}): ${comment.content} ${comment.encouragement ? `Lời cô: ${comment.encouragement}` : ''}`;
    copyText(full);
    setCopiedId(comment.id);
    soundManager.playTick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredComments = comments.filter((c) => {
    if (filterStudent === 'all') return true;
    return c.studentId === filterStudent;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-sky-600" />
            Nhận Xét Hàng Ngày Theo Thông Tư 27
          </h2>
          <p className="text-xs text-slate-500">
            Ngân hàng mẫu nhận xét chuẩn Bộ GD&ĐT (Môn học, Năng lực, Phẩm chất: T, H, C)
          </p>
        </div>
      </div>

      {/* Editor & Templates Two-column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Comment Generator */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-xs">
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <MessageSquareQuote className="h-4 w-4 text-sky-600" />
              Soạn Nhận Xét Cho Học Sinh
            </h3>

            <form onSubmit={handleSaveComment} className="space-y-4">
              {/* Pick Student */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn học sinh cần nhận xét *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-semibold text-slate-800 focus:border-sky-500 focus:outline-hidden"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.avatar} {s.name} ({s.code}) - {s.parentName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nội dung đánh giá
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as 'mon_hoc' | 'nang_luc' | 'pham_chat')}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
                  >
                    <option value="mon_hoc">Môn học & HĐ Giáo dục</option>
                    <option value="nang_luc">Năng lực cốt lõi</option>
                    <option value="pham_chat">Phẩm chất chủ yếu</option>
                  </select>
                </div>

                {category === 'mon_hoc' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Môn học</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
                    >
                      <option value="Toán">Toán</option>
                      <option value="Tiếng Việt">Tiếng Việt</option>
                      <option value="Tiếng Anh">Tiếng Anh</option>
                      <option value="Tự nhiên & Xã hội">Tự nhiên & Xã hội</option>
                      <option value="Đạo đức">Đạo đức</option>
                      <option value="Mĩ thuật">Mĩ thuật</option>
                      <option value="Âm nhạc">Âm nhạc</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ đạt</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as SubjectEvaluationLevel)}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-bold text-sky-700 focus:border-sky-500 focus:outline-hidden"
                    >
                      <option value="T">T - Hoàn thành tốt (Tốt)</option>
                      <option value="H">H - Hoàn thành (Đạt)</option>
                      <option value="C">C - Chưa hoàn thành (Cần cố gắng)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Comment Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung nhận xét cụ thể (Tiến bộ, ưu điểm) *
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Nhập nhận xét hoặc bấm chọn mẫu sẵn bên phải..."
                  rows={3}
                  required
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              {/* Encouragement / Support measures */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Biện pháp giúp đỡ / Lời khích lệ gửi phụ huynh
                </label>
                <textarea
                  value={encouragementText}
                  onChange={(e) => setEncouragementText(e.target.value)}
                  placeholder="Ví dụ: Khen ngợi con, gia đình nhắc con luyện viết thêm 10 phút..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-xs font-bold text-white shadow-xs hover:from-sky-600 hover:to-blue-700 transition"
              >
                Lưu Nhận Xét Lên Hồ Sơ (Phụ Huynh Thấy Ngay)
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Circular 27 Template Bank */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/50 to-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="font-bold text-slate-800 text-sm">
                Ngân Hàng Mẫu Nhận Xét (1-Click Chọn)
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Mẫu lời phê chuẩn mực sư phạm theo quy định Thông tư 27. Bấm để tự động điền vào khung soạn thảo:
            </p>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {getTemplates().map((tpl, idx) => (
                <div
                  key={idx}
                  onClick={() => applyTemplate(tpl)}
                  className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-3 hover:border-sky-400 hover:bg-sky-50/50 transition shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        tpl.level === 'T'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tpl.level === 'H'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Mức {tpl.level}
                    </span>
                    <span className="text-[10px] text-sky-600 font-semibold opacity-0 group-hover:opacity-100 transition">
                      + Dùng mẫu này
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-snug">{tpl.content}</p>
                  <p className="mt-1 text-[11px] text-slate-500 italic">
                    ↳ Lời cô: "{tpl.encouragement}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comment History List */}
      <div className="rounded-2xl border border-sky-100 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-slate-100 bg-slate-50/70 gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-sky-600" />
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
              Lịch Sử Nhận Xét Đã Ghi ({comments.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Lọc theo học sinh:</span>
            <select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-1 px-2.5 text-xs text-slate-700 focus:outline-hidden"
            >
              <option value="all">Tất cả học sinh</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredComments.map((cm) => {
            const student = students.find((s) => s.id === cm.studentId);
            const isCopied = copiedId === cm.id;

            return (
              <div
                key={cm.id}
                className="p-4 hover:bg-slate-50/60 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{student?.avatar || '👦🏻'}</span>
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">
                      {student?.name || 'Học sinh'}
                    </span>
                    <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">
                      {cm.subject || 'Đánh giá'}
                    </span>
                    <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      Mức: {cm.level}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{cm.date}</span>
                  </div>

                  <p className="text-xs text-slate-700 pl-6 leading-relaxed">
                    {cm.content}
                  </p>
                  {cm.encouragement && (
                    <p className="text-[11px] text-emerald-700 pl-6 font-medium italic">
                      Biện pháp hỗ trợ: "{cm.encouragement}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => copyComment(cm, student?.name || '')}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition"
                    title="Copy nhận xét để dán vào SMAS / VnEdu"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Đã chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy lời phê</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteComment(cm.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Xóa nhận xét"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
