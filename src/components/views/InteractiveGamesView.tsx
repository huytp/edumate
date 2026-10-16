import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Dices,
  Edit,
  ExternalLink,
  Gamepad2,
  ListPlus,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  X,
  XCircle,
} from 'lucide-react';
import {
  AppSettings,
  InteractiveGameItem,
  PointHistory,
  QuizQuestion,
  Student,
} from '../../types';
import { soundManager } from '../../utils/audio';
import { getTodayDateStr } from '../../utils/storage';

interface InteractiveGamesViewProps {
  games: InteractiveGameItem[];
  students: Student[];
  settings: AppSettings;
  onUpdateGames: (games: InteractiveGameItem[]) => void;
  onUpdateStudents: (students: Student[]) => void;
  onUpdatePointsHistory: (history: PointHistory[]) => void;
}

export const InteractiveGamesView: React.FC<InteractiveGamesViewProps> = ({
  games,
  students,
  settings,
  onUpdateGames,
  onUpdateStudents,
  onUpdatePointsHistory,
}) => {
  // Game session states
  const [activeGame, setActiveGame] = useState<InteractiveGameItem | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [autoReadQuestion, setAutoReadQuestion] = useState<boolean>(true);

  // Integrated wheel inside games
  const [isGameWheelOpen, setIsGameWheelOpen] = useState(false);
  const [chosenContestant, setChosenContestant] = useState<Student | null>(null);

  // Modal: Add / Edit Question
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [targetGameId, setTargetGameId] = useState<string>('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [formPrompt, setFormPrompt] = useState('');
  const [formImage, setFormImage] = useState('🍎');
  const [formEnglishWord, setFormEnglishWord] = useState('');
  const [formPronunciation, setFormPronunciation] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrectIndex, setFormCorrectIndex] = useState<number>(0);
  const [formExplanation, setFormExplanation] = useState('');

  // Modal: Manage Questions for a Game
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [managingGame, setManagingGame] = useState<InteractiveGameItem | null>(null);

  // Modal: Create New Game
  const [isCreateGameModalOpen, setIsCreateGameModalOpen] = useState(false);
  const [newGameTitle, setNewGameTitle] = useState('');
  const [newGameDesc, setNewGameDesc] = useState('');
  const [newGameCategory, setNewGameCategory] = useState<'english_vocab' | 'math_blitz' | 'trivia' | 'external'>('trivia');
  const [newGameIcon, setNewGameIcon] = useState('🎮');
  const [newGameUrl, setNewGameUrl] = useState('');

  // Modal: Confirm Delete Game
  const [gameToDelete, setGameToDelete] = useState<InteractiveGameItem | null>(null);

  const handleDeleteGame = (game: InteractiveGameItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setGameToDelete(game);
  };

  const confirmDeleteGame = () => {
    if (!gameToDelete) return;
    const updated = games.filter((g) => g.id !== gameToDelete.id);
    onUpdateGames(updated);
    if (activeGame?.id === gameToDelete.id) {
      setActiveGame(null);
      soundManager.stopSpeaking();
    }
    if (managingGame?.id === gameToDelete.id) {
      setManagingGame(null);
      setIsManageModalOpen(false);
    }
    setGameToDelete(null);
    soundManager.playTick();
  };

  // Current question helper
  const currentQuestion = activeGame?.questions?.[currentQuestionIndex];

  // Auto read question slowly when moving to a new question if enabled
  useEffect(() => {
    if (activeGame && currentQuestion && !gameFinished && autoReadQuestion) {
      const timer = setTimeout(() => {
        soundManager.speakSlowly(`Câu hỏi: ${currentQuestion.prompt}`, 'vi-VN');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeGame, currentQuestionIndex, gameFinished, autoReadQuestion]);

  // Clean up audio on unmount or close
  useEffect(() => {
    return () => {
      soundManager.stopSpeaking();
    };
  }, []);

  // Start a game
  const handleLaunchGame = (game: InteractiveGameItem) => {
    if (game.category === 'external' && game.externalUrl) {
      window.open(game.externalUrl, '_blank');
      const updated = games.map((g) =>
        g.id === game.id ? { ...g, playCount: g.playCount + 1 } : g
      );
      onUpdateGames(updated);
      return;
    }

    if (!game.questions || game.questions.length === 0) {
      alert('Trò chơi này hiện chưa có câu hỏi nào. Bạn có thể bấm "Quản lý câu hỏi" để thêm câu hỏi mới!');
      return;
    }

    setActiveGame(game);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setGameFinished(false);
    soundManager.playSuccess();
    soundManager.speak("Welcome students! Let's play!", 'en-US', 1.30, 0.70);

    const updated = games.map((g) =>
      g.id === game.id ? { ...g, playCount: g.playCount + 1 } : g
    );
    onUpdateGames(updated);
  };

  // Handle option select
  const handleSelectOption = (idx: number) => {
    if (isAnswered || !activeGame?.questions) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const question = activeGame.questions[currentQuestionIndex];
    const isCorrect = idx === question.correctIndex;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      soundManager.playSuccess();
      confetti({ particleCount: 45, spread: 55, origin: { y: 0.7 } });
      soundManager.speakEnglishPraise();
    } else {
      soundManager.playTick();
      soundManager.speakEnglishEncouragement();
    }
  };

  // Next question
  const handleNextQuestion = () => {
    if (!activeGame?.questions) return;
    soundManager.stopSpeaking();

    if (currentQuestionIndex < activeGame.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setGameFinished(true);
      confetti({ particleCount: 100, spread: 80 });
      soundManager.playFanfare();
      soundManager.playApplause();
      soundManager.speakEnglishCelebration();
    }
  };

  // Read single option slowly
  const handleReadOptionSlowly = (index: number, optionText: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const letters = ['A', 'B', 'C', 'D', 'E'];
    soundManager.speakSlowly(`Đáp án ${letters[index] || index + 1}: ${optionText}`, 'vi-VN');
  };

  // Read full question and options slowly
  const handleReadFullQuestionAndOptions = () => {
    if (!currentQuestion) return;
    soundManager.speakQuestionAndOptions(currentQuestion.prompt, currentQuestion.options, 'vi-VN');
  };

  // Read question slowly
  const handleReadQuestionSlowly = () => {
    if (!currentQuestion) return;
    soundManager.speakSlowly(`Câu hỏi: ${currentQuestion.prompt}`, 'vi-VN');
  };

  // Pronounce English word with TTS
  const handleSpeakEnglishWord = (word: string) => {
    soundManager.speak(word, 'en-US', 1.30, 0.70);
  };

  // Award points to selected contestant from game
  const handleAwardPointsToContestant = (student: Student, pts: number) => {
    const updated = students.map((s) =>
      s.id === student.id
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
      studentId: student.id,
      studentName: student.name,
      delta: pts,
      reason: `Tham gia trò chơi: ${activeGame?.title || 'Mini game'}`,
      date: getTodayDateStr(),
      timestamp: Date.now(),
    };
    onUpdatePointsHistory([newH]);

    soundManager.playCoin();
    confetti({ particleCount: 50, spread: 60 });
  };

  // Spin inside game to pick contestant
  const handleSpinContestant = () => {
    if (students.length === 0) return;
    const randomS = students[Math.floor(Math.random() * students.length)];
    setChosenContestant(randomS);
    soundManager.playTick();
    setTimeout(() => {
      soundManager.playSuccess();
      soundManager.speak(`Welcome ${randomS.name}! Good luck!`, 'en-US', 1.30, 0.70);
    }, 400);
  };

  // Open Question Modal for Add
  const openAddQuestionModal = (gameId: string) => {
    setTargetGameId(gameId);
    setEditingQuestionId(null);
    setFormPrompt('');
    setFormImage('🌟');
    setFormEnglishWord('');
    setFormPronunciation('');
    setFormOptions(['', '', '', '']);
    setFormCorrectIndex(0);
    setFormExplanation('');
    setIsQuestionModalOpen(true);
  };

  // Open Question Modal for Edit
  const openEditQuestionModal = (gameId: string, q: QuizQuestion) => {
    setTargetGameId(gameId);
    setEditingQuestionId(q.id);
    setFormPrompt(q.prompt);
    setFormImage(q.image || '🌟');
    setFormEnglishWord(q.englishWord || '');
    setFormPronunciation(q.pronunciation || '');
    const opts = [...q.options];
    while (opts.length < 4) opts.push('');
    setFormOptions(opts);
    setFormCorrectIndex(q.correctIndex);
    setFormExplanation(q.explanation || '');
    setIsQuestionModalOpen(true);
  };

  // Save question (Add or Edit)
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPrompt.trim()) return;

    const cleanOptions = formOptions.map((o) => o.trim()).filter((o) => o.length > 0);
    if (cleanOptions.length < 2) {
      alert('Vui lòng nhập ít nhất 2 đáp án lựa chọn!');
      return;
    }

    const safeCorrectIndex = Math.min(formCorrectIndex, cleanOptions.length - 1);

    const questionData: QuizQuestion = {
      id: editingQuestionId || `q-${Date.now()}`,
      prompt: formPrompt.trim(),
      image: formImage.trim() || undefined,
      englishWord: formEnglishWord.trim() || undefined,
      pronunciation: formPronunciation.trim() || undefined,
      options: cleanOptions,
      correctIndex: safeCorrectIndex,
      explanation: formExplanation.trim() || undefined,
    };

    const updatedGames = games.map((g) => {
      if (g.id !== targetGameId) return g;
      const currentQuestions = g.questions || [];
      let newQuestions: QuizQuestion[];
      if (editingQuestionId) {
        newQuestions = currentQuestions.map((q) =>
          q.id === editingQuestionId ? questionData : q
        );
      } else {
        newQuestions = [...currentQuestions, questionData];
      }
      return { ...g, questions: newQuestions };
    });

    onUpdateGames(updatedGames);

    // If currently playing this game, update activeGame too
    if (activeGame && activeGame.id === targetGameId) {
      const match = updatedGames.find((g) => g.id === targetGameId);
      if (match) setActiveGame(match);
    }

    // If in managing game modal, update managingGame too
    if (managingGame && managingGame.id === targetGameId) {
      const match = updatedGames.find((g) => g.id === targetGameId);
      if (match) setManagingGame(match);
    }

    soundManager.playSuccess();
    setIsQuestionModalOpen(false);
  };

  // Delete question
  const handleDeleteQuestion = (gameId: string, qId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;

    const updatedGames = games.map((g) => {
      if (g.id !== gameId) return g;
      return {
        ...g,
        questions: (g.questions || []).filter((q) => q.id !== qId),
      };
    });

    onUpdateGames(updatedGames);

    if (activeGame && activeGame.id === gameId) {
      const match = updatedGames.find((g) => g.id === gameId);
      if (match) setActiveGame(match);
    }
    if (managingGame && managingGame.id === gameId) {
      const match = updatedGames.find((g) => g.id === gameId);
      if (match) setManagingGame(match);
    }

    soundManager.playTick();
  };

  // Test question reading before saving
  const handleTestPreviewSpeech = () => {
    const cleanOptions = formOptions.map((o) => o.trim()).filter((o) => o.length > 0);
    soundManager.speakQuestionAndOptions(formPrompt || 'Ví dụ câu hỏi', cleanOptions, 'vi-VN');
  };

  // Create new custom game
  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameTitle.trim()) return;

    const newGame: InteractiveGameItem = {
      id: `game-custom-${Date.now()}`,
      title: newGameTitle.trim(),
      category: newGameCategory,
      description: newGameDesc.trim() || 'Trò chơi tương tác sinh động cho học sinh',
      icon: newGameIcon || '🎮',
      externalUrl: newGameCategory === 'external' ? newGameUrl.trim() : undefined,
      playCount: 0,
      questions: newGameCategory !== 'external' ? [] : undefined,
    };

    onUpdateGames([...games, newGame]);
    soundManager.playSuccess();
    setIsCreateGameModalOpen(false);
    setNewGameTitle('');
    setNewGameDesc('');
    setNewGameUrl('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Gamepad2 className="h-6 w-6 text-sky-600" />
            Trò Chơi Tương Tác Lớp 1 (Giọng Đọc Chậm Dễ Nghe)
          </h2>
          <p className="text-xs text-slate-500">
            Kho trò chơi Tiếng Việt, Toán, Động vật, Tự nhiên & Xã hội và Tiếng Anh lớp 1. Cho phép giáo viên tạo và chỉnh sửa câu hỏi tùy ý.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick contestant picker */}
          <button
            onClick={() => {
              setIsGameWheelOpen(true);
              handleSpinContestant();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition shadow-xs"
          >
            <Dices className="h-4 w-4 text-amber-600" />
            Bốc Thăm Thí Sinh
          </button>

          {/* Create new game */}
          <button
            onClick={() => setIsCreateGameModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:from-sky-600 hover:to-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            Tạo Trò Chơi Mới
          </button>
        </div>
      </div>

      {/* ACTIVE GAME PLAY ARENA */}
      {activeGame && activeGame.questions && activeGame.questions.length > 0 && (
        <div className="rounded-3xl border-2 border-sky-300 bg-white shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Top Bar of active game */}
          <div className="flex items-center justify-between border-b border-sky-100 bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeGame.icon}</span>
              <div>
                <h3 className="font-extrabold text-sm">{activeGame.title}</h3>
                <span className="text-[11px] text-sky-100 font-medium">
                  Câu {currentQuestionIndex + 1} / {activeGame.questions.length} • Lớp {settings.className}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <label className="hidden md:flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold text-white cursor-pointer hover:bg-white/30 transition">
                <input
                  type="checkbox"
                  checked={autoReadQuestion}
                  onChange={(e) => setAutoReadQuestion(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-0 h-3.5 w-3.5"
                />
                <span>Tự động đọc câu hỏi</span>
              </label>

              <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-xs">
                ⭐ {score} điểm
              </div>

              <button
                onClick={() => {
                  soundManager.stopSpeaking();
                  setActiveGame(null);
                }}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white"
                title="Đóng trò chơi"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!gameFinished && currentQuestion ? (
            <div className="p-6 md:p-8 space-y-6 max-w-3xl mx-auto">
              {/* Female Teacher Voice Character Card */}
              <div className="flex items-center gap-3.5 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-sky-50 border border-pink-200/90 p-3.5 shadow-xs">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-2xl shadow-xs">
                  👩‍🏫
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-pink-900">
                      Cô giáo Trợ giảng (Giọng nữ dịu dàng)
                    </span>
                    <span className="rounded-full bg-pink-100 text-pink-700 px-2 py-0.5 text-[10px] font-bold">
                      Đọc chậm rãi • Chuẩn Lớp 1
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate">
                    Cô đồng hành đọc câu hỏi, phát âm tiếng Anh chuẩn và gửi lời động viên tới các em!
                  </p>
                </div>
              </div>

              {/* Question Box */}
              <div className="flex flex-col items-center justify-center rounded-3xl bg-gradient-to-b from-sky-50/70 to-blue-50/30 p-6 border border-sky-200 text-center relative">
                {currentQuestion.image && (
                  <div className="text-6xl mb-3 select-none filter drop-shadow-sm">
                    {currentQuestion.image}
                  </div>
                )}

                <h4 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight leading-snug">
                  {currentQuestion.prompt}
                </h4>

                {/* English word if present */}
                {currentQuestion.englishWord && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-white/90 border border-sky-200 px-3.5 py-1.5 rounded-full shadow-2xs">
                    <span className="text-xs font-extrabold text-sky-700">
                      {currentQuestion.englishWord}
                    </span>
                    {currentQuestion.pronunciation && (
                      <span className="text-[11px] font-mono text-slate-500">
                        {currentQuestion.pronunciation}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSpeakEnglishWord(currentQuestion.englishWord!)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white shadow-xs hover:bg-sky-700 active:scale-95 transition"
                      title="Phát âm tiếng Anh"
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Question Voice Controls for Grade 1 pupils */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleReadQuestionSlowly}
                    className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-sky-700 active:scale-95 transition"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    👩‍🏫 Cô đọc câu hỏi (chậm)
                  </button>

                  <button
                    type="button"
                    onClick={handleReadFullQuestionAndOptions}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white border border-sky-200 px-3.5 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-50 active:scale-95 transition shadow-2xs"
                  >
                    <Volume2 className="h-3.5 w-3.5 text-sky-600" />
                    👩‍🏫 Cô đọc câu hỏi & 4 đáp án (chậm)
                  </button>

                  <button
                    type="button"
                    onClick={() => soundManager.stopSpeaking()}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
                    title="Dừng đọc"
                  >
                    <VolumeX className="h-3.5 w-3.5" />
                    Dừng
                  </button>
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {currentQuestion.options.map((opt, optIdx) => {
                  let btnStyle = 'border-slate-200 bg-white hover:border-sky-400 hover:bg-sky-50/70 text-slate-800 shadow-xs';
                  if (isAnswered) {
                    if (optIdx === currentQuestion.correctIndex) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-200 font-extrabold shadow-sm';
                    } else if (optIdx === selectedOption) {
                      btnStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-bold';
                    } else {
                      btnStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                    }
                  }

                  const letters = ['A', 'B', 'C', 'D', 'E'];

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`group relative flex items-center justify-between rounded-2xl border-2 p-4 text-left transition transform active:scale-98 cursor-pointer ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3 pr-8">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-sky-100 group-hover:text-sky-700 text-xs font-black text-slate-700 transition">
                          {letters[optIdx] || optIdx + 1}
                        </span>
                        <span className="text-sm font-bold leading-snug">{opt}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Audio button to read just this option slowly */}
                        <button
                          type="button"
                          onClick={(e) => handleReadOptionSlowly(optIdx, opt, e)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-500 hover:text-sky-700 transition"
                          title={`Nghe đọc đáp án ${letters[optIdx]}`}
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>

                        {isAnswered && optIdx === currentQuestion.correctIndex && (
                          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        )}
                        {isAnswered && optIdx === selectedOption && optIdx !== currentQuestion.correctIndex && (
                          <XCircle className="h-6 w-6 text-rose-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation & Next */}
              {isAnswered && (
                <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-xs text-emerald-950 animate-in fade-in space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold flex items-center gap-1.5 text-emerald-800">
                      <Sparkles className="h-4 w-4 text-emerald-600" />
                      👩‍🏫 Lời cô giáo giải thích:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        soundManager.speakSlowly(
                          currentQuestion.explanation || 'Rất tuyệt vời, đáp án chính xác!',
                          'vi-VN'
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2.5 py-1 text-[11px] font-bold transition shadow-2xs"
                      title="Nghe cô đọc lời giải thích"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      Nghe cô đọc
                    </button>
                  </div>
                  <p className="leading-relaxed">
                    {currentQuestion.explanation || 'Rất tuyệt vời, đáp án chính xác!'}
                  </p>
                </div>
              )}

              {/* Next Question & Edit Question Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => openEditQuestionModal(activeGame.id, currentQuestion)}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-sky-600 font-semibold"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Sửa câu hỏi này
                </button>

                {isAnswered && (
                  <button
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:from-sky-600 hover:to-blue-700 transition active:scale-95"
                  >
                    <span>
                      {currentQuestionIndex < activeGame.questions.length - 1
                        ? 'Câu tiếp theo'
                        : 'Xem kết quả'}
                    </span>
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* GAME FINISHED SCREEN */
            <div className="p-8 text-center space-y-4 max-w-md mx-auto">
              <div className="text-6xl animate-bounce">🏆</div>
              <h3 className="text-2xl font-black text-slate-900">
                Chúc Mừng Hoàn Thành Trò Chơi!
              </h3>
              <p className="text-xs text-slate-600">
                Lớp đã trả lời đúng <strong className="text-emerald-600 text-base">{score}</strong> / {activeGame.questions.length} câu hỏi.
              </p>

              {/* Award Contestant Dropdown */}
              <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 text-left space-y-2">
                <span className="text-xs font-bold text-amber-900 block">
                  Tặng điểm thưởng cho học sinh tham gia:
                </span>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const s = students.find((st) => st.id === e.target.value);
                    if (s) handleAwardPointsToContestant(s, 3);
                    e.target.value = '';
                  }}
                  className="w-full rounded-xl border border-amber-300 bg-white py-2 px-3 text-xs font-bold text-slate-800 focus:outline-hidden"
                >
                  <option value="" disabled>
                    Chọn học sinh để tặng +3 điểm thưởng...
                  </option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.avatar} {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => soundManager.speakEnglishCelebration()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100 transition"
                  title="Nghe lời chúc mừng bằng Tiếng Anh"
                >
                  <Volume2 className="h-4 w-4 text-sky-600" />
                  Lời chúc (English)
                </button>
                <button
                  onClick={() => handleLaunchGame(activeGame)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Chơi lại
                </button>
                <button
                  onClick={() => {
                    soundManager.stopSpeaking();
                    setActiveGame(null);
                  }}
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:from-sky-600 hover:to-blue-700"
                >
                  Đóng trò chơi
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GAMES LIBRARY LIST */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Danh sách trò chơi tương tác ({games.length} trò chơi)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {games.map((game) => {
            const questionCount = game.questions?.length ?? 0;

            return (
              <div
                key={game.id}
                className="flex flex-col justify-between rounded-3xl border border-sky-100 bg-white p-5 shadow-xs transition hover:border-sky-300 hover:shadow-md group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-4xl p-2 rounded-2xl bg-sky-50 border border-sky-100">
                      {game.icon}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                        game.category === 'english_vocab'
                          ? 'bg-purple-100 text-purple-700'
                          : game.category === 'math_blitz'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {game.category === 'english_vocab'
                        ? 'Tiếng Anh'
                        : game.category === 'math_blitz'
                        ? 'Toán lớp 1'
                        : game.category === 'trivia'
                        ? 'Tiếng Việt / TNXH'
                        : 'Liên kết ngoài'}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-sky-600 transition">
                    {game.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {game.description}
                  </p>

                  {game.questions && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      <BookOpen className="h-3 w-3 text-sky-600" />
                      <span>{questionCount} câu hỏi sẵn sàng</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {game.questions && (
                      <>
                        <button
                          type="button"
                          onClick={() => openAddQuestionModal(game.id)}
                          className="rounded-lg p-1.5 text-sky-600 hover:bg-sky-50 transition"
                          title="Thêm câu hỏi mới vào trò chơi này"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setManagingGame(game);
                            setIsManageModalOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition"
                          title="Quản lý danh sách câu hỏi"
                        >
                          <ListPlus className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteGame(game, e)}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Xóa trò chơi này"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleLaunchGame(game)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:from-sky-600 hover:to-blue-700 active:scale-95 transition ml-auto"
                  >
                    {game.category === 'external' ? (
                      <>
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Mở Game</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Vào chơi</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: ADD / EDIT QUESTION WITH MULTIPLE-CHOICE OPTIONS */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-sky-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-sky-50/70 px-6 py-4">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingQuestionId ? 'Chỉnh Sửa Câu Hỏi Trò Chơi' : 'Thêm Câu Hỏi Mới Cho Học Sinh Lớp 1'}
              </h3>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Question prompt */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung câu hỏi *
                </label>
                <textarea
                  value={formPrompt}
                  onChange={(e) => setFormPrompt(e.target.value)}
                  placeholder="Ví dụ: Con vật nào biết gáy Ò ó o đánh thức mọi người thức dậy?"
                  rows={2}
                  required
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              {/* Image & English Vocab */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hình ảnh / Biểu tượng
                  </label>
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="🐓 hoặc 🍎"
                    className="w-full text-center text-xl rounded-xl border border-slate-300 py-1.5 focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Từ tiếng Anh (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={formEnglishWord}
                    onChange={(e) => setFormEnglishWord(e.target.value)}
                    placeholder="Rooster"
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phiên âm IPA (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={formPronunciation}
                    onChange={(e) => setFormPronunciation(e.target.value)}
                    placeholder="/ˈruːstər/"
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-mono focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* 4 Multiple-Choice Options */}
              <div className="rounded-2xl bg-sky-50/60 p-4 border border-sky-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-900 uppercase tracking-wider">
                    Các đáp án lựa chọn & Tích chọn đáp án đúng:
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Bấm nút tròn để chọn đáp án đúng
                  </span>
                </div>

                {['A', 'B', 'C', 'D'].map((letter, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormCorrectIndex(idx)}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-black transition ${
                        formCorrectIndex === idx
                          ? 'bg-emerald-600 text-white shadow-xs scale-105'
                          : 'bg-white border border-slate-300 text-slate-500 hover:border-emerald-400'
                      }`}
                      title="Chọn đáp án này là đáp án đúng"
                    >
                      {letter}
                    </button>

                    <input
                      type="text"
                      value={formOptions[idx] || ''}
                      onChange={(e) => {
                        const newOpts = [...formOptions];
                        newOpts[idx] = e.target.value;
                        setFormOptions(newOpts);
                      }}
                      placeholder={`Đáp án ${letter} (ví dụ: Con gà trống)...`}
                      required={idx < 2}
                      className={`flex-1 rounded-xl border bg-white py-2 px-3 text-xs focus:outline-hidden ${
                        formCorrectIndex === idx
                          ? 'border-emerald-400 ring-2 ring-emerald-200 font-semibold'
                          : 'border-slate-300 focus:border-sky-500'
                      }`}
                    />

                    {formCorrectIndex === idx && (
                      <span className="text-[11px] text-emerald-700 font-bold px-1.5 py-0.5 rounded bg-emerald-100">
                        Đúng ✓
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lời giải thích / Khen ngợi của cô
                </label>
                <input
                  type="text"
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Gà trống gáy vang đánh thức mọi người thức dậy!"
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              {/* Test reading button & Action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleTestPreviewSpeech}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100 transition"
                  title="Thử nghe giọng đọc chậm cho học sinh lớp 1"
                >
                  <Volume2 className="h-4 w-4 text-sky-600" />
                  Nghe thử câu hỏi & đáp án (đọc chậm)
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsQuestionModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:from-sky-600 hover:to-blue-700"
                  >
                    Lưu câu hỏi
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANAGE QUESTIONS LIST FOR A GAME */}
      {isManageModalOpen && managingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-sky-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-sky-50/70 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{managingGame.icon}</span>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Quản Lý Danh Sách Câu Hỏi: {managingGame.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tổng số {managingGame.questions?.length ?? 0} câu hỏi
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsManageModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600">
                  Danh sách câu hỏi trong bộ game:
                </span>
                <button
                  type="button"
                  onClick={() => openAddQuestionModal(managingGame.id)}
                  className="inline-flex items-center gap-1 rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-700 shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm câu hỏi mới
                </button>
              </div>

              {(!managingGame.questions || managingGame.questions.length === 0) ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Trò chơi chưa có câu hỏi nào. Hãy bấm "Thêm câu hỏi mới" ở trên!
                </div>
              ) : (
                <div className="space-y-3">
                  {managingGame.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2 hover:border-sky-300 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-xs font-black text-sky-800">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              {q.image && <span className="text-lg">{q.image}</span>}
                              <h5 className="font-bold text-slate-800 text-xs sm:text-sm">
                                {q.prompt}
                              </h5>
                            </div>
                            {q.englishWord && (
                              <span className="text-[11px] text-sky-600 font-semibold">
                                English: {q.englishWord} {q.pronunciation ? `(${q.pronunciation})` : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              soundManager.speakQuestionAndOptions(q.prompt, q.options, 'vi-VN')
                            }
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition"
                            title="Nghe đọc thử"
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditQuestionModal(managingGame.id, q)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition"
                            title="Sửa câu hỏi"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(managingGame.id, q.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Options preview */}
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] pl-8">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`rounded-lg px-2 py-1 ${
                              oIdx === q.correctIndex
                                ? 'bg-emerald-100 font-bold text-emerald-800 border border-emerald-300'
                                : 'bg-slate-50 text-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt}{' '}
                            {oIdx === q.correctIndex && '✓'}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW GAME */}
      {isCreateGameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-sky-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-sky-50/70 px-6 py-4">
              <h3 className="font-bold text-slate-800 text-sm">Tạo Trò Chơi Mới Cho Lớp</h3>
              <button
                onClick={() => setIsCreateGameModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGame} className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên trò chơi *
                </label>
                <input
                  type="text"
                  value={newGameTitle}
                  onChange={(e) => setNewGameTitle(e.target.value)}
                  placeholder="Ví dụ: Đố Vui Vần Lớp 1, Nối Chữ Thông Minh..."
                  required
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thể loại game
                  </label>
                  <select
                    value={newGameCategory}
                    onChange={(e) => setNewGameCategory(e.target.value as typeof newGameCategory)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-2.5 text-xs focus:border-sky-500 focus:outline-hidden"
                  >
                    <option value="trivia">Đố vui Tiếng Việt / TNXH</option>
                    <option value="math_blitz">Toán học vui nhộn</option>
                    <option value="english_vocab">Từ vựng Tiếng Anh</option>
                    <option value="external">Liên kết game ngoài (Kahoot, Wordwall...)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Biểu tượng / Emoji
                  </label>
                  <input
                    type="text"
                    value={newGameIcon}
                    onChange={(e) => setNewGameIcon(e.target.value)}
                    placeholder="🎮"
                    className="w-full text-center text-xl rounded-xl border border-slate-300 py-1.5 focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {newGameCategory === 'external' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Đường dẫn game (URL) *
                  </label>
                  <input
                    type="url"
                    value={newGameUrl}
                    onChange={(e) => setNewGameUrl(e.target.value)}
                    placeholder="https://kahoot.it/... hoặc https://wordwall.net/..."
                    required
                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-mono focus:border-sky-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô tả ngắn gọn về trò chơi
                </label>
                <textarea
                  value={newGameDesc}
                  onChange={(e) => setNewGameDesc(e.target.value)}
                  placeholder="Mô tả nội dung rèn luyện, chủ đề bài học..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 py-1.5 px-3 text-xs focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateGameModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:from-sky-600 hover:to-blue-700"
                >
                  Tạo trò chơi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK CONTESTANT PICKER MODAL */}
      {isGameWheelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-sky-100 text-center animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Bốc Thăm Thí Sinh Ngẫu Nhiên
              </h4>
              <button
                onClick={() => setIsGameWheelOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {chosenContestant ? (
              <div className="space-y-3">
                <div className="text-6xl animate-bounce">{chosenContestant.avatar}</div>
                <h3 className="text-xl font-black text-slate-900">{chosenContestant.name}</h3>
                <p className="text-xs text-slate-500 font-mono">Mã HS: {chosenContestant.code}</p>

                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={handleSpinContestant}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Chọn bạn khác
                  </button>
                  <button
                    onClick={() => {
                      handleAwardPointsToContestant(chosenContestant, 2);
                      setIsGameWheelOpen(false);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-600 shadow-xs"
                  >
                    <Award className="h-3.5 w-3.5" />
                    + Thưởng 2 Điểm
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6">
                <Dices className="mx-auto h-12 w-12 text-sky-400 animate-spin" />
                <p className="mt-2 text-xs font-bold text-slate-600">Đang chọn thí sinh...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DELETE GAME */}
      {gameToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <Trash2 className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Xác nhận xóa trò chơi
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Bạn có chắc chắn muốn xóa trò chơi <strong className="text-slate-800">"{gameToDelete.title}"</strong> ({gameToDelete.questions?.length ?? 0} câu hỏi) không? Hành động này sẽ loại bỏ trò chơi khỏi danh sách của lớp.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setGameToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmDeleteGame}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 active:scale-95 transition shadow-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Xóa trò chơi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
