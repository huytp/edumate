import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Code,
  FileCode,
  KeyRound,
  Laptop,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Upload,
  Volume2,
} from 'lucide-react';
import { AppSettings } from '../../types';
import { soundManager } from '../../utils/audio';
import { AVATAR_OPTIONS } from '../../utils/storage';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  const logoUploadRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    soundManager.setEnabled(
      formData.soundEffectsEnabled,
      formData.speechEnabled,
      formData.speechRate,
      formData.speechPitch ?? 1.30,
      formData.preferredVoiceURI ?? ''
    );
    soundManager.playSuccess();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Test Voice Synthesis
  const handleTestSpeech = () => {
    soundManager.speak(
      `Xin chào các em học sinh lớp ${formData.className} trường ${formData.schoolName}! Chúc các em học tập vui vẻ!`,
      formData.speechVoice === 'en' ? 'en-US' : 'vi-VN'
    );
  };

  // Upload Custom App Logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, appLogo: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Import JSON Backup
  return (
    <div className="max-w-4xl space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-sky-600" />
          Cài Đặt Hệ Thống EduMate
        </h2>
        <p className="text-xs text-slate-500">
          Tùy chỉnh thông tin lớp học, ảnh đại diện ứng dụng và hiệu ứng âm thanh
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: CLASSROOM & TEACHER INFORMATION */}
        <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">
            1. Thông Tin Trường Lớp & Giáo Viên
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên trường học *
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lớp học *
              </label>
              <input
                type="text"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Năm học *
              </label>
              <input
                type="text"
                value={formData.schoolYear}
                onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và tên Giáo viên chủ nhiệm *
              </label>
              <input
                type="text"
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số điện thoại / Zalo giáo viên *
              </label>
              <input
                type="text"
                value={formData.teacherPhone}
                onChange={(e) => setFormData({ ...formData, teacherPhone: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mã lớp (nằm trong link lớp gửi phụ huynh ở mục Cổng phụ huynh)
              </label>
              <input
                type="text"
                value={formData.classCode || ''}
                readOnly
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-mono font-bold tracking-widest text-sky-700"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: APP LOGO & AVATAR */}
        <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">
            2. Ảnh Đại Diện Ứng Dụng (Logo Lớp Học)
          </h3>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-3xl text-white shadow-md overflow-hidden">
              {formData.appLogo.startsWith('data:image') || formData.appLogo.startsWith('http') ? (
                <img src={formData.appLogo} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <span>{formData.appLogo}</span>
              )}
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => logoUploadRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <Upload className="h-4 w-4 text-sky-600" />
                Tải ảnh logo từ máy
              </button>
              <input
                ref={logoUploadRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <p className="text-[11px] text-slate-400">
                Hoặc chọn biểu tượng lớp học dưới đây:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {['🎒', '🏫', '⭐', '🎈', '🚀', '🎨', '📚', '🌻', '🦁', '🦉'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setFormData({ ...formData, appLogo: emoji })}
                className={`h-9 w-9 rounded-xl text-lg flex items-center justify-center transition ${
                  formData.appLogo === emoji
                    ? 'bg-sky-500 text-white scale-110 shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 3: SOUND EFFECTS & SPEECH TTS */}
        <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                3. Âm Thanh & Giọng Đọc Trò Chơi Tương Tác
              </h3>
              <p className="text-[11px] text-slate-500">
                Thiết lập giọng nữ cô giáo nhẹ nhàng, chuẩn Tiếng Việt & Tiếng Anh, đọc chậm rãi cho học sinh Lớp 1.
              </p>
            </div>
            <span className="rounded-full bg-pink-100 text-pink-700 px-2.5 py-0.5 text-[10px] font-extrabold flex items-center gap-1">
              👩‍🏫 100% Giọng Nữ
            </span>
          </div>

          {/* Female Voice Banner */}
          <div className="flex items-center gap-3.5 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-sky-50 border border-pink-200/90 p-4">
            <span className="text-3xl">👩‍🏫</span>
            <div className="flex-1 text-left">
              <span className="text-xs font-black text-pink-900 block">
                Nhân vật giọng đọc: Cô giáo Trợ giảng (Giọng nữ truyền cảm, dịu dàng)
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Ứng dụng đã loại bỏ hoàn toàn giọng đọc nam, tự động ưu tiên giọng nữ ngọt ngào, ấm áp như cô giáo trên lớp, đọc câu hỏi và đáp án chậm rãi, dễ nghe.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 cursor-pointer hover:bg-slate-50 transition">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Hiệu ứng âm thanh (Sound Effects)
                </span>
                <span className="text-[11px] text-slate-500">
                  Tiếng vỗ tay, chuông ting ting, nhạc quay số
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.soundEffectsEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, soundEffectsEnabled: e.target.checked })
                }
                className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 cursor-pointer hover:bg-slate-50 transition">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">
                    Giọng đọc cô giáo (Giọng nữ nhẹ nhàng)
                  </span>
                  <span className="rounded-md bg-pink-100 text-pink-700 px-1.5 py-0.2 text-[10px] font-bold">
                    Nữ chuẩn
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Phát âm nhẹ nhàng, ấm áp; lời chúc trò chơi bằng Tiếng Anh
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.speechEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, speechEnabled: e.target.checked })
                }
                className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
            </label>
          </div>

          {/* Voice selector and Speed Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Preferred Voice Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Chọn giọng nữ cài đặt trên máy:
              </label>
              <select
                value={formData.preferredVoiceURI || ''}
                onChange={(e) => {
                  setFormData({ ...formData, preferredVoiceURI: e.target.value });
                  soundManager.setPreferredVoice(e.target.value);
                }}
                className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs bg-white focus:border-sky-500 focus:outline-hidden"
              >
                <option value="">🌸 Tự động chọn giọng nữ tối ưu (Hoài My / Jenny / Samantha)</option>
                {soundManager.getAvailableFemaleVoices().map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.displayName}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 block">
                Hệ thống chỉ liệt kê giọng nữ đã được kiểm tra an toàn.
              </span>
            </div>

            {/* Speed Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Tốc độ đọc của cô:</span>
                <span className="font-bold text-sky-600">
                  {formData.speechRate || 0.70}x (
                  {formData.speechRate <= 0.72 ? 'Chậm rãi, rõ ràng cho Lớp 1' : 'Vừa phải'})
                </span>
              </div>
              <input
                type="range"
                min="0.55"
                max="0.90"
                step="0.05"
                value={formData.speechRate || 0.70}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setFormData({ ...formData, speechRate: val });
                  soundManager.setSpeechRate(val);
                }}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Rất chậm (0.55x)</span>
                <span className="font-bold text-emerald-600">Khuyên dùng (0.70x)</span>
                <span>Nhanh hơn (0.90x)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() =>
                soundManager.speakSlowly(
                  `Xin chào các con học sinh yêu quý của lớp ${formData.className}! Hôm nay chúng mình cùng học tập thật vui và chăm ngoan nhé!`,
                  'vi-VN'
                )
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100 transition shadow-2xs"
            >
              <Volume2 className="h-4 w-4 text-sky-600" />
              Nghe thử giọng nữ đọc chậm (Tiếng Việt)
            </button>

            <button
              type="button"
              onClick={() => soundManager.speakEnglishPraise()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
            >
              <Volume2 className="h-4 w-4 text-emerald-600" />
              Lời khen ngắn: Good job, Well done, Wonderful
            </button>

            <button
              type="button"
              onClick={() => soundManager.speakEnglishEncouragement()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition shadow-2xs"
            >
              <Volume2 className="h-4 w-4 text-amber-600" />
              Lời động viên: Keep going, Don't worry, Nice try
            </button>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex items-center justify-between pt-2">
          {isSaved ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              ✓ Đã lưu cài đặt thành công!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:from-sky-600 hover:to-blue-700 active:scale-95 transition"
          >
            <Save className="h-4 w-4" />
            Lưu Cài Đặt Hệ Thống
          </button>
        </div>
      </form>

    </div>
  );
};
