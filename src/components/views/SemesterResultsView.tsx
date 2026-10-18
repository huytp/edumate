import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Award,
  Download,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Save,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  AppSettings,
  QualityEvaluationLevel,
  SemesterResult,
  Student,
  SubjectEvaluationLevel,
} from '../../types';
import { soundManager } from '../../utils/audio';
import {
  exportSemesterResultsToExcel,
  exportSemesterResultsToWord,
} from '../../utils/storage';

interface SemesterResultsViewProps {
  students: Student[];
  results: SemesterResult[];
  settings: AppSettings;
  onUpdateResults: (results: SemesterResult[]) => void;
}

export const SemesterResultsView: React.FC<SemesterResultsViewProps> = ({
  students,
  results,
  settings,
  onUpdateResults,
}) => {
  const [semester, setSemester] = useState<'Học kỳ 1' | 'Học kỳ 2' | 'Cả năm'>('Học kỳ 1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Manual edits are kept as per-student drafts until the teacher presses "Cập nhật"
  const [drafts, setDrafts] = useState<Record<string, SemesterResult>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const draftKey = (studentId: string) => `${semester}|${studentId}`;
  const isDirty = (studentId: string) => Boolean(drafts[draftKey(studentId)]);

  const removeDrafts = (studentIds: string[]) => {
    setDrafts((prev) => {
      const next = { ...prev };
      studentIds.forEach((id) => delete next[draftKey(id)]);
      return next;
    });
  };

  // Saved result for the current semester, or an empty one
  const getSavedResult = (studentId: string): SemesterResult => {
    const found = results.find(
      (r) => r.studentId === studentId && r.semester === semester
    );
    if (found) return found;

    return {
      id: `sr-${studentId}-${semester}`,
      studentId,
      schoolYear: settings.schoolYear,
      semester,
      mathScore: undefined,
      mathLevel: '',
      vietnameseScore: undefined,
      vietnameseLevel: '',
      englishScore: undefined,
      englishLevel: '',
      scienceLevel: '',
      historyGeoLevel: '',
      ethicsLevel: '',
      musicLevel: '',
      artLevel: '',
      peLevel: '',
      selfAutonomy: '',
      communication: '',
      problemSolving: '',
      patriotism: '',
      compassion: '',
      diligence: '',
      honesty: '',
      responsibility: '',
      awardTitle: '',
      overallComment: '',
    };
  };

  // Draft (if being edited) or saved result
  const getResult = (studentId: string): SemesterResult =>
    drafts[draftKey(studentId)] ?? getSavedResult(studentId);

  // Update specific field in the student's draft
  const updateResultField = (
    studentId: string,
    field: keyof SemesterResult,
    value: unknown
  ) => {
    const key = draftKey(studentId);
    setDrafts((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? getSavedResult(studentId)), [field]: value },
    }));
  };

  // Save drafts of the given students
  const commitDrafts = (studentIds: string[]) => {
    const dirtyIds = studentIds.filter(isDirty);
    if (dirtyIds.length === 0) return;

    const updated = [...results];
    dirtyIds.forEach((id) => {
      const draft = drafts[draftKey(id)];
      const idx = updated.findIndex((r) => r.studentId === id && r.semester === semester);
      if (idx >= 0) {
        updated[idx] = draft;
      } else {
        updated.push(draft);
      }
    });

    onUpdateResults(updated);
    removeDrafts(dirtyIds);
    soundManager.playSuccess();
  };

  // Clear the current semester's results of the given students
  const deleteResults = (studentIds: string[], confirmMessage: string) => {
    if (studentIds.length === 0 || !window.confirm(confirmMessage)) return;

    const ids = new Set(studentIds);
    onUpdateResults(results.filter((r) => !(r.semester === semester && ids.has(r.studentId))));
    removeDrafts(studentIds);
    setSelectedIds((prev) => new Set([...prev].filter((id) => !ids.has(id))));
    soundManager.playTick();
  };

  const toggleSelected = (studentId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  // Import results from Excel file
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

      const newResults = [...results];
      const importedIds: string[] = [];

      jsonData.forEach((row) => {
        const code = String(row['Mã HS'] || row['Mã học sinh'] || '');
        const student = students.find((s) => s.code === code);
        if (student) {
          const idx = newResults.findIndex(
            (r) => r.studentId === student.id && r.semester === semester
          );
          const toScore = (v: unknown) =>
            v === undefined || v === null || v === '' ? undefined : Number(v);
          const toLevel = (v: unknown): SubjectEvaluationLevel | '' => {
            const lv = String(v ?? '').trim().toUpperCase();
            return lv === 'T' || lv === 'H' || lv === 'C' ? lv : '';
          };
          const awardTitle = String(row['Danh hiệu khen thưởng'] || '') as SemesterResult['awardTitle'];
          const base = idx >= 0 ? newResults[idx] : getSavedResult(student.id);
          importedIds.push(student.id);

          const resItem: SemesterResult = {
            ...base,
            mathScore: toScore(row['Điểm KTĐK Toán']),
            mathLevel: toLevel(row['Mức đạt Toán (T/H/C)']),
            vietnameseScore: toScore(row['Điểm KTĐK T.Việt']),
            vietnameseLevel: toLevel(row['Mức đạt T.Việt (T/H/C)']),
            englishScore: toScore(row['Điểm KTĐK T.Anh']),
            englishLevel: toLevel(row['Mức đạt T.Anh (T/H/C)']),
            selfAutonomy: toLevel(row['NL Tự chủ & Tự học']),
            communication: toLevel(row['NL Giao tiếp & Hợp tác']),
            problemSolving: toLevel(row['NL Giải quyết vấn đề']),
            awardTitle,
            overallComment: String(row['Nhận xét chung'] || ''),
          };

          if (idx >= 0) {
            newResults[idx] = resItem;
          } else {
            newResults.push(resItem);
          }
        }
      });

      onUpdateResults(newResults);
      removeDrafts(importedIds);
      soundManager.playSuccess();
      alert(`Đã nhập thành công kết quả cho ${jsonData.length} học sinh từ file Excel!`);
    } catch {
      alert('Có lỗi khi đọc file Excel kết quả. Vui lòng kiểm tra định dạng.');
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIds = filteredStudents.map((s) => s.id);
  const selectedVisibleIds = filteredIds.filter((id) => selectedIds.has(id));
  const allSelected = filteredIds.length > 0 && selectedVisibleIds.length === filteredIds.length;
  const selectedDirtyCount = selectedVisibleIds.filter(isDirty).length;

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-sky-600" />
            Kết Quả Cuối Học Kỳ (Thông Tư 27/2020/TT-BGDĐT)
          </h2>
          <p className="text-xs text-slate-500">
            Bảng tổng hợp đánh giá kết quả giáo dục, điểm kiểm tra định kỳ & khen thưởng chuẩn Bộ GD&ĐT
          </p>
        </div>

        {/* Action Buttons: Export Word / Excel & Import */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export Word */}
          <button
            onClick={() => exportSemesterResultsToWord(students, results, settings, semester)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100 shadow-xs active:scale-95 transition"
            title="Xuất file Word (.doc) theo chuẩn công văn Thông tư 27"
          >
            <FileText className="h-4 w-4 text-sky-600" />
            <span>Xuất Biểu Mẫu Word</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={() => exportSemesterResultsToExcel(students, results, settings)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 shadow-xs active:scale-95 transition"
            title="Xuất bảng điểm chi tiết ra file Excel"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>

          {/* Import Excel */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            title="Nhập điểm từ file Excel"
          >
            <Upload className="h-4 w-4 text-slate-500" />
            <span>Nhập Excel</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportExcel}
            className="hidden"
          />
        </div>
      </div>

      {/* Semester filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-2xl bg-white p-3.5 border border-sky-100 shadow-xs items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          {(['Học kỳ 1', 'Học kỳ 2', 'Cả năm'] as const).map((sem) => (
            <button
              key={sem}
              onClick={() => setSemester(sem)}
              className={`flex-1 sm:flex-none rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                semester === sem
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sem}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học sinh, mã số..."
            className="w-full rounded-xl border border-slate-200 py-1.5 pl-8 pr-3 text-xs focus:border-sky-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Bulk actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={toggleSelectAll}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <input type="checkbox" checked={allSelected} readOnly className="pointer-events-none accent-sky-600" />
          <span>{allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}</span>
        </button>

        <button
          onClick={() => commitDrafts(selectedVisibleIds)}
          disabled={selectedDirtyCount === 0}
          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-sky-700 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          title="Lưu các thay đổi của học sinh đã chọn"
        >
          <Save className="h-4 w-4" />
          <span>Cập nhật đã chọn ({selectedDirtyCount})</span>
        </button>

        <button
          onClick={() =>
            deleteResults(
              selectedVisibleIds,
              `Xóa kết quả ${semester} của ${selectedVisibleIds.length} học sinh đã chọn?`
            )
          }
          disabled={selectedVisibleIds.length === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="h-4 w-4" />
          <span>Xóa đã chọn ({selectedVisibleIds.length})</span>
        </button>

        <button
          onClick={() =>
            deleteResults(
              students.map((s) => s.id),
              `Xóa toàn bộ kết quả ${semester} của tất cả học sinh? Hành động này không thể hoàn tác.`
            )
          }
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-xs"
        >
          <Trash2 className="h-4 w-4" />
          <span>Xóa tất cả</span>
        </button>

        {Object.keys(drafts).some((k) => k.startsWith(`${semester}|`)) && (
          <span className="text-[11px] font-semibold text-amber-700">
            Có thay đổi chưa lưu — bấm "Cập nhật" ở từng dòng để lưu.
          </span>
        )}
      </div>

      {/* Main Table Matrix (Conforming to Circular 27) */}
      <div className="overflow-x-auto rounded-2xl border border-sky-100 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-sky-50/80 text-slate-700 font-bold border-b border-sky-100 sticky top-0">
            <tr>
              <th className="p-3 w-10 text-center" rowSpan={2}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="accent-sky-600"
                  title="Chọn tất cả"
                />
              </th>
              <th className="p-3 w-12 text-center" rowSpan={2}>STT</th>
              <th className="p-3 w-16" rowSpan={2}>Mã HS</th>
              <th className="p-3 min-w-[150px]" rowSpan={2}>Họ và tên</th>
              <th className="p-2 text-center border-l border-sky-100" colSpan={3}>
                Điểm KTĐK & Mức đạt môn học
              </th>
              <th className="p-2 text-center border-l border-sky-100" colSpan={3}>
                Năng lực cốt lõi
              </th>
              <th className="p-2 text-center border-l border-sky-100 min-w-[180px]" rowSpan={2}>
                Khen thưởng (TT27)
              </th>
              <th className="p-2 min-w-[200px]" rowSpan={2}>
                Nhận xét tổng hợp
              </th>
              <th className="p-2 text-center min-w-[130px]" rowSpan={2}>
                Thao tác
              </th>
            </tr>
            <tr className="border-t border-sky-100 text-[11px] bg-slate-50/60">
              <th className="p-1.5 text-center border-l border-sky-100">Toán</th>
              <th className="p-1.5 text-center">T.Việt</th>
              <th className="p-1.5 text-center">T.Anh</th>
              <th className="p-1.5 text-center border-l border-sky-100">Tự chủ</th>
              <th className="p-1.5 text-center">Giao tiếp</th>
              <th className="p-1.5 text-center">GQ vấn đề</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map((student, idx) => {
              const res = getResult(student.id);
              const dirty = isDirty(student.id);

              return (
                <tr
                  key={student.id}
                  className={`transition ${dirty ? 'bg-amber-50/60' : 'hover:bg-slate-50/60'}`}
                >
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(student.id)}
                      onChange={() => toggleSelected(student.id)}
                      className="accent-sky-600"
                    />
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-600">
                    {student.code}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span>{student.avatar}</span>
                      <span className="font-bold text-slate-800">{student.name}</span>
                    </div>
                  </td>

                  {/* Math Score & Level */}
                  <td className="p-2 text-center border-l border-slate-100">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={res.mathScore ?? ''}
                        onChange={(e) =>
                          updateResultField(
                            student.id,
                            'mathScore',
                            e.target.value === '' ? undefined : Number(e.target.value)
                          )
                        }
                        className="w-10 rounded border border-slate-200 text-center font-bold text-xs py-1"
                      />
                      <select
                        value={res.mathLevel}
                        onChange={(e) =>
                          updateResultField(student.id, 'mathLevel', e.target.value)
                        }
                        className="rounded border border-slate-200 text-xs py-1 px-0.5 font-bold text-sky-700 bg-white"
                      >
                        <option value="">—</option>
                        <option value="T">T</option>
                        <option value="H">H</option>
                        <option value="C">C</option>
                      </select>
                    </div>
                  </td>

                  {/* Vietnamese Score & Level */}
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={res.vietnameseScore ?? ''}
                        onChange={(e) =>
                          updateResultField(
                            student.id,
                            'vietnameseScore',
                            e.target.value === '' ? undefined : Number(e.target.value)
                          )
                        }
                        className="w-10 rounded border border-slate-200 text-center font-bold text-xs py-1"
                      />
                      <select
                        value={res.vietnameseLevel}
                        onChange={(e) =>
                          updateResultField(student.id, 'vietnameseLevel', e.target.value)
                        }
                        className="rounded border border-slate-200 text-xs py-1 px-0.5 font-bold text-sky-700 bg-white"
                      >
                        <option value="">—</option>
                        <option value="T">T</option>
                        <option value="H">H</option>
                        <option value="C">C</option>
                      </select>
                    </div>
                  </td>

                  {/* English Score & Level */}
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={res.englishScore ?? ''}
                        onChange={(e) =>
                          updateResultField(
                            student.id,
                            'englishScore',
                            e.target.value === '' ? undefined : Number(e.target.value)
                          )
                        }
                        className="w-10 rounded border border-slate-200 text-center font-bold text-xs py-1"
                      />
                      <select
                        value={res.englishLevel}
                        onChange={(e) =>
                          updateResultField(student.id, 'englishLevel', e.target.value)
                        }
                        className="rounded border border-slate-200 text-xs py-1 px-0.5 font-bold text-sky-700 bg-white"
                      >
                        <option value="">—</option>
                        <option value="T">T</option>
                        <option value="H">H</option>
                        <option value="C">C</option>
                      </select>
                    </div>
                  </td>

                  {/* Core Competencies */}
                  <td className="p-2 text-center border-l border-slate-100">
                    <select
                      value={res.selfAutonomy}
                      onChange={(e) =>
                        updateResultField(student.id, 'selfAutonomy', e.target.value)
                      }
                      className="rounded border border-slate-200 text-xs py-1 font-bold text-slate-700 bg-white"
                    >
                      <option value="">—</option>
                      <option value="T">T</option>
                      <option value="H">H</option>
                      <option value="C">C</option>
                    </select>
                  </td>
                  <td className="p-2 text-center">
                    <select
                      value={res.communication}
                      onChange={(e) =>
                        updateResultField(student.id, 'communication', e.target.value)
                      }
                      className="rounded border border-slate-200 text-xs py-1 font-bold text-slate-700 bg-white"
                    >
                      <option value="">—</option>
                      <option value="T">T</option>
                      <option value="H">H</option>
                      <option value="C">C</option>
                    </select>
                  </td>
                  <td className="p-2 text-center">
                    <select
                      value={res.problemSolving}
                      onChange={(e) =>
                        updateResultField(student.id, 'problemSolving', e.target.value)
                      }
                      className="rounded border border-slate-200 text-xs py-1 font-bold text-slate-700 bg-white"
                    >
                      <option value="">—</option>
                      <option value="T">T</option>
                      <option value="H">H</option>
                      <option value="C">C</option>
                    </select>
                  </td>

                  {/* Award Title */}
                  <td className="p-2 border-l border-slate-100">
                    <select
                      value={res.awardTitle}
                      onChange={(e) =>
                        updateResultField(student.id, 'awardTitle', e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white py-1 px-2 text-xs font-bold text-emerald-800 focus:outline-hidden"
                    >
                      <option value="">— Chưa chọn —</option>
                      <option value="Học sinh Xuất sắc">🏆 Học sinh Xuất sắc</option>
                      <option value="Học sinh Tiêu biểu hoàn thành tốt">
                        ⭐ HS Tiêu biểu
                      </option>
                      <option value="Hoàn thành chương trình lớp học">
                        ✓ Hoàn thành CT lớp học
                      </option>
                      <option value="Chưa hoàn thành">Chưa hoàn thành</option>
                    </select>
                  </td>

                  {/* Overall Comment */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={res.overallComment}
                      onChange={(e) =>
                        updateResultField(student.id, 'overallComment', e.target.value)
                      }
                      placeholder="Lời phê tổng kết..."
                      className="w-full rounded-lg border border-slate-200 py-1 px-2 text-xs focus:border-sky-500 focus:outline-hidden"
                    />
                  </td>

                  {/* Row actions */}
                  <td className="p-2">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => commitDrafts([student.id])}
                        disabled={!dirty}
                        className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                        title={dirty ? 'Lưu thay đổi của học sinh này' : 'Chưa có thay đổi'}
                      >
                        <Save className="h-3.5 w-3.5" />
                        Cập nhật
                      </button>
                      <button
                        onClick={() =>
                          deleteResults(
                            [student.id],
                            `Xóa kết quả ${semester} của học sinh ${student.name}?`
                          )
                        }
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                        title="Xóa kết quả của học sinh này"
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

      <div className="rounded-2xl bg-sky-50/70 p-4 border border-sky-100 text-xs text-sky-900 leading-relaxed">
        <span className="font-bold">Quy chuẩn đánh giá Thông tư 27:</span> Mức T (Hoàn thành tốt), Mức H (Hoàn thành), Mức C (Chưa hoàn thành). Danh hiệu "Học sinh Xuất sắc" khen thưởng những học sinh được đánh giá kết quả rèn luyện ở mức Tốt, hoàn thành tốt các môn học và có điểm kiểm tra định kỳ từ 9 trở lên.
      </div>
    </div>
  );
};
