import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileSpreadsheet,
  HelpCircle,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react';
import {
  AppSettings,
  AttendanceRecord,
  AttendanceStatus,
  Student,
} from '../../types';
import { soundManager } from '../../utils/audio';
import { exportAttendanceToExcel, getTodayDateStr } from '../../utils/storage';

interface AttendanceViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  settings: AppSettings;
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  attendance,
  settings,
  onUpdateAttendance,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr());
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | 'all'>('all');

  // Change date helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Get status for student on selected date
  const getRecord = (studentId: string): AttendanceRecord | undefined => {
    return attendance.find((r) => r.studentId === studentId && r.date === selectedDate);
  };

  // Update status for student
  const setStatus = (studentId: string, status: AttendanceStatus) => {
    const existing = getRecord(studentId);
    let updated: AttendanceRecord[];
    if (existing) {
      updated = attendance.map((r) =>
        r.id === existing.id ? { ...r, status } : r
      );
    } else {
      const newRec: AttendanceRecord = {
        id: `att-${selectedDate}-${studentId}`,
        date: selectedDate,
        studentId,
        status,
      };
      updated = [...attendance, newRec];
    }
    onUpdateAttendance(updated);
    soundManager.playTick();
  };

  // Update note for student
  const setNote = (studentId: string, note: string) => {
    const existing = getRecord(studentId);
    let updated: AttendanceRecord[];
    if (existing) {
      updated = attendance.map((r) =>
        r.id === existing.id ? { ...r, note } : r
      );
    } else {
      const newRec: AttendanceRecord = {
        id: `att-${selectedDate}-${studentId}`,
        date: selectedDate,
        studentId,
        status: 'present',
        note,
      };
      updated = [...attendance, newRec];
    }
    onUpdateAttendance(updated);
  };

  // Batch mark all present
  const handleMarkAllPresent = () => {
    const currentStudentsMap = new Map(
      attendance
        .filter((r) => r.date === selectedDate)
        .map((r) => [r.studentId, r])
    );

    const otherDates = attendance.filter((r) => r.date !== selectedDate);
    const newRecordsForDate = students.map((s) => {
      const existing = currentStudentsMap.get(s.id);
      return {
        id: existing ? existing.id : `att-${selectedDate}-${s.id}`,
        date: selectedDate,
        studentId: s.id,
        status: 'present' as AttendanceStatus,
        note: existing?.note,
      };
    });

    onUpdateAttendance([...otherDates, ...newRecordsForDate]);
    soundManager.playSuccess();
  };

  // Metrics
  const dateRecords = students.map((s) => getRecord(s.id) || { status: 'present' });
  const presentCount = dateRecords.filter((r) => r.status === 'present').length;
  const excusedCount = dateRecords.filter((r) => r.status === 'excused').length;
  const unexcusedCount = dateRecords.filter((r) => r.status === 'unexcused').length;
  const lateCount = dateRecords.filter((r) => r.status === 'late').length;
  const rate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 100;

  const filteredStudents = students.filter((s) => {
    if (filterStatus === 'all') return true;
    const rec = getRecord(s.id);
    const st = rec ? rec.status : 'present';
    return st === filterStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Date Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Điểm Danh Học Sinh Hàng Ngày
          </h2>
          <p className="text-xs text-slate-500">
            Lớp {settings.className} • Đồng bộ tức thì lên hồ sơ tra cứu của phụ huynh
          </p>
        </div>

        {/* Date Selector & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl border border-sky-200 bg-white shadow-xs p-1">
            <button
              onClick={handlePrevDay}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 transition"
              title="Ngày trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 px-2">
              <Calendar className="h-4 w-4 text-sky-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-bold text-slate-800 focus:outline-hidden bg-transparent cursor-pointer"
              />
            </div>
            <button
              onClick={handleNextDay}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 transition"
              title="Ngày sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setSelectedDate(getTodayDateStr())}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            Hôm nay
          </button>

          <button
            onClick={handleMarkAllPresent}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:from-emerald-600 hover:to-teal-700 transition active:scale-95"
          >
            <CheckCircle className="h-4 w-4" />
            Tất cả có mặt
          </button>

          <button
            onClick={() => exportAttendanceToExcel(students, attendance, selectedDate)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            title="Xuất file Excel điểm danh ngày này"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-sky-100 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Sĩ số</span>
            <Users className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-800">{students.length}</span>
            <span className="text-[11px] font-semibold text-emerald-600">({rate}% đến lớp)</span>
          </div>
        </div>

        <button
          onClick={() => setFilterStatus(filterStatus === 'present' ? 'all' : 'present')}
          className={`rounded-2xl border p-3.5 text-left transition shadow-xs ${
            filterStatus === 'present'
              ? 'border-emerald-400 bg-emerald-50/80 ring-2 ring-emerald-200'
              : 'border-emerald-100 bg-white hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>Có mặt</span>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-1 text-xl font-black text-emerald-600">{presentCount}</div>
        </button>

        <button
          onClick={() => setFilterStatus(filterStatus === 'excused' ? 'all' : 'excused')}
          className={`rounded-2xl border p-3.5 text-left transition shadow-xs ${
            filterStatus === 'excused'
              ? 'border-amber-400 bg-amber-50/80 ring-2 ring-amber-200'
              : 'border-amber-100 bg-white hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-700">
            <span>Vắng có phép</span>
            <HelpCircle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-1 text-xl font-black text-amber-600">{excusedCount}</div>
        </button>

        <button
          onClick={() => setFilterStatus(filterStatus === 'unexcused' ? 'all' : 'unexcused')}
          className={`rounded-2xl border p-3.5 text-left transition shadow-xs ${
            filterStatus === 'unexcused'
              ? 'border-rose-400 bg-rose-50/80 ring-2 ring-rose-200'
              : 'border-rose-100 bg-white hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-rose-700">
            <span>Vắng không phép</span>
            <UserX className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-1 text-xl font-black text-rose-600">{unexcusedCount}</div>
        </button>

        <button
          onClick={() => setFilterStatus(filterStatus === 'late' ? 'all' : 'late')}
          className={`col-span-2 sm:col-span-1 rounded-2xl border p-3.5 text-left transition shadow-xs ${
            filterStatus === 'late'
              ? 'border-orange-400 bg-orange-50/80 ring-2 ring-orange-200'
              : 'border-orange-100 bg-white hover:border-orange-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-orange-700">
            <span>Đi muộn</span>
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
          <div className="mt-1 text-xl font-black text-orange-600">{lateCount}</div>
        </button>
      </div>

      {/* Attendance Student List Table */}
      <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
          <span className="text-xs font-bold text-slate-700">
            Danh sách điểm danh ({filteredStudents.length} học sinh)
          </span>
          {filterStatus !== 'all' && (
            <button
              onClick={() => setFilterStatus('all')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700"
            >
              Bỏ lọc (Xem tất cả)
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {filteredStudents.map((student, idx) => {
            const rec = getRecord(student.id);
            const status: AttendanceStatus = rec ? rec.status : 'present';
            const note = rec?.note || '';

            return (
              <div
                key={student.id}
                className="flex flex-col gap-3 p-4 transition hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Student Info */}
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">
                    {idx + 1}
                  </span>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-xl">
                    {student.avatar.startsWith('data:image') || student.avatar.startsWith('http') ? (
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="h-full w-full object-cover rounded-xl"
                      />
                    ) : (
                      <span>{student.avatar}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                      {student.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>{student.code}</span>
                      <span>• PH: {student.parentPhone || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                </div>

                {/* Status selector buttons & reason input */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => setStatus(student.id, 'present')}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        status === 'present'
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      Có mặt
                    </button>
                    <button
                      onClick={() => setStatus(student.id, 'excused')}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        status === 'excused'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      Có phép
                    </button>
                    <button
                      onClick={() => setStatus(student.id, 'unexcused')}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        status === 'unexcused'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                      }`}
                    >
                      Không phép
                    </button>
                    <button
                      onClick={() => setStatus(student.id, 'late')}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        status === 'late'
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-700'
                      }`}
                    >
                      Đi muộn
                    </button>
                  </div>

                  {/* Note input */}
                  {(status !== 'present' || note) && (
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(student.id, e.target.value)}
                      placeholder="Lý do nghỉ / ghi chú..."
                      className="w-full sm:w-44 rounded-xl border border-slate-200 px-2.5 py-1 text-xs focus:border-sky-500 focus:outline-hidden"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
