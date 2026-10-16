import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle,
  Dices,
  Gift,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  Volume2,
} from 'lucide-react';
import {
  AppSettings,
  AttendanceRecord,
  PointHistory,
  Student,
} from '../../types';
import { soundManager } from '../../utils/audio';
import { getTodayDateStr } from '../../utils/storage';

interface RandomPickerViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  settings: AppSettings;
  onUpdateStudents: (students: Student[]) => void;
  onUpdatePointsHistory: (history: PointHistory[]) => void;
}

export const RandomPickerView: React.FC<RandomPickerViewProps> = ({
  students,
  attendance,
  settings,
  onUpdateStudents,
  onUpdatePointsHistory,
}) => {
  const [mode, setMode] = useState<'wheel' | 'mystery_box' | 'flip_cards'>('wheel');
  const [onlyPresent, setOnlyPresent] = useState(true);
  const [excludeCalled, setExcludeCalled] = useState(false);
  const [calledIds, setCalledIds] = useState<string[]>([]);

  // Wheel state
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<Student | null>(null);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mystery boxes state
  const [openedBoxIndex, setOpenedBoxIndex] = useState<number | null>(null);

  // Cards state
  const [flippedCardIndex, setFlippedCardIndex] = useState<number | null>(null);

  // Filter eligible students
  const today = getTodayDateStr();
  const eligibleStudents = students.filter((s) => {
    if (onlyPresent) {
      const rec = attendance.find((r) => r.studentId === s.id && r.date === today);
      if (rec && (rec.status === 'excused' || rec.status === 'unexcused')) {
        return false;
      }
    }
    if (excludeCalled && calledIds.includes(s.id)) {
      return false;
    }
    return true;
  });

  // Color palette for wheel
  const WHEEL_COLORS = [
    '#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f472b6', 
    '#a78bfa', '#2dd4bf', '#fb923c', '#60a5fa', '#4ade80'
  ];

  // Draw wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || eligibleStudents.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 10;
    const numSegments = eligibleStudents.length;
    const anglePerSegment = (2 * Math.PI) / numSegments;

    ctx.clearRect(0, 0, width, height);

    eligibleStudents.forEach((student, i) => {
      const startAngle = i * anglePerSegment;
      const endAngle = startAngle + anglePerSegment;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Draw text and avatar
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 4;

      const label = `${student.avatar} ${student.name.split(' ').slice(-2).join(' ')}`;
      ctx.fillText(label, radius - 18, 5);
      ctx.restore();
    });

    // Draw center hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#0284c7';
    ctx.stroke();

    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0284c7';
    ctx.fillText('⭐', centerX, centerY);
  }, [eligibleStudents, wheelRotation]);

  // Spin Wheel action
  const handleSpinWheel = () => {
    if (isSpinning || eligibleStudents.length === 0) return;

    setIsSpinning(true);
    setSelectedWinner(null);

    // Pick random winner
    const winnerIndex = Math.floor(Math.random() * eligibleStudents.length);
    const winner = eligibleStudents[winnerIndex];

    const numSegments = eligibleStudents.length;
    const segmentAngle = 360 / numSegments;

    // Pointer is at right (0 deg) or top (270 deg)
    // Pointer is at 270 deg (top):
    const targetAngle = 270 - (winnerIndex * segmentAngle + segmentAngle / 2);
    const totalSpins = 5 + Math.floor(Math.random() * 3); // 5-7 full spins
    const finalRotation = wheelRotation + totalSpins * 360 + (targetAngle - (wheelRotation % 360));

    // Audio ticks during spin
    let tickCount = 0;
    const interval = setInterval(() => {
      soundManager.playTick();
      tickCount++;
      if (tickCount > 25) clearInterval(interval);
    }, 120);

    setWheelRotation(finalRotation);

    setTimeout(() => {
      clearInterval(interval);
      setIsSpinning(false);
      setSelectedWinner(winner);
      setCalledIds((prev) => [...prev, winner.id]);

      // Sound & Confetti
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      soundManager.playFanfare();
      soundManager.speakSlowly(
        `Chúc mừng em ${winner.name} đã được gọi lên bảng nha! Cố lên con!`,
        'vi-VN'
      );
    }, 3500);
  };

  // Mystery Box Pick
  const handlePickBox = (boxIndex: number) => {
    if (openedBoxIndex !== null || eligibleStudents.length === 0) return;
    setOpenedBoxIndex(boxIndex);

    const winner = eligibleStudents[Math.floor(Math.random() * eligibleStudents.length)];
    setSelectedWinner(winner);
    setCalledIds((prev) => [...prev, winner.id]);

    soundManager.playTick();
    setTimeout(() => {
      confetti({ particleCount: 70, spread: 70 });
      soundManager.playFanfare();
      soundManager.speakSlowly(`Hộp quà chúc mừng em ${winner.name} nha!`, 'vi-VN');
    }, 300);
  };

  // Flip Card Pick
  const handleFlipCard = (cardIndex: number) => {
    if (flippedCardIndex !== null || eligibleStudents.length === 0) return;
    setFlippedCardIndex(cardIndex);

    const winner = eligibleStudents[Math.floor(Math.random() * eligibleStudents.length)];
    setSelectedWinner(winner);
    setCalledIds((prev) => [...prev, winner.id]);

    soundManager.playTick();
    setTimeout(() => {
      confetti({ particleCount: 70, spread: 70 });
      soundManager.playFanfare();
      soundManager.speakSlowly(`Lá bài may mắn gọi tên em ${winner.name} nha!`, 'vi-VN');
    }, 300);
  };

  // Reset Picker
  const handleReset = () => {
    setSelectedWinner(null);
    setOpenedBoxIndex(null);
    setFlippedCardIndex(null);
  };

  // Give points to the lucky student
  const handleAwardWinner = (pts: number) => {
    if (!selectedWinner) return;
    const updated = students.map((s) =>
      s.id === selectedWinner.id
        ? {
            ...s,
            points: s.points + pts,
            stars: s.stars + 1,
            gameParticipationCount: s.gameParticipationCount + 1,
          }
        : s
    );
    onUpdateStudents(updated);

    const newH: PointHistory = {
      id: `ph-${Date.now()}`,
      studentId: selectedWinner.id,
      studentName: selectedWinner.name,
      delta: pts,
      reason: 'Được gọi tên ngẫu nhiên và phát biểu tích cực',
      date: getTodayDateStr(),
      timestamp: Date.now(),
    };
    onUpdatePointsHistory([newH]);

    soundManager.playCoin();
    confetti({ particleCount: 40, spread: 50 });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Modes */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Vòng Quay Gọi Tên Ngẫu Nhiên
          </h2>
          <p className="text-xs text-slate-500">
            Tạo không khí lớp học sôi nổi, hào hứng và công bằng cho mọi học sinh
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-white p-1 border border-sky-100 shadow-xs">
          <button
            onClick={() => {
              setMode('wheel');
              handleReset();
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              mode === 'wheel'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Dices className="h-3.5 w-3.5" />
            Vòng Quay
          </button>
          <button
            onClick={() => {
              setMode('mystery_box');
              handleReset();
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              mode === 'mystery_box'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gift className="h-3.5 w-3.5" />
            Hộp Quà Bí Mật
          </button>
          <button
            onClick={() => {
              setMode('flip_cards');
              handleReset();
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              mode === 'flip_cards'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Lật Thẻ Bài
          </button>
        </div>
      </div>

      {/* Filter and settings bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3.5 border border-sky-100 shadow-xs text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={onlyPresent}
              onChange={(e) => setOnlyPresent(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 h-4 w-4"
            />
            <span>Chỉ chọn học sinh có mặt hôm nay ({eligibleStudents.length}/{students.length})</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={excludeCalled}
              onChange={(e) => setExcludeCalled(e.target.checked)}
              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 h-4 w-4"
            />
            <span>Không gọi lại bạn đã được chọn ({calledIds.length} đã gọi)</span>
          </label>
        </div>

        {calledIds.length > 0 && (
          <button
            onClick={() => setCalledIds([])}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-sky-600"
          >
            <RotateCcw className="h-3 w-3" />
            Đặt lại lượt gọi
          </button>
        )}
      </div>

      {/* Main Interactive Stage */}
      <div className="relative rounded-3xl border border-sky-100 bg-gradient-to-b from-sky-50/50 via-white to-blue-50/30 p-3 sm:p-6 shadow-xs flex flex-col items-center justify-center min-h-[420px] overflow-hidden">
        {/* MODE 1: SPINNING WHEEL */}
        {mode === 'wheel' && (
          <div className="flex flex-col items-center max-w-full">
            {/* Top Pointer Indicator */}
            <div className="z-10 -mb-4 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-rose-500 drop-shadow-md animate-bounce" />
            </div>

            {/* Rotating Canvas */}
            <div className="relative rounded-full p-1.5 sm:p-2 bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 shadow-xl shadow-sky-500/20">
              <canvas
                ref={canvasRef}
                width={360}
                height={360}
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: isSpinning ? 'transform 3.5s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
                }}
                className="rounded-full w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] cursor-pointer touch-manipulation"
                onClick={handleSpinWheel}
              />
            </div>

            <div className="mt-5 sm:mt-6 flex items-center gap-3">
              <button
                disabled={isSpinning || eligibleStudents.length === 0}
                onClick={handleSpinWheel}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-black text-white shadow-lg shadow-orange-500/20 hover:scale-105 transition active:scale-95 disabled:opacity-50"
              >
                <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                {isSpinning ? 'ĐANG QUAY...' : 'QUAY NGAY!'}
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: MYSTERY BOXES */}
        {mode === 'mystery_box' && (
          <div className="w-full max-w-2xl text-center space-y-4 sm:space-y-6">
            <p className="text-xs font-bold text-sky-800">
              Bấm vào bất kỳ hộp quà nào để mở bí mật học sinh may mắn!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              {Array.from({ length: 8 }).map((_, idx) => {
                const isOpened = openedBoxIndex === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => handlePickBox(idx)}
                    disabled={openedBoxIndex !== null}
                    className={`relative flex flex-col items-center justify-center rounded-2xl p-6 border-2 transition transform active:scale-90 ${
                      isOpened
                        ? 'border-amber-400 bg-amber-50 shadow-md scale-105'
                        : 'border-sky-200 bg-white hover:border-sky-400 hover:shadow-md hover:-translate-y-1'
                    }`}
                  >
                    <span className="text-5xl transition-transform">
                      {isOpened ? '🎉' : '🎁'}
                    </span>
                    <span className="mt-2 text-xs font-black text-slate-700">
                      Hộp #{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>

            {openedBoxIndex !== null && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Đóng hộp & Chọn lại
              </button>
            )}
          </div>
        )}

        {/* MODE 3: FLIP CARDS */}
        {mode === 'flip_cards' && (
          <div className="w-full max-w-2xl text-center space-y-6">
            <p className="text-xs font-bold text-sky-800">
              Lật một lá bài may mắn để khám phá học sinh được gọi tên!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, idx) => {
                const isFlipped = flippedCardIndex === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => handleFlipCard(idx)}
                    disabled={flippedCardIndex !== null}
                    className={`h-40 rounded-2xl border-2 flex flex-col items-center justify-center p-4 transition-all transform duration-300 active:scale-95 ${
                      isFlipped
                        ? 'border-emerald-400 bg-emerald-50 scale-105 shadow-lg'
                        : 'border-indigo-200 bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:scale-105 shadow-md'
                    }`}
                  >
                    {isFlipped ? (
                      <div className="space-y-1">
                        <span className="text-4xl">{selectedWinner?.avatar}</span>
                        <div className="text-xs font-extrabold text-emerald-900 mt-2 truncate max-w-[100px]">
                          {selectedWinner?.name}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-4xl">🃏</span>
                        <span className="text-xs font-bold tracking-wider opacity-90 block">
                          EduMate #{idx + 1}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {flippedCardIndex !== null && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Lật úp & Thử lại
              </button>
            )}
          </div>
        )}

        {/* WINNER CELEBRATION SPOTLIGHT MODAL / CARD */}
        {selectedWinner && (
          <div className="mt-6 w-full max-w-md animate-in zoom-in-95 duration-200 rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white p-6 text-center shadow-xl">
            <div className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-amber-950 mb-3 shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              CHÚC MỪNG BẠN ĐÃ ĐƯỢC CHỌN!
            </div>

            <div className="text-6xl my-2 animate-bounce">{selectedWinner.avatar}</div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {selectedWinner.name}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Mã HS: {selectedWinner.code} • Lớp {settings.className}
            </p>

            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() =>
                  soundManager.speakSlowly(`Xin mời em ${selectedWinner.name} đứng lên phát biểu bài nha!`, 'vi-VN')
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Volume2 className="h-4 w-4 text-sky-600" />
                Đọc lại tên
              </button>

              <button
                onClick={() => handleAwardWinner(2)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-extrabold text-white shadow-xs hover:from-amber-600 hover:to-orange-600 active:scale-95"
              >
                <Award className="h-4 w-4" />
                + Tặng 2 Điểm Phát Biểu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
