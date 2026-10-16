# EduMate – Người Bạn Đồng Hành Của Giáo Viên (Lớp 1 Tiểu Học)

Ứng dụng quản lý lớp học toàn diện, tạo trò chơi tương tác có giọng đọc cô giáo chuẩn mực, đánh giá học sinh chuẩn theo **Thông tư 27/2020/TT-BGDĐT** và kết nối 2 chiều giữa giáo viên và phụ huynh học sinh.

---

## 🌟 Tính Năng Nổi Bật

1. **Hiển thị tối ưu mọi thiết bị (Điện thoại & Máy tính)**:
   - Tự động co giãn theo kích thước màn hình điện thoại (Responsive chuẩn).
   - Thanh điều hướng nhanh phía dưới màn hình điện thoại (Mobile Bottom Navigation).
   - Menu trượt (Mobile Drawer) mượt mà, tiện lợi.
2. **Âm thanh & Giọng đọc cô giáo dịu dàng 100%**:
   - Thay thế toàn bộ giọng đọc nam nhanh bằng giọng nữ trợ giảng ngọt ngào, ấm áp.
   - Tốc độ đọc chậm rãi (0.70x), rõ ràng, phù hợp tuyệt đối cho học sinh lớp 1.
   - Phát âm tiếng Việt và Tiếng Anh chuẩn (Good job, Well done, Wonderful, Keep going, Don't worry, Nice try).
3. **Âm nhạc vui nhộn trên bảng điều khiển**:
   - Kho bài hát khởi động thể dục, tiếng Anh, đồng dao thiếu nhi và nhạc thư giãn.
   - Trình phát video YouTube / nhạc trực tiếp cho học sinh nghe và xem.
   - Cho phép giáo viên dán thêm link video hoặc xóa bài hát tùy ý.
4. **Trò chơi tương tác đa dạng**:
   - Trò chơi trắc nghiệm tiếng Anh, toán học, câu đố lớp 1.
   - Cô giáo đọc chậm từng câu hỏi và 4 đáp án giúp các em chưa biết đọc chữ vẫn tham gia được.
   - Vòng quay gọi tên ngẫu nhiên kết hợp hộp quà bí mật và lật thẻ bài.
   - Chức năng quản lý: Thêm câu hỏi mới, sửa, hoặc xóa trò chơi không cần thiết.
5. **Đánh giá theo Thông tư 27/2020/TT-BGDĐT**:
   - Ngân hàng mẫu nhận xét môn học, năng lực, phẩm chất chuẩn mực sư phạm.
   - 1-Click copy lời phê để dán vào hệ thống SMAS / VnEdu.
   - Bảng tổng hợp cuối kỳ, xuất file Word và Excel chính xác theo biểu mẫu quy định.
6. **Kết nối phụ huynh học sinh**:
   - Cổng tra cứu riêng cho từng phụ huynh bằng mã học sinh hoặc mã QR.
   - Nhận phản hồi, tin nhắn từ phụ huynh tức thì.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng Trên Máy Tính

### Yêu Cầu Hệ Thống:
- Đã cài đặt **Node.js** (Khuyến nghị phiên bản 18 hoặc 20 trở lên). Tải tại: [https://nodejs.org](https://nodejs.org)

### Các Bước Thực Hiện:

```bash
# 1. Giải nén file ZIP vừa tải về:
# Bạn nhấp chuột phải vào file edumate-source-code.zip -> chọn Extract All (Giải nén)

# 2. Mở cửa sổ dòng lệnh (Terminal / Command Prompt / PowerShell) tại thư mục vừa giải nén:

# 3. Cài đặt các thư viện phụ thuộc:
npm install

# 4. Khởi động ứng dụng ở chế độ phát triển:
npm run dev

# 5. Mở trình duyệt web (Chrome, Edge, Cốc Cốc, Safari) và truy cập địa chỉ:
# http://localhost:3000
```

---

## 🐳 Chạy Bằng Docker (Frontend + Backend Rails + MySQL)

Dữ liệu được lưu trong MySQL thông qua backend Ruby on Rails (thư mục `backend/`).

```bash
docker compose up -d --build
```

| Service    | Địa chỉ                    | Mô tả                                   |
|------------|----------------------------|-----------------------------------------|
| `frontend` | http://localhost:3000      | Vite + React, proxy `/api` sang backend |
| `backend`  | http://localhost:3001/api  | Rails 8 API                             |
| `db`       | `localhost:3307`           | MySQL 8.4 (user `root` / `edumate_root`) |

Lần chạy đầu, backend tự tạo database, chạy migration và tạo 2 tài khoản demo (chỉ ở môi trường development):

| Vai trò    | Email                    | Mật khẩu |
|------------|--------------------------|----------|
| Giáo viên  | `giaovien@edumate.local` | `123456` |
| Phụ huynh  | `phuhuynh@edumate.local` | `123456` (đã liên kết với học sinh HS001) |

### Tài khoản & phân quyền

- Phải **đăng ký rồi đăng nhập** mới vào được ứng dụng (đăng nhập bằng email + mật khẩu, mật khẩu mã hóa bcrypt, phiên đăng nhập 30 ngày).
- **Giáo viên**: mỗi tài khoản có **một lớp riêng** (dữ liệu tách biệt hoàn toàn) và một **Mã lớp** 6 ký tự (xem trong Cài đặt).
- **Phụ huynh**: đăng ký tài khoản, sau đó liên kết với con bằng **Mã lớp + Mã học sinh + Mật khẩu học sinh** do giáo viên cung cấp. Phụ huynh chỉ xem được dữ liệu của con mình (không thấy nhận xét riêng tư của giáo viên) và gửi tin nhắn cho giáo viên.

Các lệnh hữu ích:

```bash
docker compose logs -f backend                  # xem log backend
docker compose exec backend bin/rails db:migrate # chạy migration mới
docker compose exec backend bin/rails console    # Rails console
docker compose down                              # dừng (giữ dữ liệu)
docker compose down -v                           # dừng và XÓA toàn bộ dữ liệu MySQL
```

### API chính

Mọi API (trừ đăng ký/đăng nhập) cần header `Authorization: Bearer <token>`.

- `POST /api/auth/register` `{ role, name, email, phone, password }`, `POST /api/auth/login` `{ email, password }` → `{ token, user }`
- `DELETE /api/auth/logout`, `GET /api/auth/me`
- Phụ huynh: `GET|POST /api/parent/children` (danh sách / liên kết con), `GET /api/parent/children/:id` (dữ liệu của con), `POST /api/parent/children/:id/messages`

Giáo viên (dữ liệu lớp của chính mình):

- `GET /api/data` – toàn bộ dữ liệu (cùng định dạng file sao lưu JSON)
- `POST /api/data/import` – khôi phục từ file sao lưu JSON
- `POST /api/data/reset` – khôi phục dữ liệu mẫu
- `GET|PUT /api/settings` – cài đặt
- Mỗi danh sách (`students`, `attendance_records`, `point_histories`, `reward_items`, `reward_redemptions`, `daily_comments`, `semester_results`, `interactive_games`, `music_items`, `parent_messages`, `parent_login_logs`) có đủ CRUD REST và `POST /api/<tên>/batch` để đồng bộ thay đổi `{ upsert, delete, order }`.

### Chạy frontend ngoài Docker

Chỉ cần backend + MySQL trong Docker (`docker compose up -d db backend`), rồi chạy `npm run dev` như bình thường. Vite tự proxy `/api` sang `http://localhost:3001` (Node ≥ 20.19).

Dữ liệu mẫu nằm ở `backend/db/seeds/default_data.json`, được sinh từ `src/utils/storage.ts` bằng lệnh `npx tsx scripts/export_seed_data.ts`.

---

## 🚀 Môi Trường Production (Docker)

Stack production gồm MySQL, Rails (chế độ production) và nginx phục vụ frontend đã build sẵn, đồng thời chuyển `/api` sang Rails. Toàn bộ chạy qua một cổng duy nhất (mặc định 8080).

```bash
cp .env.production.example .env.production   # rồi thay toàn bộ giá trị (openssl rand -hex 24 / 64)
npm run prod:up      # = docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
npm run prod:logs    # xem log
npm run prod:down    # dừng (giữ dữ liệu)
```

- Truy cập: `http://<máy chủ>:8080`
- Production **không** tạo tài khoản demo, nên người dùng phải tự đăng ký.
- Tên project là `edumate-prod` (container, network, volume đều riêng), chạy song song được với stack dev.
- Khi đã có domain và HTTPS (ví dụ qua Caddy), đặt `FORCE_SSL=true` trong `.env.production`.

---

## 📱 Sử Dụng Trên Điện Thoại (Thêm vào Màn hình chính như App)

1. Mở link ứng dụng trên trình duyệt điện thoại (Safari trên iPhone hoặc Chrome trên Android).
2. Nhấn nút **Chia sẻ** (Safari) hoặc biểu tượng **3 chấm** (Chrome).
3. Chọn **"Thêm vào Màn hình chính" (Add to Home Screen)**.
4. Biểu tượng EduMate 🎒 sẽ xuất hiện trên màn hình điện thoại, bạn có thể mở lên xem toàn màn hình đúng chuẩn ứng dụng native!
