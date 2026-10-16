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

  // Helper to get or create result
  const getResult = (studentId: string): SemesterResult => {
    const found = results.find(
      (r) => r.studentId === studentId && r.semester === semester
    );
    if (found) return found;

    return {
      id: `sr-${studentId}-${semester}`,
      studentId,
      schoolYear: settings.schoolYear,
      semester,
      mathScore: 9,
      mathLevel: 'T',
      vietnameseScore: 9,
      vietnameseLevel: 'T',
      englishScore: 9,
      englishLevel: 'T',
      scienceLevel: 'T',
      historyGeoLevel: 'T',
      ethicsLevel: 'T',
      musicLevel: 'T',
      artLevel: 'T',
      peLevel: 'T',
      selfAutonomy: 'T',
      communication: 'T',
      problemSolving: 'T',
      patriotism: 'T',
      compassion: 'T',
      diligence: 'T',
      honesty: 'T',
      responsibility: 'T',
      awardTitle: 'Học sinh Xuất sắc',
      overallComment: 'Chăm ngoan, tích cực và hoàn thành xuất sắc các nội dung học tập.',
    };
  };

  // Update specific field for student result
  const updateResultField = (
    studentId: string,
    field: keyof SemesterResult,
    value: unknown
  ) => {
    const existing = results.find(
      (r) => r.studentId === studentId && r.semester === semester
    );
    let updated: SemesterResult[];

    if (existing) {
      updated = results.map((r) =>
        r.id === existing.id ? { ...r, [field]: value } : r
      );
    } else {
      const newR = { ...getResult(studentId), [field]: value };
      updated = [...results, newR];
    }

    onUpdateResults(updated);
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

      jsonData.forEach((row) => {
        const code = String(row['Mã HS'] || row['Mã học sinh'] || '');
        const student = students.find((s) => s.code === code);
        if (student) {
          const idx = newResults.findIndex(
            (r) => r.studentId === student.id && r.semester === semester
          );
          const mathScore = Number(row['Điểm KTĐK Toán'] || 9);
          const vietnameseScore = Number(row['Điểm KTĐK T.Việt'] || 9);
          const englishScore = Number(row['Điểm KTĐK T.Anh'] || 9);
          const mathLevel = (String(row['Mức đạt Toán (T/H/C)'] || 'T')) as SubjectEvaluationLevel;
          const awardTitle = (String(row['Danh hiệu khen thưởng'] || 'Học sinh Xuất sắc')) as SemesterResult['awardTitle'];

          const resItem: SemesterResult = {
            id: `sr-${student.id}-${semester}`,
            studentId: student.id,
            schoolYear: settings.schoolYear,
            semester,
            mathScore,
            mathLevel: ['T', 'H', 'C'].includes(mathLevel) ? mathLevel : 'T',
            vietnameseScore,
            vietnameseLevel: 'T',
            englishScore,
            englishLevel: 'T',
            scienceLevel: 'T',
            historyGeoLevel: 'T',
            ethicsLevel: 'T',
            musicLevel: 'T',
            artLevel: 'T',
            peLevel: 'T',
            selfAutonomy: 'T',
            communication: 'T',
            problemSolving: 'T',
            patriotism: 'T',
            compassion: 'T',
            diligence: 'T',
            honesty: 'T',
            responsibility: 'T',
            awardTitle,
            overallComment: String(row['Nhận xét chung'] || 'Hoàn thành xuất sắc nhiệm vụ học tập.'),
          };

          if (idx >= 0) {
            newResults[idx] = resItem;
          } else {
            newResults.push(resItem);
          }
        }
      });

      onUpdateResults(newResults);
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

      {/* Main Table Matrix (Conforming to Circular 27) */}
      <div className="overflow-x-auto rounded-2xl border border-sky-100 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-sky-50/80 text-slate-700 font-bold border-b border-sky-100 sticky top-0">
            <tr>
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

              return (
                <tr key={student.id} className="hover:bg-slate-50/60 transition">
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
                        value={res.mathScore ?? 9}
                        onChange={(e) =>
                          updateResultField(student.id, 'mathScore', Number(e.target.value))
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
                        value={res.vietnameseScore ?? 9}
                        onChange={(e) =>
                          updateResultField(student.id, 'vietnameseScore', Number(e.target.value))
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
                        value={res.englishScore ?? 9}
                        onChange={(e) =>
                          updateResultField(student.id, 'englishScore', Number(e.target.value))
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
