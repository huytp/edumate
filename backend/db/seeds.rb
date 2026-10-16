# Development only: a demo teacher with the sample class. Parents sign in from the class link
# (/phu-huynh?lop=<mã lớp>) with a student code and password, e.g. HS001 / 123.
# The sample class itself lives in db/seeds/default_data.json
# (regenerate it from the frontend defaults with: npx tsx scripts/export_seed_data.ts).
return unless Rails.env.development?

teacher = User.find_or_initialize_by(email: "giaovien@edumate.local")
if teacher.new_record?
  teacher.update!(role: "teacher", name: "Cô Nguyễn Thị Hoa", phone: "0912345678", password: "123456")
  EdumateData.reset!(teacher)
  puts "Demo teacher: giaovien@edumate.local / 123456 (mã lớp #{teacher.class_code})"
end

