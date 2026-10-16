import React, { useRef, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Edit2,
  FileSpreadsheet,
  FileText,
  KeyRound,
  Plus,
  Search,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { AppSettings, Student } from '../../types';
import { soundManager } from '../../utils/audio';
import {
  AVATAR_OPTIONS,
  exportStudentsToExcel,
  parseStudentImportFile,
} from '../../utils/storage';

interface StudentManagementViewProps {
  students: Student[];
  settings: AppSettings;
  onUpdateStudents: (students: Student[]) => void;
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  students,
  settings,
  onUpdateStudents,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Nam' | 'Nữ'>('all');

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form fields
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDob, setFormDob] = useState('2019-01-01');
  const [formGender, setFormGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [formAvatar, setFormAvatar] = useState('👦🏻');
  const [formParentName, setFormParentName] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('');
  const [formPassword, setFormPassword] = useState('123');
  const [formNotes, setFormNotes] = useState('');

  // Import modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedPreview, setImportedPreview] = useState<Partial<Student>[]>([]);
  const [importStatus, setImportStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarUploadRef = useRef<HTMLInputElement>(null);

  // Copy success notification
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.parentPhone.includes(searchQuery);
    const matchesGender = genderFilter === 'all' || s.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  const openAddModal = () => {
    const nextNum = students.length + 1;
    setEditingStudent(null);
    setFormCode(`HS${String(nextNum).padStart(3, '0')}`);
    setFormName('');
    setFormDob('2019-01-01');
    setFormGender('Nam');
    setFormAvatar('👦🏻');
    setFormParentName('');
    setFormParentPhone('');
    setFormPassword('123');
    setFormNotes('');
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormCode(student.code);
    setFormName(student.name);
    setFormDob(student.dob);
    setFormGender(student.gender);
    setFormAvatar(student.avatar);
    setFormParentName(student.parentName);
    setFormParentPhone(student.parentPhone);
    setFormPassword(student.password);
    setFormNotes(student.notes || '');
    setIsAddEditModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingStudent) {
      // Update
      const updated = students.map((s) =>
        s.id === editingStudent.id
          ? {
              ...s,
              code: formCode.trim().toUpperCase(),
              name: formName.trim(),
              dob: formDob,
              gender: formGender,
              avatar: formAvatar,
              parentName: formParentName.trim() || `PH em ${formName.trim()}`,
              parentPhone: formParentPhone.trim(),
              password: formPassword.trim() || '123',
              notes: formNotes.trim(),
            }
          : s
      );
      onUpdateStudents(updated);
    } else {
      // Add new
      const newStudent: Student = {
        id: `hs-${Date.now()}`,
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        dob: formDob,
        gender: formGender,
        avatar: formAvatar,
        parentName: formParentName.trim() || `PH em ${formName.trim()}`,
        parentPhone: formParentPhone.trim(),
        password: formPassword.trim() || '123',
        points: 10,
        stars: 3,
        gameParticipationCount: 0,
        notes: formNotes.trim(),
      };
      onUpdateStudents([...students, newStudent]);
    }

    soundManager.playSuccess();
    setIsAddEditModalOpen(false);
  };

  const handleDeleteStudent = (student: Student) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa học sinh "${student.name}" khỏi danh sách?`)) {
      onUpdateStudents(students.filter((s) => s.id !== student.id));
      soundManager.playTick();
    }
  };

  // Avatar Image Upload
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Import Excel/Word file handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImportStatus('Đang đọc file...');
      const parsed = await parseStudentImportFile(file);
      if (parsed.length > 0) {
        setImportedPreview(parsed);
        setImportStatus(`Đã tìm thấy ${parsed.length} học sinh sẵn sàng nhập!`);
      } else {
        setImportStatus('Không tìm thấy dữ liệu học sinh trong file.');
      }
    } catch (err) {
      setImportStatus('Lỗi khi đọc file. Vui lòng kiểm tra định dạng.');
    }
  };

  const confirmImport = () => {
    if (importedPreview.length === 0) return;
    const newStudents: Student[] = importedPreview.map((item, idx) => ({
      id: `hs-import-${Date.now()}-${idx}`,
      code: item.code || `HS${String(students.length + idx + 1).padStart(3, '0')}`,
      name: item.name || `Học sinh ${idx + 1}`,
      dob: item.dob || '2019-01-01',
      gender: (item.gender as 'Nam' | 'Nữ') || 'Nam',
      avatar: item.avatar || (item.gender === 'Nữ' ? '👧🏻' : '👦🏻'),
      parentName: item.parentName || `PH em ${item.name}`,
      parentPhone: item.parentPhone || '',
      password: item.password || '123',
      points: 10,
      stars: 3,
      gameParticipationCount: 0,
      notes: 'Nhập từ file',
    }));

    onUpdateStudents([...students, ...newStudents]);
    soundManager.playSuccess();
    setIsImportModalOpen(false);
    setImportedPreview([]);
    setImportStatus('');
  };

  // Copy Parent Credentials to clipboard for Zalo sending
  const copyCredentials = (student: Student) => {
    const text = `Kính gửi phụ huynh em ${student.name} (${settings.className} - ${settings.schoolName}).\nĐể tra cứu học tập của con trên EduMate, phụ huynh vui lòng đăng ký tài khoản Phụ huynh tại ${window.location.origin}, sau đó liên kết với con bằng:\n- Mã lớp: ${settings.classCode}\n- Mã học sinh: ${student.code}\n- Mật khẩu: ${student.password}\n- Giáo viên chủ nhiệm: ${settings.teacherName} (${settings.teacherPhone})`;
    navigator.clipboard.writeText(text);
    setCopiedId(student.id);
    soundManager.playTick();
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Quản Lý Danh Sách Học Sinh
          </h2>
          <p className="text-xs text-slate-500">
            Lớp {settings.className} • Tổng số {students.length} học sinh
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export to Excel */}
          <button
            onClick={() => exportStudentsToExcel(students, settings.className)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition active:scale-95"
            title="Xuất file Excel danh sách học sinh"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>

          {/* Import from Word / Excel */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition active:scale-95"
            title="Thêm danh sách học sinh từ file Word hoặc Excel"
          >
            <Upload className="h-4 w-4 text-sky-600" />
            <span>Nhập Word / Excel</span>
          </button>

          {/* Add Student */}
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:from-sky-600 hover:to-blue-700 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm Học Sinh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-2xl bg-white p-3.5 border border-sky-100 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học sinh, mã số (HS001), số điện thoại..."
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-xs focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-200"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setGenderFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              genderFilter === 'all'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({students.length})
          </button>
          <button
            onClick={() => setGenderFilter('Nam')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              genderFilter === 'Nam'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nam ({students.filter((s) => s.gender === 'Nam').length})
          </button>
          <button
            onClick={() => setGenderFilter('Nữ')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              genderFilter === 'Nữ'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nữ ({students.filter((s) => s.gender === 'Nữ').length})
          </button>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredStudents.map((student) => {
          const isCopied = copiedId === student.id;

          return (
            <div
              key={student.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-sky-100 bg-white p-4 shadow-xs transition hover:border-sky-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-100 to-blue-50 border border-sky-200 text-2xl overflow-hidden shadow-xs">
                      {student.avatar.startsWith('data:image') || student.avatar.startsWith('http') ? (
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{student.avatar}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 text-sm group-hover:text-sky-600 transition">
                          {student.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-600">
                          {student.code}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            student.gender === 'Nữ' ? 'text-pink-600' : 'text-blue-600'
                          }`}
                        >
                          {student.gender}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Dropdown / Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(student)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition"
                      title="Chỉnh sửa thông tin & ảnh đại diện"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Xóa học sinh"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info Fields */}
                <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50/70 p-2.5 text-[11px] text-slate-600 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ngày sinh:</span>
                    <span className="font-medium text-slate-700">{student.dob}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phụ huynh:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[130px]">
                      {student.parentName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số ĐT:</span>
                    <span className="font-medium text-slate-700">{student.parentPhone || 'Chưa có'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/50">
                    <span className="text-slate-400 flex items-center gap-1">
                      <KeyRound className="h-3 w-3 text-slate-400" /> Pass PH:
                    </span>
                    <span className="font-mono font-bold text-sky-700">{student.password}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Badges & Credentials Copy */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    ⭐ {student.points} pts
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {student.gameParticipationCount} game
                  </span>
                </div>

                <button
                  onClick={() => copyCredentials(student)}
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                    isCopied
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                  }`}
                  title="Copy tài khoản & mật khẩu gửi Zalo cho phụ huynh"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span>Đã copy!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Cấp pass PH</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-2 text-sm font-bold text-slate-700">Không tìm thấy học sinh</h3>
          <p className="mt-1 text-xs text-slate-400">
            Hãy thử tìm kiếm với từ khóa khác hoặc bấm nút "Thêm Học Sinh".
          </p>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-sky-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-sky-50/70 px-6 py-4">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingStudent ? 'Chỉnh Sửa Thông Tin Học Sinh' : 'Thêm Học Sinh Mới'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Ảnh đại diện học sinh
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-sky-300 bg-sky-50 text-3xl shadow-xs overflow-hidden">
                    {formAvatar.startsWith('data:image') || formAvatar.startsWith('http') ? (
                      <img src={formAvatar} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span>{formAvatar}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => avatarUploadRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Upload className="h-3.5 w-3.5 text-sky-600" />
                      Tải ảnh từ máy
                    </button>
                    <input
                      ref={avatarUploadRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileUpload}
                      className="hidden"
                    />
                    <p className="text-[10px] text-slate-400">Hoặc chọn biểu tượng bên dưới:</p>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormAvatar(emoji)}
                      className={`h-8 w-8 rounded-lg text-lg flex items-center justify-center transition ${
                        formAvatar === emoji
                          ? 'bg-sky-500 text-white scale-110 shadow-xs'
                          : 'hover:bg-slate-200/60'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã học sinh *
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs uppercase font-mono font-bold focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Bảo Nam"
                    required
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* DOB & Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={formDob}
                    onChange={(e) => setFormDob(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as 'Nam' | 'Nữ')}
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-sky-500 focus:outline-hidden bg-white"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              {/* Parent Info & Password */}
              <div className="rounded-xl bg-sky-50/50 p-3.5 border border-sky-100 space-y-3">
                <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
                  Thông tin kết nối Phụ Huynh
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Họ tên Phụ huynh
                    </label>
                    <input
                      type="text"
                      value={formParentName}
                      onChange={(e) => setFormParentName(e.target.value)}
                      placeholder="Bố/Mẹ em..."
                      className="w-full rounded-xl border border-slate-300 bg-white py-1.5 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formParentPhone}
                      onChange={(e) => setFormParentPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full rounded-xl border border-slate-300 bg-white py-1.5 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Mật khẩu liên kết của phụ huynh
                  </label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Mặc định: 123"
                    className="w-full rounded-xl border border-slate-300 bg-white py-1.5 px-3 text-xs font-mono focus:border-sky-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Phụ huynh đăng ký tài khoản rồi liên kết với con bằng Mã lớp ({settings.classCode}), Mã học sinh và Mật khẩu này.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú đặc biệt về học sinh
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Tính cách, năng khiếu, cần lưu ý sức khỏe..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 py-1.5 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:from-sky-600 hover:to-blue-700"
                >
                  {editingStudent ? 'Lưu thay đổi' : 'Thêm học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Word / Excel Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-sky-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-sky-50/70 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white">
                  <Upload className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Nhập Danh Sách Học Sinh Từ File
                  </h3>
                  <p className="text-xs text-slate-500">Hỗ trợ Excel (.xlsx, .csv) hoặc Word/Text (.docx, .txt)</p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* File upload box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/50 p-6 text-center hover:bg-sky-50 transition"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-700">
                  Bấm để chọn file Excel (.xlsx) hoặc Text/Word từ máy tính
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Hệ thống tự động nhận diện các cột: Họ và tên, Mã học sinh, Ngày sinh, Giới tính, SĐT PH
                </p>
              </div>

              {importStatus && (
                <div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-800 border border-blue-200 font-medium">
                  {importStatus}
                </div>
              )}

              {/* Preview table */}
              {importedPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">
                      Xem trước danh sách ({importedPreview.length} học sinh):
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 sticky top-0">
                        <tr>
                          <th className="p-2">Mã HS</th>
                          <th className="p-2">Họ và tên</th>
                          <th className="p-2">Giới tính</th>
                          <th className="p-2">SĐT PH</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importedPreview.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono">{item.code}</td>
                            <td className="p-2 font-semibold text-slate-800">{item.name}</td>
                            <td className="p-2">{item.gender}</td>
                            <td className="p-2">{item.parentPhone || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => exportStudentsToExcel(students, 'Mau_Nhap_Lieu')}
                  className="inline-flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 font-medium"
                >
                  <Download className="h-3.5 w-3.5" />
                  Tải file mẫu Excel chuẩn
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    disabled={importedPreview.length === 0}
                    onClick={confirmImport}
                    className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition"
                  >
                    Xác nhận nhập {importedPreview.length > 0 ? `(${importedPreview.length})` : ''}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
