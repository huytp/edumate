import React, { useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  Check,
  Copy,
  GraduationCap,
  MessageSquareQuote,
  Save,
  Trash2,
  User,
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
import { getTodayDateStr } from '../../utils/storage';

interface Circular27CommentsViewProps {
  students: Student[];
  comments: DailyComment[];
  settings: AppSettings;
  onUpdateComments: (comments: DailyComment[]) => void;
}

type CommentCategory = 'mon_hoc' | 'nang_luc' | 'pham_chat';
type CommentLevel = SubjectEvaluationLevel | QualityEvaluationLevel;

// Unsaved edits of one row in the whole-class table
interface ClassRowEdit {
  date?: string;
  level?: CommentLevel;
  content?: string;
  encouragement?: string;
}

const SUBJECTS = ['Toán', 'Tiếng Việt', 'Tiếng Anh', 'Tự nhiên & Xã hội', 'Đạo đức', 'Mĩ thuật', 'Âm nhạc'];

const getLevelOptions = (category: CommentCategory): { value: CommentLevel; label: string }[] =>
  category === 'pham_chat'
    ? [
        { value: 'T', label: 'T - Tốt' },
        { value: 'Đ', label: 'Đ - Đạt' },
        { value: 'C', label: 'C - Cần cố gắng' },
      ]
    : [
        { value: 'T', label: 'T - Hoàn thành tốt' },
        { value: 'H', label: 'H - Hoàn thành' },
        { value: 'C', label: 'C - Chưa hoàn thành' },
      ];

const getSubjectLabel = (category: CommentCategory, subject: string) =>
  category === 'mon_hoc' ? subject : category === 'nang_luc' ? 'Năng lực' : 'Phẩm chất';

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs focus:border-sky-500 focus:outline-hidden';

export const Circular27CommentsView: React.FC<Circular27CommentsViewProps> = ({
  students,
  comments,
  onUpdateComments,
}) => {
  const [mode, setMode] = useState<'single' | 'class'>('single');

  // Shared evaluation settings for both modes
  const [category, setCategory] = useState<CommentCategory>('mon_hoc');
  const [subject, setSubject] = useState<string>('Toán');
  const subjectLabel = getSubjectLabel(category, subject);
  const levelOptions = getLevelOptions(category);

  // Single-student form
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [singleDate, setSingleDate] = useState<string>(getTodayDateStr());
  const [level, setLevel] = useState<CommentLevel>('T');
  const [commentText, setCommentText] = useState<string>('');
  const [encouragementText, setEncouragementText] = useState<string>('');

  // Whole-class table
  const [classDate, setClassDate] = useState<string>(getTodayDateStr());
  const [rowEdits, setRowEdits] = useState<Record<string, ClassRowEdit>>({});
  const [bulkContent, setBulkContent] = useState('');
  const [bulkEncouragement, setBulkEncouragement] = useState('');

  // History
  const [filterStudent, setFilterStudent] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const changeCategory = (value: CommentCategory) => {
    setCategory(value);
    setLevel('T');
    setRowEdits({});
  };

  // ---------- Single student ----------
  const handleSaveSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedStudentId || !singleDate) return;

    const newComment: DailyComment = {
      id: `cm-${Date.now()}`,
      studentId: selectedStudentId,
      date: singleDate,
      category,
      subject: subjectLabel,
      level,
      content: commentText.trim(),
      encouragement: encouragementText.trim(),
    };

    onUpdateComments([newComment, ...comments]);
    soundManager.playSuccess();
    setCommentText('');
    setEncouragementText('');
  };

  // ---------- Whole class ----------
  const getRowDate = (studentId: string) => rowEdits[studentId]?.date ?? classDate;

  // Saved comment of a student for the row's date & current category/subject
  const findExisting = (studentId: string, date: string) =>
    comments.find(
      (c) =>
        c.studentId === studentId &&
        c.date === date &&
        c.category === category &&
        c.subject === subjectLabel
    );

  const getRow = (studentId: string) => {
    const date = getRowDate(studentId);
    const existing = findExisting(studentId, date);
    const edit = rowEdits[studentId] ?? {};
    return {
      date,
      existing,
      level: edit.level ?? (existing?.level as CommentLevel | undefined) ?? 'T',
      content: edit.content ?? existing?.content ?? '',
      encouragement: edit.encouragement ?? existing?.encouragement ?? '',
      dirty: edit.level !== undefined || edit.content !== undefined || edit.encouragement !== undefined,
    };
  };

  const updateRow = (studentId: string, patch: ClassRowEdit) => {
    setRowEdits((prev) => ({ ...prev, [studentId]: { ...prev[studentId], ...patch } }));
  };

  const changeClassDate = (date: string) => {
    setClassDate(date);
    setRowEdits({});
  };

  // Changing a row's date loads that day's comment, so drop unsaved text
  const changeRowDate = (studentId: string, date: string) => {
    setRowEdits((prev) => ({ ...prev, [studentId]: { date } }));
  };

  const saveRows = (studentIds: string[]) => {
    let updated = [...comments];
    const savedIds: string[] = [];
    const now = Date.now();

    studentIds.forEach((id, idx) => {
      const row = getRow(id);
      if (!row.dirty || !row.content.trim()) return;

      if (row.existing) {
        updated = updated.map((c) =>
          c.id === row.existing!.id
            ? { ...c, level: row.level, content: row.content.trim(), encouragement: row.encouragement.trim() }
            : c
        );
      } else {
        updated = [
          {
            id: `cm-${now}-${idx}`,
            studentId: id,
            date: row.date,
            category,
            subject: subjectLabel,
            level: row.level,
            content: row.content.trim(),
            encouragement: row.encouragement.trim(),
          },
          ...updated,
        ];
      }
      savedIds.push(id);
    });

    if (savedIds.length === 0) return;
    onUpdateComments(updated);
    // Keep each row's date so it keeps showing the comment just saved
    setRowEdits((prev) => {
      const next = { ...prev };
      savedIds.forEach((id) => {
        next[id] = prev[id]?.date ? { date: prev[id].date } : {};
      });
      return next;
    });
    soundManager.playSuccess();
  };

  const deleteRow = (student: Student) => {
    const row = getRow(student.id);
    if (!row.existing) {
      updateRow(student.id, { level: undefined, content: undefined, encouragement: undefined });
      return;
    }
    if (!window.confirm(`Xóa nhận xét ngày ${row.date} của ${student.name}?`)) return;
    onUpdateComments(comments.filter((c) => c.id !== row.existing!.id));
    updateRow(student.id, { level: undefined, content: undefined, encouragement: undefined });
    soundManager.playTick();
  };

  const applyBulk = () => {
    if (!bulkContent.trim() && !bulkEncouragement.trim()) return;
    setRowEdits((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        next[s.id] = {
          ...prev[s.id],
          ...(bulkContent.trim() ? { content: bulkContent.trim() } : {}),
          ...(bulkEncouragement.trim() ? { encouragement: bulkEncouragement.trim() } : {}),
        };
      });
      return next;
    });
    soundManager.playTick();
  };

  const dirtyCount = students.filter((s) => {
    const row = getRow(s.id);
    return row.dirty && row.content.trim();
  }).length;

  // ---------- History ----------
  const handleDeleteComment = (id: string) => {
    if (!window.confirm('Xóa nhận xét này?')) return;
    onUpdateComments(comments.filter((c) => c.id !== id));
    soundManager.playTick();
  };

  const filteredComments = comments.filter(
    (c) =>
      (filterStudent === 'all' || c.studentId === filterStudent) &&
      (!filterDate || c.date === filterDate)
  );

  const handleDeleteFiltered = () => {
    if (filteredComments.length === 0) return;
    if (!window.confirm(`Xóa ${filteredComments.length} nhận xét đang hiển thị? Hành động này không thể hoàn tác.`)) return;
    const ids = new Set(filteredComments.map((c) => c.id));
    onUpdateComments(comments.filter((c) => !ids.has(c.id)));
    soundManager.playTick();
  };

  const copyComment = (comment: DailyComment, studentName: string) => {
    const full = `[${comment.date}] Em ${studentName} - ${comment.subject || ''} (Mức ${comment.level}): ${comment.content} ${comment.encouragement ? `Lời cô: ${comment.encouragement}` : ''}`;
    copyText(full);
    setCopiedId(comment.id);
    soundManager.playTick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-sky-600" />
            Nhận Xét Hàng Ngày Theo Thông Tư 27
          </h2>
          <p className="text-xs text-slate-500">
            Ghi nhận xét trong ngày cho từng học sinh hoặc cả lớp (Môn học, Năng lực, Phẩm chất: T, H, C)
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {(
            [
              { key: 'single', label: 'Từng học sinh', icon: User },
              { key: 'class', label: 'Cả lớp', icon: Users },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                mode === key ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <MessageSquareQuote className="h-4 w-4 text-sky-600" />
          {mode === 'single' ? 'Soạn Nhận Xét Cho Học Sinh' : 'Nhận Xét Trong Ngày Cho Cả Lớp'}
        </h3>

        {/* Shared: category & subject */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung đánh giá</label>
            <select
              value={category}
              onChange={(e) => changeCategory(e.target.value as CommentCategory)}
              className={inputClass}
            >
              <option value="mon_hoc">Môn học & HĐ Giáo dục</option>
              <option value="nang_luc">Năng lực cốt lõi</option>
              <option value="pham_chat">Phẩm chất chủ yếu</option>
            </select>
          </div>

          {category === 'mon_hoc' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Môn học</label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setRowEdits({});
                }}
                className={inputClass}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-sky-600" />
              {mode === 'single' ? 'Ngày nhận xét *' : 'Ngày nhận xét (áp dụng cả lớp) *'}
            </label>
            <input
              type="date"
              value={mode === 'single' ? singleDate : classDate}
              onChange={(e) =>
                mode === 'single' ? setSingleDate(e.target.value) : changeClassDate(e.target.value)
              }
              required
              className={inputClass}
            />
          </div>
        </div>

        {mode === 'single' ? (
          <form onSubmit={handleSaveSingle} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn học sinh cần nhận xét *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className={`${inputClass} font-semibold text-slate-800`}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.avatar} {s.name} ({s.code}) - {s.parentName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ đạt</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as CommentLevel)}
                  className={`${inputClass} font-bold text-sky-700`}
                >
                  {levelOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nội dung nhận xét cụ thể (Tiến bộ, ưu điểm) *
              </label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Nhập nhận xét trong ngày của học sinh..."
                rows={3}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Biện pháp giúp đỡ / Lời khích lệ gửi phụ huynh
              </label>
              <textarea
                value={encouragementText}
                onChange={(e) => setEncouragementText(e.target.value)}
                placeholder="Ví dụ: Khen ngợi con, gia đình nhắc con luyện viết thêm 10 phút..."
                rows={2}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-xs font-bold text-white shadow-xs hover:from-sky-600 hover:to-blue-700 transition"
            >
              <Save className="h-4 w-4" />
              Lưu Nhận Xét (Phụ Huynh Thấy Ngay)
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            {/* Bulk fill */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 rounded-xl bg-sky-50/60 border border-sky-100 p-3">
              <input
                type="text"
                value={bulkContent}
                onChange={(e) => setBulkContent(e.target.value)}
                placeholder="Nhận xét chung cho cả lớp..."
                className={`${inputClass} lg:col-span-5`}
              />
              <input
                type="text"
                value={bulkEncouragement}
                onChange={(e) => setBulkEncouragement(e.target.value)}
                placeholder="Lời khích lệ chung..."
                className={`${inputClass} lg:col-span-4`}
              />
              <button
                type="button"
                onClick={applyBulk}
                className="lg:col-span-3 rounded-xl border border-sky-300 bg-white px-3 py-2 text-xs font-bold text-sky-700 hover:bg-sky-50"
              >
                Điền cho tất cả học sinh
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2 w-10 text-center">STT</th>
                    <th className="p-2 min-w-[150px]">Họ và tên</th>
                    <th className="p-2 w-36">Ngày</th>
                    <th className="p-2 w-36">Mức</th>
                    <th className="p-2 min-w-[220px]">Nội dung nhận xét</th>
                    <th className="p-2 min-w-[180px]">Lời khích lệ / Biện pháp</th>
                    <th className="p-2 text-center w-32">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student, idx) => {
                    const row = getRow(student.id);
                    return (
                      <tr
                        key={student.id}
                        className={row.dirty ? 'bg-amber-50/60' : row.existing ? 'bg-emerald-50/30' : ''}
                      >
                        <td className="p-2 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span>{student.avatar}</span>
                            <span className="font-bold text-slate-800">{student.name}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <input
                            type="date"
                            value={row.date}
                            onChange={(e) => changeRowDate(student.id, e.target.value)}
                            className="w-full rounded-lg border border-slate-200 py-1 px-1.5 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={row.level}
                            onChange={(e) => updateRow(student.id, { level: e.target.value as CommentLevel })}
                            className="w-full rounded-lg border border-slate-200 bg-white py-1 px-1.5 text-xs font-bold text-sky-700"
                          >
                            {levelOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.content}
                            onChange={(e) => updateRow(student.id, { content: e.target.value })}
                            placeholder="Nhận xét trong ngày..."
                            className="w-full rounded-lg border border-slate-200 py-1 px-2 text-xs focus:border-sky-500 focus:outline-hidden"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.encouragement}
                            onChange={(e) => updateRow(student.id, { encouragement: e.target.value })}
                            placeholder="Lời khích lệ..."
                            className="w-full rounded-lg border border-slate-200 py-1 px-2 text-xs focus:border-sky-500 focus:outline-hidden"
                          />
                        </td>
                        <td className="p-2">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => saveRows([student.id])}
                              disabled={!row.dirty || !row.content.trim()}
                              className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                              title={row.existing ? 'Cập nhật nhận xét' : 'Lưu nhận xét'}
                            >
                              <Save className="h-3.5 w-3.5" />
                              Lưu
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRow(student)}
                              disabled={!row.existing && !row.dirty}
                              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 disabled:text-slate-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                              title={row.existing ? 'Xóa nhận xét đã lưu' : 'Bỏ nội dung đang nhập'}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={() => saveRows(students.map((s) => s.id))}
              disabled={dirtyCount === 0}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-xs font-bold text-white shadow-xs hover:from-sky-600 hover:to-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              Lưu Nhận Xét Cả Lớp ({dirtyCount} học sinh)
            </button>
          </div>
        )}
      </div>

      {/* Comment History List */}
      <div className="rounded-2xl border border-sky-100 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border-b border-slate-100 bg-slate-50/70 gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-sky-600" />
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
              Lịch Sử Nhận Xét Đã Ghi ({filteredComments.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-1 px-2.5 text-xs text-slate-700 focus:outline-hidden"
              title="Lọc theo ngày"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
              >
                Mọi ngày
              </button>
            )}
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
            <button
              onClick={handleDeleteFiltered}
              disabled={filteredComments.length === 0}
              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Xóa tất cả nhận xét đang hiển thị theo bộ lọc"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xóa tất cả
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredComments.length === 0 && (
            <p className="p-6 text-center text-xs text-slate-400">Chưa có nhận xét nào.</p>
          )}
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

                  <p className="text-xs text-slate-700 pl-6 leading-relaxed">{cm.content}</p>
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
