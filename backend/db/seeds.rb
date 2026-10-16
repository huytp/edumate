# Development only: a demo teacher with the sample class and a demo parent linked to one child.
# The sample class itself lives in db/seeds/default_data.json
# (regenerate it from the frontend defaults with: npx tsx scripts/export_seed_data.ts).
return unless Rails.env.development?

teacher = User.find_or_initialize_by(email: "giaovien@edumate.local")
if teacher.new_record?
  teacher.update!(role: "teacher", name: "Cô Nguyễn Thị Hoa", phone: "0912345678", password: "123456")
  EdumateData.reset!(teacher)
  puts "Demo teacher: giaovien@edumate.local / 123456 (mã lớp #{teacher.class_code})"
end

parent = User.find_or_initialize_by(email: "phuhuynh@edumate.local")
if parent.new_record?
  parent.update!(role: "parent", name: "Phụ huynh demo", phone: "0987654321", password: "123456")
  child = teacher.students.order(:position).first
  ParentLink.create!(parent: parent, student: child) if child
  puts "Demo parent: phuhuynh@edumate.local / 123456"
end
