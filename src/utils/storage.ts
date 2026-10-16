import * as XLSX from 'xlsx';
import {
  AppSettings,
  AttendanceRecord,
  DailyComment,
  InteractiveGameItem,
  MusicItem,
  ParentLoginLog,
  ParentMessage,
  PointHistory,
  RewardItem,
  RewardRedemption,
  SemesterResult,
  Student,
} from '../types';
import { apiRequest } from './api';

export const DEFAULT_SETTINGS: AppSettings = {
  schoolName: 'Trường Tiểu học Chu Văn An',
  className: 'Lớp 1A1',
  schoolYear: '2025 - 2026',
  teacherName: 'Cô Nguyễn Thị Mai Phương',
  teacherPhone: '0988 123 456',
  teacherEmail: 'maiphuong.teacher@gmail.com',
  appTitle: 'EduMate – Người bạn đồng hành của giáo viên',
  appLogo: '🎒',
  soundEffectsEnabled: true,
  speechEnabled: true,
  speechVoice: 'vi',
  speechRate: 0.70, // Đọc chậm rãi, rõ ràng, dễ nghe nhất cho học sinh lớp 1
  speechPitch: 1.30, // Cao độ giọng nữ ngọt ngào, ấm áp của cô giáo
  preferredVoiceURI: '',
};

// Default avatar options
export const AVATAR_OPTIONS = [
  '👦🏻', '👧🏻', '👦🏼', '👧🏼', '🦁', '🐼', '🦊', '🐰', 
  '🐯', '🐨', '🦄', '🚀', '⭐', '🎈', '🎨', '📚'
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'hs-1',
    code: 'HS001',
    name: 'Nguyễn Bảo Nam',
    dob: '2019-03-15',
    gender: 'Nam',
    avatar: '👦🏻',
    parentName: 'Nguyễn Văn Hùng',
    parentPhone: '0912 345 678',
    password: '123',
    points: 48,
    stars: 12,
    gameParticipationCount: 8,
    notes: 'Ban cán sự lớp, rất nhiệt tình',
  },
  {
    id: 'hs-2',
    code: 'HS002',
    name: 'Trần Hà Linh',
    dob: '2019-06-20',
    gender: 'Nữ',
    avatar: '👧🏻',
    parentName: 'Trần Thị Thảo',
    parentPhone: '0903 456 789',
    password: '123',
    points: 52,
    stars: 14,
    gameParticipationCount: 11,
    notes: 'Chữ viết đẹp, cẩn thận',
  },
  {
    id: 'hs-3',
    code: 'HS003',
    name: 'Lê Minh Khang',
    dob: '2019-01-10',
    gender: 'Nam',
    avatar: '🦁',
    parentName: 'Lê Tuấn Anh',
    parentPhone: '0987 654 321',
    password: '123',
    points: 35,
    stars: 9,
    gameParticipationCount: 6,
    notes: 'Toán tốt, cần chú ý chính tả',
  },
  {
    id: 'hs-4',
    code: 'HS004',
    name: 'Hoàng Thảo Vy',
    dob: '2019-09-05',
    gender: 'Nữ',
    avatar: '🐰',
    parentName: 'Hoàng Minh Long',
    parentPhone: '0934 567 890',
    password: '123',
    points: 45,
    stars: 11,
    gameParticipationCount: 9,
    notes: 'Múa hát hay, hoà đồng',
  },
  {
    id: 'hs-5',
    code: 'HS005',
    name: 'Phạm Đức Anh',
    dob: '2019-11-28',
    gender: 'Nam',
    avatar: '🚀',
    parentName: 'Phạm Văn Thành',
    parentPhone: '0978 112 233',
    password: '123',
    points: 29,
    stars: 7,
    gameParticipationCount: 5,
    notes: 'Thỉnh thoảng nói chuyện riêng',
  },
  {
    id: 'hs-6',
    code: 'HS006',
    name: 'Vũ Ngọc Hân',
    dob: '2019-04-12',
    gender: 'Nữ',
    avatar: '🦄',
    parentName: 'Đặng Bích Ngọc',
    parentPhone: '0918 223 344',
    password: '123',
    points: 40,
    stars: 10,
    gameParticipationCount: 7,
    notes: 'Tập trung nghe giảng, ngoan',
  },
  {
    id: 'hs-7',
    code: 'HS007',
    name: 'Đặng Tuấn Kiệt',
    dob: '2019-08-18',
    gender: 'Nam',
    avatar: '🐼',
    parentName: 'Đặng Quốc Huy',
    parentPhone: '0966 778 899',
    password: '123',
    points: 38,
    stars: 9,
    gameParticipationCount: 8,
    notes: 'Ham học hỏi, thích chơi đố vui',
  },
  {
    id: 'hs-8',
    code: 'HS008',
    name: 'Bùi Mai Anh',
    dob: '2019-12-02',
    gender: 'Nữ',
    avatar: '👧🏼',
    parentName: 'Bùi Văn Tiến',
    parentPhone: '0945 667 788',
    password: '123',
    points: 47,
    stars: 13,
    gameParticipationCount: 10,
    notes: 'Tiếng Anh nói chuẩn, tự tin',
  },
  {
    id: 'hs-9',
    code: 'HS009',
    name: 'Đỗ Gia Huy',
    dob: '2019-05-14',
    gender: 'Nam',
    avatar: '🐯',
    parentName: 'Đỗ Hữu Thắng',
    parentPhone: '0933 221 100',
    password: '123',
    points: 32,
    stars: 8,
    gameParticipationCount: 6,
    notes: 'Thực hành thủ công khéo tay',
  },
  {
    id: 'hs-10',
    code: 'HS010',
    name: 'Ngô Khánh Linh',
    dob: '2019-07-22',
    gender: 'Nữ',
    avatar: '🎨',
    parentName: 'Ngô Thanh Sơn',
    parentPhone: '0909 888 777',
    password: '123',
    points: 44,
    stars: 11,
    gameParticipationCount: 9,
    notes: 'Vẽ tranh đẹp, màu sắc hài hoà',
  },
  {
    id: 'hs-11',
    code: 'HS011',
    name: 'Dương Phúc An',
    dob: '2019-02-28',
    gender: 'Nam',
    avatar: '🐨',
    parentName: 'Dương Văn Bình',
    parentPhone: '0913 554 433',
    password: '123',
    points: 36,
    stars: 9,
    gameParticipationCount: 7,
    notes: 'Tự giác hoàn thành bài tập',
  },
  {
    id: 'hs-12',
    code: 'HS012',
    name: 'Trịnh Bảo Trân',
    dob: '2019-10-10',
    gender: 'Nữ',
    avatar: '⭐',
    parentName: 'Trịnh Đình Quang',
    parentPhone: '0977 443 322',
    password: '123',
    points: 50,
    stars: 13,
    gameParticipationCount: 12,
    notes: 'Đọc diễn cảm tốt, rõ ràng',
  },
];

export const INITIAL_REWARDS: RewardItem[] = [
  {
    id: 'rw-1',
    name: 'Phiếu miễn 1 lần bài tập về nhà',
    pointsCost: 25,
    icon: '🎟️',
    stock: 20,
    description: 'Được miễn 1 bài tập viết hoặc toán về nhà tự chọn.',
  },
  {
    id: 'rw-2',
    name: 'Bút chì khúc ngộ nghĩnh & Gôm tẩy',
    pointsCost: 15,
    icon: '✏️',
    stock: 35,
    description: 'Bút chì nhiều màu sắc cùng gôm hình thú dễ thương.',
  },
  {
    id: 'rw-3',
    name: 'Thước kẻ hoạt hình + Bộ nhãn vở',
    pointsCost: 10,
    icon: '📏',
    stock: 50,
    description: 'Thước kẻ dẻo và bộ 5 nhãn vở in hình nhân vật yêu thích.',
  },
  {
    id: 'rw-4',
    name: 'Huy hiệu "Ngôi sao chăm ngoan"',
    pointsCost: 20,
    icon: '🎖️',
    stock: 15,
    description: 'Huy hiệu cài áo danh dự được cô giáo đeo trước cả lớp.',
  },
  {
    id: 'rw-5',
    name: 'Quyền làm Quản trò 1 ngày',
    pointsCost: 30,
    icon: '👑',
    stock: 10,
    description: 'Được đứng lên cùng cô bấm vòng quay và điều hành trò chơi.',
  },
  {
    id: 'rw-6',
    name: 'Sách truyện tranh song ngữ',
    pointsCost: 40,
    icon: '📖',
    stock: 8,
    description: 'Truyện tranh ngụ ngôn tiếng Việt - Anh kích thích đọc sách.',
  },
];

// Circular 27 (Thông tư 27) Official Comment Templates Bank
export const TT27_COMMENT_TEMPLATES = {
  mon_toan: [
    {
      level: 'T' as const,
      content: 'Nắm chắc kiến thức, tính toán nhanh và chính xác. Tích cực chia sẻ cách giải hay trước lớp.',
      encouragement: 'Tiếp tục phát huy tư duy logic và tìm thêm cách giải sáng tạo.',
    },
    {
      level: 'H' as const,
      content: 'Thực hiện được các phép tính trong phạm vi đã học. Hoàn thành đầy đủ bài tập trên lớp.',
      encouragement: 'Cần cẩn thận hơn khi đặt tính và kiểm tra lại kết quả.',
    },
    {
      level: 'C' as const,
      content: 'Còn lúng túng khi thực hiện phép tính có nhớ. Đôi lúc chưa hiểu rõ yêu cầu bài toán có lời văn.',
      encouragement: 'Cô sẽ kèm thêm các bước giải toán và đề nghị phụ huynh nhắc con luyện thêm 10 phút mỗi tối.',
    },
  ],
  mon_tieng_viet: [
    {
      level: 'T' as const,
      content: 'Đọc to, rõ ràng, ngắt nghỉ đúng dấu câu. Chữ viết đều nét, trình bày vở sạch đẹp.',
      encouragement: 'Khen ngợi em, khuyến khích em đọc thêm nhiều câu chuyện hay.',
    },
    {
      level: 'H' as const,
      content: 'Đọc trôi chảy bài tập đọc, nhận biết tốt các âm vần. Viết đúng chính tả phần lớn các từ.',
      encouragement: 'Cần chú ý độ cao con chữ và rèn thêm tốc độ viết bài.',
    },
    {
      level: 'C' as const,
      content: 'Đọc còn đánh vần chậm ở một số vần khó. Chữ viết còn sai khoảng cách giữa các con chữ.',
      encouragement: 'Hàng ngày cô dành 5 phút giờ ra chơi giúp em luyện đọc thêm âm vần.',
    },
  ],
  mon_tieng_anh: [
    {
      level: 'T' as const,
      content: 'Phát âm chuẩn từ vựng mới, tự tin phản xạ và tham gia nhiệt tình các trò chơi ngôn ngữ.',
      encouragement: 'Rất có năng khiếu tiếng Anh, duy trì nghe nói hàng ngày nhé!',
    },
    {
      level: 'H' as const,
      content: 'Nhớ được từ vựng cơ bản của chủ đề. Hiểu và làm theo các hiệu lệnh của cô giáo.',
      encouragement: 'Mạnh dạn giơ tay phát biểu to hơn nữa trong giờ học.',
    },
  ],
  nang_luc: [
    {
      level: 'T' as const,
      content: 'Tự giác chuẩn bị sách vở đồ dùng, biết chủ động tìm kiếm sự hỗ trợ khi gặp bài khó.',
      encouragement: 'Gương mẫu tự học, xứng đáng là tấm gương cho cả lớp.',
    },
    {
      level: 'H' as const,
      content: 'Hợp tác tốt với bạn khi làm việc nhóm, biết lắng nghe ý kiến của bạn bè.',
      encouragement: 'Chủ động hơn trong việc phân công nhiệm vụ nhóm.',
    },
  ],
  pham_chat: [
    {
      level: 'T' as const,
      content: 'Thật thà, lễ phép với thầy cô giáo, luôn biết sẻ chia đồ dùng học tập với bạn xung quanh.',
      encouragement: 'Rất đáng khen ngợi, giữ vững tinh thần nhân ái này con nhé!',
    },
    {
      level: 'Đ' as const,
      content: 'Biết vâng lời thầy cô, thực hiện đúng nội quy trường lớp và giữ gìn vệ sinh chung.',
      encouragement: 'Cần năng nổ hơn khi tham gia các hoạt động tập thể.',
    },
  ],
};

export const INITIAL_GAMES: InteractiveGameItem[] = [
  {
    id: 'game-1',
    title: 'Ong Vàng Tìm Chữ - English Vocab Fun',
    category: 'english_vocab',
    description: 'Game đố vui từ vựng tiếng Anh vui nhộn với giọng đọc chuẩn và hình ảnh sinh động.',
    icon: '🐝',
    playCount: 24,
    questions: [
      {
        id: 'q1',
        prompt: 'What animal is this?',
        englishWord: 'Elephant',
        pronunciation: '/ˈelɪfənt/',
        image: '🐘',
        options: ['Elephant', 'Lion', 'Monkey', 'Zebra'],
        correctIndex: 0,
        explanation: 'Elephant nghĩa là con voi to lớn.',
      },
      {
        id: 'q2',
        prompt: 'What color is the Sun?',
        englishWord: 'Yellow',
        pronunciation: '/ˈjeləʊ/',
        image: '☀️',
        options: ['Blue', 'Yellow', 'Green', 'Purple'],
        correctIndex: 1,
        explanation: 'Mặt trời có màu vàng (Yellow).',
      },
      {
        id: 'q3',
        prompt: 'Choose the correct fruit:',
        englishWord: 'Apple',
        pronunciation: '/ˈæpl/',
        image: '🍎',
        options: ['Orange', 'Banana', 'Apple', 'Watermelon'],
        correctIndex: 2,
        explanation: 'Quả táo màu đỏ thơm ngon là Apple.',
      },
      {
        id: 'q4',
        prompt: 'Which one is a school object?',
        englishWord: 'Pencil',
        pronunciation: '/ˈpensl/',
        image: '✏️',
        options: ['Car', 'Bed', 'Pencil', 'Spoon'],
        correctIndex: 2,
        explanation: 'Pencil là chiếc bút chì xinh xắn.',
      },
      {
        id: 'q5',
        prompt: 'What is the action in the picture?',
        englishWord: 'Read books',
        pronunciation: '/riːd bʊks/',
        image: '📖',
        options: ['Sleep', 'Read books', 'Swim', 'Jump'],
        correctIndex: 1,
        explanation: 'Read books nghĩa là đọc sách.',
      },
    ],
  },
  {
    id: 'game-tv1',
    title: 'Bé Yêu Tiếng Việt 1 - Nhận Biết Âm Vần & Từ Ngữ',
    category: 'trivia',
    description: 'Trò chơi rèn luyện âm vần, ghép chữ và nhận biết tiếng dành cho học sinh Lớp 1 có giọng đọc chậm dễ nghe.',
    icon: '📚',
    playCount: 42,
    questions: [
      {
        id: 'tvq1',
        prompt: 'Chữ cái nào đứng đầu trong từ "Bố Mẹ"?',
        image: '👨‍👩‍👦',
        options: ['Chữ B', 'Chữ C', 'Chữ M', 'Chữ D'],
        correctIndex: 0,
        explanation: 'Chữ B là âm đầu trong tiếng "Bố".',
      },
      {
        id: 'tvq2',
        prompt: 'Tiếng nào dưới đây có chứa vần "an"?',
        image: '🪑',
        options: ['Cái bàn', 'Bông hoa', 'Con gà', 'Quyển vở'],
        correctIndex: 0,
        explanation: 'Tiếng "bàn" gồm âm b ghép với vần "an" và dấu huyền.',
      },
      {
        id: 'tvq3',
        prompt: 'Hình ảnh nào là con vật nuôi bắt chuột quen thuộc trong gia đình?',
        image: '🐱',
        englishWord: 'Cat',
        options: ['Con mèo', 'Cái ghế', 'Ô tô', 'Cây dừa'],
        correctIndex: 0,
        explanation: 'Con mèo (Cat) là vật nuôi thân thiết bắt chuột giúp cả nhà!',
      },
      {
        id: 'tvq4',
        prompt: 'Điền từ còn thiếu vào câu: "Cả nhà cùng ... nhau"?',
        image: '❤️',
        options: ['yêu thương', 'chạy nhanh', 'đi ngủ', 'học bài'],
        correctIndex: 0,
        explanation: 'Cả nhà luôn yêu thương và quan tâm chăm sóc lẫn nhau.',
      },
      {
        id: 'tvq5',
        prompt: 'Từ nào dưới đây là từ chỉ màu sắc tươi sáng của lá cây?',
        image: '🍃',
        englishWord: 'Green',
        options: ['Màu xanh lá cây', 'Màu đen', 'Chạy bộ', 'Cặp sách'],
        correctIndex: 0,
        explanation: 'Xanh lá cây (Green) là màu của mầm non và lá tươi.',
      },
    ],
  },
  {
    id: 'game-math1',
    title: 'Vườn Hoa Phép Tính 1 - Bé Vui Học Toán',
    category: 'math_blitz',
    description: 'Luyện tập các phép tính cộng trừ trong phạm vi 10, nhận biết hình học với giọng đọc chậm rãi, dịu dàng.',
    icon: '🌸',
    playCount: 35,
    questions: [
      {
        id: 'mq10',
        prompt: 'Bé có 3 quả táo đỏ, mẹ cho thêm 2 quả táo nữa. Hỏi bé có tất cả mấy quả táo?',
        image: '🍎',
        options: ['4 quả táo', '5 quả táo', '6 quả táo', '3 quả táo'],
        correctIndex: 1,
        explanation: '3 cộng thêm 2 bằng 5 quả táo thơm ngon!',
      },
      {
        id: 'mq11',
        prompt: 'Trên cành cây có 6 chú chim, 2 chú chim bay đi. Hỏi trên cành còn lại mấy chú chim?',
        image: '🐦',
        options: ['3 chú chim', '4 chú chim', '5 chú chim', '2 chú chim'],
        correctIndex: 1,
        explanation: '6 bớt 2 chú chim bay đi thì còn lại đúng 4 chú chim.',
      },
      {
        id: 'mq12',
        prompt: 'Phép tính nào dưới đây có kết quả đúng bằng 10?',
        image: '🔟',
        options: ['7 + 3', '5 + 4', '8 + 1', '6 + 2'],
        correctIndex: 0,
        explanation: '7 cộng 3 bằng 10.',
      },
      {
        id: 'mq13',
        prompt: 'Hình nào có 4 cạnh bằng nhau và có 4 góc vuông vắn?',
        image: '🟩',
        englishWord: 'Square',
        options: ['Hình vuông', 'Hình tròn', 'Hình tam giác', 'Hình bầu dục'],
        correctIndex: 0,
        explanation: 'Hình vuông (Square) có 4 cạnh bằng nhau.',
      },
      {
        id: 'mq14',
        prompt: 'Số liền sau ngay sau số 9 là số mấy?',
        image: '🔢',
        options: ['Số 10', 'Số 8', 'Số 7', 'Số 11'],
        correctIndex: 0,
        explanation: 'Đếm tiếp theo 9 là số 10 (Ten).',
      },
    ],
  },
  {
    id: 'game-tnxh1',
    title: 'Nhà Thông Thái Nhí - Tự Nhiên & Xã Hội 1',
    category: 'trivia',
    description: 'Khám phá thế giới quanh em, nhận biết cơ thể, an toàn giao thông và thói quen vệ sinh sạch sẽ cho bé lớp 1.',
    icon: '🌱',
    playCount: 28,
    questions: [
      {
        id: 'tn1',
        prompt: 'Bộ phận nào trên gương mặt giúp chúng ta nhìn ngắm thế giới tươi đẹp?',
        image: '👀',
        englishWord: 'Eyes',
        options: ['Đôi mắt', 'Đôi tai', 'Cái mũi', 'Bàn tay'],
        correctIndex: 0,
        explanation: 'Đôi mắt (Eyes) là cửa sổ tâm hồn giúp ta nhìn thấy mọi thứ.',
      },
      {
        id: 'tn2',
        prompt: 'Khi đi qua đường gặp đèn tín hiệu giao thông màu ĐỎ, chúng ta phải làm gì?',
        image: '🚦',
        englishWord: 'Red Light - Stop',
        options: ['Dừng lại', 'Đi thật nhanh', 'Bấm còi to', 'Chạy băng qua'],
        correctIndex: 0,
        explanation: 'Đèn đỏ báo hiệu phải dừng lại an toàn.',
      },
      {
        id: 'tn3',
        prompt: 'Trước khi ăn cơm và sau khi đi vệ sinh, bé cần làm việc gì quan trọng?',
        image: '🧼',
        options: ['Rửa tay sạch bằng xà phòng', 'Uống nước ngọt', 'Đi xem tivi', 'Chạy nhảy ngoài sân'],
        correctIndex: 0,
        explanation: 'Rửa tay sạch giúp bảo vệ bé khỏi vi khuẩn và phòng tránh bệnh tật.',
      },
      {
        id: 'tn4',
        prompt: 'Thời tiết mùa nào trong năm có ánh nắng chói chang, ve kêu và bé được nghỉ hè?',
        image: '☀️',
        englishWord: 'Summer',
        options: ['Mùa hè', 'Mùa đông', 'Mùa bão', 'Mùa tuyết'],
        correctIndex: 0,
        explanation: 'Mùa hè (Summer) có hoa phượng đỏ, ve kêu râm ran và thời tiết ấm áp.',
      },
      {
        id: 'tn5',
        prompt: 'Để giữ gìn lớp học luôn sạch đẹp, rác thải bé cần bỏ vào đâu?',
        image: '🗑️',
        options: ['Thùng rác có nắp đậy', 'Ngăn bàn học', 'Góc lớp học', 'Dưới sàn nhà'],
        correctIndex: 0,
        explanation: 'Bỏ rác đúng nơi quy định vào thùng rác giúp giữ lớp học luôn sạch sẽ!',
      },
    ],
  },
  {
    id: 'game-anim1',
    title: 'Thế Giới Động Vật Vui Nhộn - Animal Friends 1',
    category: 'english_vocab',
    description: 'Nhận biết các loài động vật dễ thương, tiếng kêu và học từ vựng tiếng Anh vui nhộn.',
    icon: '🐾',
    playCount: 31,
    questions: [
      {
        id: 'an1',
        prompt: 'Con vật nào biết gáy "Ò ó o" đánh thức mọi người thức dậy mỗi sớm mai?',
        image: '🐓',
        englishWord: 'Rooster',
        pronunciation: '/ˈruːstər/',
        options: ['Con gà trống', 'Con vịt bầu', 'Con bò sữa', 'Con lợn con'],
        correctIndex: 0,
        explanation: 'Gà trống cất tiếng gáy báo hiệu một ngày mới bắt đầu.',
      },
      {
        id: 'an2',
        prompt: 'Con vật nào bơi lội tung tăng dưới nước và thở bằng mang?',
        image: '🐟',
        englishWord: 'Fish',
        pronunciation: '/fɪʃ/',
        options: ['Con cá', 'Con thỏ', 'Con chim bồ câu', 'Con sóc'],
        correctIndex: 0,
        explanation: 'Con cá (Fish) sống dưới nước và bơi lội rất khéo léo.',
      },
      {
        id: 'an3',
        prompt: 'Con vật nào có đôi tai dài xinh xắn, mắt tròn xoe và rất thích ăn củ cà rốt?',
        image: '🐰',
        englishWord: 'Rabbit',
        pronunciation: '/ˈræbɪt/',
        options: ['Con thỏ', 'Con hổ', 'Con gấu', 'Con chuột túi'],
        correctIndex: 0,
        explanation: 'Con thỏ trắng (Rabbit) với đôi tai dài đáng yêu thích ăn cà rốt.',
      },
      {
        id: 'an4',
        prompt: 'Loài vật to lớn nhất trên cạn, có chiếc vòi dài khéo léo để hút nước và hái lá là con gì?',
        image: '🐘',
        englishWord: 'Elephant',
        pronunciation: '/ˈelɪfənt/',
        options: ['Con voi', 'Con hươu cao cổ', 'Con ngựa', 'Con cừu'],
        correctIndex: 0,
        explanation: 'Con voi (Elephant) có chiếc vòi dài kì diệu và đôi tai to như cái quạt.',
      },
      {
        id: 'an5',
        prompt: 'Chú cún con thông minh trong nhà thường sủa tiếng gì để báo có khách?',
        image: '🐶',
        englishWord: 'Dog',
        pronunciation: '/dɔːɡ/',
        options: ['Gâu gâu', 'Meo meo', 'Cục tác', 'Ụt ịt'],
        correctIndex: 0,
        explanation: 'Chú cún con (Dog) sủa gâu gâu trông nhà rất giỏi.',
      },
    ],
  },
  {
    id: 'game-eng1',
    title: 'Bé Vui Học Nói Tiếng Anh Lớp 1 - First English Words',
    category: 'english_vocab',
    description: 'Luyện tập các từ tiếng Anh đầu đời: Lời chào, màu sắc, số đếm và đồ dùng học tập của bé.',
    icon: '🌟',
    playCount: 45,
    questions: [
      {
        id: 'engq1',
        prompt: 'Khi gặp cô giáo hoặc bạn bè vào buổi sáng, em nói câu tiếng Anh nào để chào hỏi?',
        image: '👋',
        englishWord: 'Hello / Good morning',
        pronunciation: '/həˈləʊ/ /ɡʊd ˈmɔːnɪŋ/',
        options: ['Hello / Good morning', 'Goodbye', 'Thank you', 'I am sorry'],
        correctIndex: 0,
        explanation: '"Hello" hoặc "Good morning" nghĩa là Xin chào buổi sáng!',
      },
      {
        id: 'engq2',
        prompt: 'Số 1 trong Tiếng Anh đọc là gì?',
        image: '1️⃣',
        englishWord: 'One',
        pronunciation: '/wʌn/',
        options: ['One', 'Two', 'Three', 'Four'],
        correctIndex: 0,
        explanation: 'Số 1 là One, số 2 là Two, số 3 là Three.',
      },
      {
        id: 'engq3',
        prompt: 'Màu đỏ tươi của quả dâu tây và hoa hồng trong Tiếng Anh là gì?',
        image: '🍓',
        englishWord: 'Red',
        pronunciation: '/red/',
        options: ['Red', 'Blue', 'Yellow', 'White'],
        correctIndex: 0,
        explanation: 'Màu đỏ là Red.',
      },
      {
        id: 'engq4',
        prompt: 'Chiếc cặp sách xinh xắn để đựng sách vở đến trường trong Tiếng Anh là gì?',
        image: '🎒',
        englishWord: 'School bag',
        pronunciation: '/ˈskuːl bæɡ/',
        options: ['School bag', 'Bicycle', 'Table', 'Clock'],
        correctIndex: 0,
        explanation: 'School bag là chiếc cặp sách đồng hành cùng bé mỗi ngày.',
      },
      {
        id: 'engq5',
        prompt: 'Khi được người khác giúp đỡ hoặc tặng quà, bé nói lời cảm ơn bằng Tiếng Anh thế nào?',
        image: '🙏',
        englishWord: 'Thank you',
        pronunciation: '/ˈθæŋk juː/',
        options: ['Thank you', 'Hello', 'No, thanks', 'Goodbye'],
        correctIndex: 0,
        explanation: '"Thank you" nghĩa là Con cảm ơn / Cảm ơn bạn!',
      },
    ],
  },
  {
    id: 'game-speed',
    title: 'Thử Thách Tính Nhanh - Siêu Nhí Toán Học',
    category: 'math_blitz',
    description: 'Thử thách tính nhẩm 10 câu liên tiếp trong phạm vi 10 và 20 có tính giờ kịch tính.',
    icon: '⚡',
    playCount: 38,
    questions: [
      {
        id: 'mq1',
        prompt: '5 + 4 = ?',
        options: ['8', '9', '10', '7'],
        correctIndex: 1,
        explanation: '5 cộng 4 bằng 9.',
      },
      {
        id: 'mq2',
        prompt: '10 - 6 = ?',
        options: ['3', '4', '5', '6'],
        correctIndex: 1,
        explanation: '10 bớt 6 còn 4.',
      },
      {
        id: 'mq3',
        prompt: '8 + 7 = ?',
        options: ['14', '15', '16', '13'],
        correctIndex: 1,
        explanation: '8 cộng 7 bằng 15.',
      },
      {
        id: 'mq4',
        prompt: '18 - 9 = ?',
        options: ['8', '9', '10', '7'],
        correctIndex: 1,
        explanation: '18 trừ 9 bằng 9.',
      },
      {
        id: 'mq5',
        prompt: 'Hình nào có đúng 3 cạnh?',
        options: ['Hình vuông', 'Hình tròn', 'Hình tam giác', 'Hình chữ nhật'],
        correctIndex: 2,
        explanation: 'Hình tam giác có đúng 3 cạnh và 3 đỉnh.',
      },
    ],
  },
  {
    id: 'game-3',
    title: 'Kahoot: Rung Chuông Vàng Khối 1',
    category: 'external',
    description: 'Bộ câu hỏi trắc nghiệm kiến thức tổng hợp trực tiếp trên Kahoot.',
    icon: '🟣',
    playCount: 16,
    externalUrl: 'https://kahoot.it',
  },
  {
    id: 'game-4',
    title: 'Wordwall: Nối Chữ Cái và Hình Ảnh',
    category: 'external',
    description: 'Trò chơi kéo thả nối từ vựng tương tác cao thiết kế trên Wordwall.',
    icon: '🔵',
    playCount: 29,
    externalUrl: 'https://wordwall.net',
  },
  {
    id: 'game-5',
    title: 'Quizizz: Tiếng Việt 1 - Ôn Tập Âm Vần',
    category: 'external',
    description: 'Đố vui ôn tập vần kết hợp nhận huy hiệu trên Quizizz.',
    icon: '🟣',
    playCount: 21,
    externalUrl: 'https://quizizz.com',
  },
];

export const INITIAL_MESSAGES: ParentMessage[] = [
  {
    id: 'msg-1',
    studentId: 'hs-1',
    studentName: 'Nguyễn Bảo Nam',
    parentName: 'Nguyễn Văn Hùng',
    parentPhone: '0912 345 678',
    content: 'Dạ chào cô Mai Phương, hôm nay cháu Nam về nhà rất vui vì được quay trúng tên phát biểu và nhận điểm thưởng. Gia đình cảm ơn cô nhiều ạ!',
    date: '2026-10-13 18:30',
    reply: 'Dạ cảm ơn gia đình. Nam hôm nay học rất tập trung và hăng hái giơ tay. Cô rất khen con ạ!',
    replyDate: '2026-10-13 19:15',
    isRead: true,
  },
  {
    id: 'msg-2',
    studentId: 'hs-3',
    studentName: 'Lê Minh Khang',
    parentName: 'Lê Tuấn Anh',
    parentPhone: '0987 654 321',
    content: 'Thưa cô, ngày mai gia đình có việc đưa cháu về quê ăn giỗ buổi sáng, cháu xin phép đến lớp muộn lúc 9h30 được không ạ?',
    date: '2026-10-14 07:10',
    reply: 'Dạ được ạ, bố cho con vào lớp an toàn nhé. Cô sẽ kèm bài đầu giờ cho con.',
    replyDate: '2026-10-14 07:45',
    isRead: true,
  },
  {
    id: 'msg-3',
    studentId: 'hs-5',
    studentName: 'Phạm Đức Anh',
    parentName: 'Phạm Văn Thành',
    parentPhone: '0978 112 233',
    content: 'Cô ơi, tuần này con hơi lơ đãng bài tập toán, nhờ cô nhắc nhở thêm giúp gia đình với nhé.',
    date: '2026-10-14 08:20',
    isRead: false,
  },
];

export const INITIAL_LOGIN_LOGS: ParentLoginLog[] = [
  {
    id: 'log-1',
    studentId: 'hs-1',
    studentName: 'Nguyễn Bảo Nam',
    parentName: 'Nguyễn Văn Hùng',
    loginTime: '2026-10-14 08:45:20',
    deviceInfo: 'Mobile (iOS/Safari)',
  },
  {
    id: 'log-2',
    studentId: 'hs-2',
    studentName: 'Trần Hà Linh',
    parentName: 'Trần Thị Thảo',
    loginTime: '2026-10-14 07:55:12',
    deviceInfo: 'Desktop (Chrome/Windows)',
  },
  {
    id: 'log-3',
    studentId: 'hs-4',
    studentName: 'Hoàng Thảo Vy',
    parentName: 'Hoàng Minh Long',
    loginTime: '2026-10-13 20:10:45',
    deviceInfo: 'Mobile (Android/Chrome)',
  },
  {
    id: 'log-4',
    studentId: 'hs-1',
    studentName: 'Nguyễn Bảo Nam',
    parentName: 'Nguyễn Văn Hùng',
    loginTime: '2026-10-13 18:25:01',
    deviceInfo: 'Mobile (iOS/Safari)',
  },
  {
    id: 'log-5',
    studentId: 'hs-8',
    studentName: 'Bùi Mai Anh',
    parentName: 'Bùi Văn Tiến',
    loginTime: '2026-10-12 19:40:33',
    deviceInfo: 'iPad (Safari)',
  },
];

export const DEFAULT_MUSIC_LIST: MusicItem[] = [
  {
    id: 'music-1',
    title: 'Bống Bống Bang Bang (Khởi động thể dục sôi động)',
    url: 'https://www.youtube.com/watch?v=kYg8j2f_W1Q',
    category: 'warmup',
    description: 'Vũ điệu sôi động, giúp các em học sinh lớp 1 khởi động cơ thể và tinh thần hứng khởi trước giờ học.',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60',
    icon: '🎵',
    playCount: 15,
  },
  {
    id: 'music-2',
    title: 'Head, Shoulders, Knees and Toes (Tiếng Anh vui nhộn)',
    url: 'https://www.youtube.com/watch?v=QA48wTGbU7A',
    category: 'english',
    description: 'Vừa hát theo vừa chỉ vào mắt, mũi, tai, vai, đầu gối. Rèn luyện phản xạ tiếng Anh nhanh nhẹn cho học sinh.',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60',
    icon: '🗣️',
    playCount: 22,
  },
  {
    id: 'music-3',
    title: 'Tập Tầm Vông (Trò chơi âm nhạc dân gian)',
    url: 'https://www.youtube.com/watch?v=Y_XmZc04Z9c',
    category: 'fun',
    description: 'Bài hát đồng dao gắn bó với tuổi thơ, rất phù hợp cho các trò chơi khởi động đoán tay, đố vui trên lớp.',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60',
    icon: '🪘',
    playCount: 9,
  },
  {
    id: 'music-4',
    title: 'Baby Shark Dance (Sing & Dance along)',
    url: 'https://www.youtube.com/watch?v=XqZsoesa55w',
    category: 'english',
    description: 'Giai điệu vui nhộn quen thuộc, các động tác mô phỏng chú cá mập dễ thương được các bé lớp 1 vô cùng yêu thích.',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60',
    icon: '🦈',
    playCount: 18,
  },
  {
    id: 'music-5',
    title: 'Bài Ca Đi Học (Tươi vui rộn rã đến trường)',
    url: 'https://www.youtube.com/watch?v=M0064pY8Zyo',
    category: 'relax',
    description: 'Bình minh tươi sáng, tiếng chim reo vang. Bài hát truyền cảm hứng học tập và yêu mến trường lớp bạn bè.',
    thumbnail: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=60',
    icon: '🎒',
    playCount: 12,
  },
  {
    id: 'music-6',
    title: 'Vũ điệu Gà Con - The Chicken Dance (Giải lao sảng khoái)',
    url: 'https://www.youtube.com/watch?v=4xvg7bkyKkQ',
    category: 'fun',
    description: 'Vũ điệu xả stress giữa tiết học, giúp các em thư giãn tay chân sau những giờ tập viết chữ và tính toán.',
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60',
    icon: '🐣',
    playCount: 8,
  },
];

// Helper to get today's date formatted YYYY-MM-DD
export const getTodayDateStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Sample class used to seed the backend database (see scripts/export_seed_data.ts)
export const buildDefaultData = () => {
  const today = getTodayDateStr();
  return {
    settings: DEFAULT_SETTINGS,
    students: INITIAL_STUDENTS,
    attendance: INITIAL_STUDENTS.map((s, idx) => ({
      id: `att-${today}-${s.id}`,
      date: today,
      studentId: s.id,
      status: (idx === 4 ? 'late' : idx === 8 ? 'excused' : 'present') as AttendanceRecord['status'],
      note: idx === 4 ? 'Tắc đường đến muộn 10 phút' : idx === 8 ? 'Nghỉ ốm có đơn' : undefined,
    })),
    pointsHistory: [] as PointHistory[],
    rewards: INITIAL_REWARDS,
    redemptions: [] as RewardRedemption[],
    comments: [
      {
        id: 'cm-1',
        studentId: 'hs-1',
        date: today,
        category: 'mon_hoc',
        subject: 'Toán',
        level: 'T',
        content: 'Nắm chắc kiến thức, tính toán nhanh và chính xác. Tích cực chia sẻ cách giải hay trước lớp.',
        encouragement: 'Tiếp tục phát huy tư duy logic và tìm thêm cách giải sáng tạo.',
      },
      {
        id: 'cm-2',
        studentId: 'hs-2',
        date: today,
        category: 'mon_hoc',
        subject: 'Tiếng Việt',
        level: 'T',
        content: 'Đọc to, rõ ràng, ngắt nghỉ đúng dấu câu. Chữ viết đều nét, trình bày vở sạch đẹp.',
        encouragement: 'Khen ngợi em, khuyến khích em đọc thêm nhiều câu chuyện hay.',
      },
      {
        id: 'cm-3',
        studentId: 'hs-3',
        date: today,
        category: 'pham_chat',
        subject: 'Chăm chỉ',
        level: 'Đ',
        content: 'Biết vâng lời thầy cô, thực hiện đúng nội quy trường lớp và giữ gìn vệ sinh chung.',
        encouragement: 'Cần năng nổ hơn khi tham gia các hoạt động tập thể.',
      },
    ] as DailyComment[],
    semesterResults: INITIAL_STUDENTS.map((s, idx) => ({
      id: `sr-${s.id}`,
      studentId: s.id,
      schoolYear: '2025 - 2026',
      semester: 'Học kỳ 1',
      mathScore: idx < 4 ? 10 : idx < 8 ? 9 : 8,
      mathLevel: idx < 6 ? 'T' : 'H',
      vietnameseScore: idx === 1 ? 10 : idx < 5 ? 9 : 8,
      vietnameseLevel: idx < 8 ? 'T' : 'H',
      englishScore: idx === 7 ? 10 : 9,
      englishLevel: 'T',
      scienceLevel: 'T',
      historyGeoLevel: 'T',
      ethicsLevel: 'T',
      musicLevel: 'T',
      artLevel: 'T',
      peLevel: 'T',
      selfAutonomy: idx < 8 ? 'T' : 'H',
      communication: 'T',
      problemSolving: idx < 6 ? 'T' : 'H',
      patriotism: 'T',
      compassion: 'T',
      diligence: 'T',
      honesty: 'T',
      responsibility: 'T',
      awardTitle: idx < 4 ? 'Học sinh Xuất sắc' : 'Học sinh Tiêu biểu hoàn thành tốt',
      overallComment: 'Em chăm ngoan, lễ phép, hoàn thành xuất sắc các nội dung học tập và rèn luyện.',
    })) as SemesterResult[],
    games: INITIAL_GAMES,
    music: DEFAULT_MUSIC_LIST,
    messages: INITIAL_MESSAGES,
    loginLogs: INITIAL_LOGIN_LOGS,
  };
};

// ==========================================
// BACKEND API (Rails + MySQL)
// ==========================================

const SYNC_DELAY_MS = 300;
const MAX_LOGIN_LOGS = 100;

interface Collections {
  students: Student[];
  attendance: AttendanceRecord[];
  pointsHistory: PointHistory[];
  rewards: RewardItem[];
  redemptions: RewardRedemption[];
  comments: DailyComment[];
  semesterResults: SemesterResult[];
  games: InteractiveGameItem[];
  music: MusicItem[];
  messages: ParentMessage[];
  loginLogs: ParentLoginLog[];
}
type CollectionKey = keyof Collections;

// Collection key (same as the JSON backup file) => REST resource
const ENDPOINTS: Record<CollectionKey, string> = {
  students: 'students',
  attendance: 'attendance_records',
  pointsHistory: 'point_histories',
  rewards: 'reward_items',
  redemptions: 'reward_redemptions',
  comments: 'daily_comments',
  semesterResults: 'semester_results',
  games: 'interactive_games',
  music: 'music_items',
  messages: 'parent_messages',
  loginLogs: 'parent_login_logs',
};
const COLLECTION_KEYS = Object.keys(ENDPOINTS) as CollectionKey[];

// In-memory copy of the server data; views read it synchronously.
let settingsCache: AppSettings = DEFAULT_SETTINGS;
const cache = Object.fromEntries(COLLECTION_KEYS.map((k) => [k, []])) as unknown as Collections;

// What the server is known to hold: id => serialized record, plus the id order.
const synced = Object.fromEntries(
  COLLECTION_KEYS.map((k) => [k, { records: new Map<string, string>(), order: '' }])
) as Record<CollectionKey, { records: Map<string, string>; order: string }>;

const timers = new Map<CollectionKey | 'settings', ReturnType<typeof setTimeout>>();
// One request chain per resource so batches reach the server in order.
const queues = new Map<CollectionKey | 'settings', Promise<unknown>>();

let lastErrorAlertAt = 0;
const reportSyncError = (error: unknown) => {
  console.error('[EduMate] Lưu dữ liệu lên máy chủ thất bại:', error);
  if (Date.now() - lastErrorAlertAt > 30_000) {
    lastErrorAlertAt = Date.now();
    alert('Không lưu được dữ liệu lên máy chủ. Vui lòng kiểm tra kết nối và thử lại.');
  }
};

const enqueue = (key: CollectionKey | 'settings', task: () => Promise<unknown>) => {
  const next = (queues.get(key) ?? Promise.resolve()).then(task).catch(reportSyncError);
  queues.set(key, next);
  return next;
};

const rememberSynced = (key: CollectionKey, items: { id: string }[]) => {
  synced[key] = {
    records: new Map(items.map((item) => [item.id, JSON.stringify(item)])),
    order: items.map((item) => item.id).join('\n'),
  };
};

// Sends only what changed since the last sync, so edits made on other devices are kept.
const flushCollection = (key: CollectionKey, keepalive = false) => {
  timers.delete(key);
  const items = cache[key] as { id: string }[];
  const prev = synced[key];
  const next = new Map(items.map((item) => [item.id, JSON.stringify(item)]));
  const order = items.map((item) => item.id).join('\n');

  const upsert = items.filter((item) => prev.records.get(item.id) !== next.get(item.id));
  const remove = [...prev.records.keys()].filter((id) => !next.has(id));
  const orderChanged = order !== prev.order;
  if (!upsert.length && !remove.length && !orderChanged) return;

  synced[key] = { records: next, order };
  const body = JSON.stringify({ upsert, delete: remove, order: orderChanged ? items.map((i) => i.id) : undefined });
  enqueue(key, () => apiRequest(`/${ENDPOINTS[key]}/batch`, { method: 'POST', body, keepalive }));
};

const scheduleCollectionSync = (key: CollectionKey, items: unknown[]) => {
  (cache as unknown as Record<CollectionKey, unknown[]>)[key] = items;
  clearTimeout(timers.get(key));
  timers.set(key, setTimeout(() => flushCollection(key), SYNC_DELAY_MS));
};

const flushSettings = (keepalive = false) => {
  timers.delete('settings');
  const body = JSON.stringify(settingsCache);
  enqueue('settings', () => apiRequest('/settings', { method: 'PUT', body, keepalive }));
};

const flushAll = (keepalive = false) => {
  [...timers.keys()].forEach((key) => {
    clearTimeout(timers.get(key));
    if (key === 'settings') flushSettings(keepalive);
    else flushCollection(key, keepalive);
  });
  return Promise.all(queues.values());
};

if (typeof window !== 'undefined') {
  // Don't lose edits made in the last few hundred milliseconds before closing the tab.
  window.addEventListener('pagehide', () => flushAll(true));
}

// Storage Service Wrapper
export const storageService = {
  // Loads all data from the backend; must finish before the app renders.
  init: async () => {
    const data = await apiRequest('/data');
    settingsCache = { ...DEFAULT_SETTINGS, ...data.settings };
    COLLECTION_KEYS.forEach((key) => {
      const items = Array.isArray(data[key]) ? data[key] : [];
      (cache as unknown as Record<CollectionKey, unknown[]>)[key] = items;
      rememberSynced(key, items);
    });
  },

  // Drops pending changes and cached data (used on logout).
  clear: () => {
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
    queues.clear();
    settingsCache = DEFAULT_SETTINGS;
    COLLECTION_KEYS.forEach((key) => {
      (cache as unknown as Record<CollectionKey, unknown[]>)[key] = [];
      rememberSynced(key, []);
    });
  },

  // Sends any changes still waiting for the sync delay.
  flush: () => flushAll(),

  // Students
  getStudents: (): Student[] => cache.students,
  saveStudents: (students: Student[]) => scheduleCollectionSync('students', students),

  // Attendance
  getAttendance: (): AttendanceRecord[] => cache.attendance,
  saveAttendance: (records: AttendanceRecord[]) => scheduleCollectionSync('attendance', records),

  // Points history
  getPointsHistory: (): PointHistory[] => cache.pointsHistory,
  savePointsHistory: (history: PointHistory[]) => scheduleCollectionSync('pointsHistory', history),

  // Rewards
  getRewards: (): RewardItem[] => cache.rewards,
  saveRewards: (rewards: RewardItem[]) => scheduleCollectionSync('rewards', rewards),

  // Redemptions
  getRedemptions: (): RewardRedemption[] => cache.redemptions,
  saveRedemptions: (redemptions: RewardRedemption[]) => scheduleCollectionSync('redemptions', redemptions),

  // Comments
  getComments: (): DailyComment[] => cache.comments,
  saveComments: (comments: DailyComment[]) => scheduleCollectionSync('comments', comments),

  // Semester Results
  getSemesterResults: (): SemesterResult[] => cache.semesterResults,
  saveSemesterResults: (results: SemesterResult[]) => scheduleCollectionSync('semesterResults', results),

  // Games
  getGames: (): InteractiveGameItem[] => cache.games,
  saveGames: (games: InteractiveGameItem[]) => scheduleCollectionSync('games', games),
  deleteGame: (gameId: string): InteractiveGameItem[] => {
    const games = storageService.getGames().filter((g) => g.id !== gameId);
    storageService.saveGames(games);
    return games;
  },

  // Fun Music & Video Links for Dashboard
  getMusic: (): MusicItem[] => cache.music,
  saveMusic: (music: MusicItem[]) => scheduleCollectionSync('music', music),

  // Messages
  getMessages: (): ParentMessage[] => cache.messages,
  saveMessages: (messages: ParentMessage[]) => scheduleCollectionSync('messages', messages),

  // Login logs
  getLoginLogs: (): ParentLoginLog[] => cache.loginLogs,
  saveLoginLogs: (logs: ParentLoginLog[]) => scheduleCollectionSync('loginLogs', logs),
  addLoginLog: (student: Student) => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newLog: ParentLoginLog = {
      id: `log-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      parentName: student.parentName,
      loginTime: formatted,
      deviceInfo: navigator.userAgent.includes('Mobile') ? 'Điện thoại di động (Mobile)' : 'Máy tính bàn / Laptop',
    };
    // The server prepends the log and trims to the newest 100 itself.
    cache.loginLogs = [newLog, ...cache.loginLogs].slice(0, MAX_LOGIN_LOGS);
    rememberSynced('loginLogs', cache.loginLogs);
    enqueue('loginLogs', () => apiRequest(`/${ENDPOINTS.loginLogs}`, { method: 'POST', body: JSON.stringify(newLog) }));
  },

  // Settings
  getSettings: (): AppSettings => settingsCache,
  saveSettings: (settings: AppSettings) => {
    settingsCache = settings;
    clearTimeout(timers.get('settings'));
    timers.set('settings', setTimeout(() => flushSettings(), SYNC_DELAY_MS));
  },
};

// ==========================================
// EXCEL & WORD EXPORT / IMPORT UTILITIES
// ==========================================

export const exportStudentsToExcel = (students: Student[], className: string) => {
  const data = students.map((s, idx) => ({
    'STT': idx + 1,
    'Mã học sinh': s.code,
    'Họ và tên': s.name,
    'Ngày sinh': s.dob,
    'Giới tính': s.gender,
    'Họ tên phụ huynh': s.parentName,
    'Số điện thoại PH': s.parentPhone,
    'Mật khẩu đăng nhập': s.password,
    'Điểm tích lũy': s.points,
    'Số sao thưởng': s.stars,
    'Lượt chơi game': s.gameParticipationCount,
    'Ghi chú': s.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách học sinh');
  XLSX.writeFile(workbook, `Danh_Sach_Hoc_Sinh_${className}_${getTodayDateStr()}.xlsx`);
};

export const exportAttendanceToExcel = (students: Student[], records: AttendanceRecord[], dateStr: string) => {
  const data = students.map((s, idx) => {
    const record = records.find((r) => r.studentId === s.id && r.date === dateStr);
    let statusVi = 'Có mặt';
    if (record?.status === 'excused') statusVi = 'Vắng có phép';
    else if (record?.status === 'unexcused') statusVi = 'Vắng không phép';
    else if (record?.status === 'late') statusVi = 'Đi muộn';

    return {
      'STT': idx + 1,
      'Mã HS': s.code,
      'Họ và tên': s.name,
      'Ngày điểm danh': dateStr,
      'Trạng thái': statusVi,
      'Ghi chú lý do': record?.note || '',
      'Số điện thoại phụ huynh': s.parentPhone,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Điểm danh');
  XLSX.writeFile(workbook, `Diem_Danh_${dateStr}.xlsx`);
};

// Export Semester Results to Excel (Thông tư 27)
export const exportSemesterResultsToExcel = (
  students: Student[],
  results: SemesterResult[],
  settings: AppSettings
) => {
  const data = students.map((s, idx) => {
    const res = results.find((r) => r.studentId === s.id);
    return {
      'STT': idx + 1,
      'Mã HS': s.code,
      'Họ và tên': s.name,
      'Điểm KTĐK Toán': res?.mathScore ?? '',
      'Mức đạt Toán (T/H/C)': res?.mathLevel ?? 'H',
      'Điểm KTĐK T.Việt': res?.vietnameseScore ?? '',
      'Mức đạt T.Việt (T/H/C)': res?.vietnameseLevel ?? 'H',
      'Điểm KTĐK T.Anh': res?.englishScore ?? '',
      'Mức đạt T.Anh (T/H/C)': res?.englishLevel ?? 'H',
      'Tự nhiên & Xã hội': res?.scienceLevel ?? 'H',
      'Đạo đức': res?.ethicsLevel ?? 'T',
      'Âm nhạc': res?.musicLevel ?? 'T',
      'Mĩ thuật': res?.artLevel ?? 'T',
      'Giáo dục thể chất': res?.peLevel ?? 'T',
      'NL Tự chủ & Tự học': res?.selfAutonomy ?? 'T',
      'NL Giao tiếp & Hợp tác': res?.communication ?? 'T',
      'NL Giải quyết vấn đề': res?.problemSolving ?? 'T',
      'PC Yêu nước (T/Đ/C)': res?.patriotism ?? 'T',
      'PC Nhân ái (T/Đ/C)': res?.compassion ?? 'T',
      'PC Chăm chỉ (T/Đ/C)': res?.diligence ?? 'T',
      'PC Trung thực (T/Đ/C)': res?.honesty ?? 'T',
      'PC Trách nhiệm (T/Đ/C)': res?.responsibility ?? 'T',
      'Danh hiệu khen thưởng': res?.awardTitle ?? 'Hoàn thành chương trình lớp học',
      'Nhận xét chung': res?.overallComment ?? '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bang_Tong_Hop_TT27');
  XLSX.writeFile(workbook, `Ket_Qua_Hoc_Tap_TT27_${settings.className}.xlsx`);
};

// Export Semester Results to formatted Word document (.doc)
export const exportSemesterResultsToWord = (
  students: Student[],
  results: SemesterResult[],
  settings: AppSettings,
  semester: string = 'Học kỳ 1'
) => {
  const tableRows = students
    .map((s, idx) => {
      const res = results.find((r) => r.studentId === s.id);
      return `
      <tr>
        <td style="text-align: center; border: 1px solid #000; padding: 6px;">${idx + 1}</td>
        <td style="text-align: center; border: 1px solid #000; padding: 6px;">${s.code}</td>
        <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">${s.name}</td>
        <td style="text-align: center; border: 1px solid #000; padding: 6px;">${res?.mathScore ?? '-'} (${res?.mathLevel || 'H'})</td>
        <td style="text-align: center; border: 1px solid #000; padding: 6px;">${res?.vietnameseScore ?? '-'} (${res?.vietnameseLevel || 'H'})</td>
        <td style="text-align: center; border: 1px solid #000; padding: 6px;">${res?.englishScore ?? '-'} (${res?.englishLevel || 'H'})</td>
        <td style="text-align: center; border: 1px solid #000; padding: 6px;">${res?.selfAutonomy || 'T'}</td>
        <td style="text-align: center; border: 1px solid #000; padding: 6px;">${res?.communication || 'T'}</td>
        <td style="text-align: center; border: 1px solid #000; padding: 6px;">${res?.problemSolving || 'T'}</td>
        <td style="text-align: center; border: 1px solid #000; padding: 6px; font-weight: bold; color: #166534;">${res?.awardTitle || 'Hoàn thành tốt'}</td>
        <td style="border: 1px solid #000; padding: 6px; font-size: 13px;">${res?.overallComment || 'Chăm ngoan, hoàn thành tốt nhiệm vụ học tập.'}</td>
      </tr>
    `;
    })
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Bảng Tổng Hợp Kết Quả Đánh Giá Giáo Dục Theo Thông Tư 27</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 14pt; line-height: 1.3; }
        .header { text-align: center; margin-bottom: 25px; }
        .title { font-size: 16pt; font-weight: bold; text-transform: uppercase; margin-top: 15px; margin-bottom: 5px; color: #0f172a; }
        .subtitle { font-size: 13pt; font-style: italic; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { border: 1px solid #000; background-color: #e2e8f0; padding: 8px; font-weight: bold; font-size: 13px; text-align: center; }
        .footer { margin-top: 35px; width: 100%; }
        .sign-col { width: 50%; float: left; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <table style="border: none; width: 100%;">
          <tr>
            <td style="text-align: center; width: 45%; vertical-align: top;">
              <strong>${settings.schoolName.toUpperCase()}</strong><br>
              <strong>LỚP: ${settings.className}</strong>
            </td>
            <td style="text-align: center; width: 55%; vertical-align: top;">
              <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
              <strong>Độc lập - Tự do - Hạnh phúc</strong><br>
              -------------------
            </td>
          </tr>
        </table>
        
        <div class="title">BẢNG TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ GIÁO DỤC</div>
        <div class="subtitle">(Ban hành kèm theo Thông tư số 27/2020/TT-BGDĐT ngày 04/9/2020 của Bộ trưởng Bộ GD&ĐT)</div>
        <p><strong>${semester.toUpperCase()} - NĂM HỌC ${settings.schoolYear}</strong></p>
      </div>

      <table>
        <thead>
          <tr>
            <th rowspan="2">STT</th>
            <th rowspan="2">Mã HS</th>
            <th rowspan="2">Họ và tên học sinh</th>
            <th colspan="3">Môn học & HĐGD (Điểm KT & Mức đạt)</th>
            <th colspan="3">Năng lực cốt lõi</th>
            <th rowspan="2">Khen thưởng</th>
            <th rowspan="2">Nhận xét của giáo viên</th>
          </tr>
          <tr>
            <th>Toán</th>
            <th>T.Việt</th>
            <th>T.Anh</th>
            <th>Tự chủ</th>
            <th>Giao tiếp</th>
            <th>GQ vấn đề</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div style="margin-top: 20px; font-size: 12px; font-style: italic;">
        * Ghi chú mức đạt: T: Hoàn thành tốt | H: Hoàn thành | C: Chưa hoàn thành.
      </div>

      <div class="footer">
        <div class="sign-col">
          <br>
          <strong>HIỆU TRƯỞNG</strong><br>
          <em>(Ký và ghi rõ họ tên)</em>
        </div>
        <div class="sign-col">
          <em>Ngày ..... tháng ..... năm 2026</em><br>
          <strong>GIÁO VIÊN CHỦ NHIỆM</strong><br>
          <em>(Ký và ghi rõ họ tên)</em>
          <br><br><br><br>
          <strong>${settings.teacherName}</strong>
        </div>
        <div style="clear: both;"></div>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Danh_Gia_TT27_${settings.className}_${semester.replace(/\s+/g, '_')}.doc`;
  a.click();
  URL.revokeObjectURL(url);
};

// Parse Excel / Word text import for students
export const parseStudentImportFile = async (file: File): Promise<Partial<Student>[]> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

    return jsonData.map((row, idx) => {
      // Find key matching code, name, phone, dob, etc.
      const name = String(row['Họ và tên'] || row['Tên học sinh'] || row['Họ tên'] || row['Name'] || row['name'] || `Học sinh ${idx + 1}`);
      const code = String(row['Mã học sinh'] || row['Mã HS'] || row['Code'] || `HS${String(idx + 1).padStart(3, '0')}`);
      const dob = String(row['Ngày sinh'] || row['DOB'] || '2019-01-01');
      const gender = String(row['Giới tính'] || row['Gender'] || '').toLowerCase().includes('nữ') ? 'Nữ' : 'Nam';
      const parentName = String(row['Họ tên phụ huynh'] || row['Phụ huynh'] || row['Parent'] || `PH em ${name}`);
      const parentPhone = String(row['Số điện thoại PH'] || row['SĐT'] || row['Phone'] || '0900000000');
      const password = String(row['Mật khẩu'] || row['Password'] || '123');

      return {
        code,
        name,
        dob,
        gender: gender as 'Nam' | 'Nữ',
        parentName,
        parentPhone,
        password,
        avatar: gender === 'Nữ' ? '👧🏻' : '👦🏻',
        points: 10,
        stars: 3,
        gameParticipationCount: 0,
      };
    });
  } else {
    // Plain text or Word text extraction fallback
    const text = await file.text();
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    return lines.map((line, idx) => {
      const parts = line.split(/[,\t|;]/).map((p) => p.trim());
      const name = parts[0] || `Học sinh ${idx + 1}`;
      const code = parts[1] || `HS${String(idx + 1).padStart(3, '0')}`;
      const phone = parts[2] || '0900000000';
      return {
        code,
        name,
        dob: '2019-01-01',
        gender: 'Nam',
        parentName: `PH em ${name}`,
        parentPhone: phone,
        password: '123',
        avatar: '👦🏻',
        points: 10,
        stars: 3,
        gameParticipationCount: 0,
      };
    });
  }
};
