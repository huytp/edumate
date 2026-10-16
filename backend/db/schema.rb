# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_10_16_000001) do
  create_table "app_settings", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "teacher_id", null: false
    t.string "school_name"
    t.string "class_name"
    t.string "school_year"
    t.string "teacher_name"
    t.string "teacher_phone"
    t.string "teacher_email"
    t.string "app_title"
    t.text "app_logo", size: :medium
    t.boolean "sound_effects_enabled", default: true, null: false
    t.boolean "speech_enabled", default: true, null: false
    t.string "speech_voice", default: "vi"
    t.float "speech_rate"
    t.float "speech_pitch"
    t.string "preferred_voice_uri"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["teacher_id"], name: "index_app_settings_on_teacher_id", unique: true
  end

  create_table "attendance_records", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "teacher_id", null: false
    t.string "client_id", limit: 64, null: false
    t.date "date", null: false
    t.string "student_id", limit: 64, null: false
    t.string "status", null: false
    t.text "note"
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["teacher_id", "client_id"], name: "index_attendance_records_on_teacher_id_and_client_id", unique: true
    t.index ["teacher_id", "student_id", "date"], name: "index_attendance_records_on_teacher_id_and_student_id_and_date"
    t.index ["teacher_id"], name: "index_attendance_records_on_teacher_id"
  end

  create_table "auth_sessions", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "token_digest", null: false
    t.datetime "expires_at", null: false
    t.string "user_agent"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["token_digest"], name: "index_auth_sessions_on_token_digest", unique: true
    t.index ["user_id"], name: "index_auth_sessions_on_user_id"
  end

  create_table "daily_comments", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "teacher_id", null: false
    t.string "client_id", limit: 64, null: false
    t.string "student_id", limit: 64, null: false
    t.date "date", null: false
    t.string "category", null: false
    t.string "subject"
    t.string "level"
    t.text "content"
    t.text "encouragement"
    t.boolean "is_private_to_teacher"
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["teacher_id", "client_id"], name: "index_daily_comments_on_teacher_id_and_client_id", unique: true
    t.index ["teacher_id", "student_id", "date"], name: "index_daily_comments_on_teacher_id_and_student_id_and_date"
    t.index ["teacher_id"], name: "index_daily_comments_on_teacher_id"
  end

  create_table "interactive_games", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "teacher_id", null: false
    t.string "client_id", limit: 64, null: false
    t.string "title", null: false
    t.string "category", null: false
    t.text "description"
    t.text "external_url"
    t.text "cover_image", size: :medium
    t.string "icon"
    t.integer "play_count", default: 0, null: false
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["teacher_id", "client_id"], name: "index_interactive_games_on_teacher_id_and_client_id", unique: true
    t.index ["teacher_id"], name: "index_interactive_games_on_teacher_id"
  end

  create_table "music_items", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "teacher_id", null: false
    t.string "client_id", limit: 64, null: false
    t.string "title", null: false
    t.text "url"
    t.string "category"
    t.text "description"
    t.text "thumbnail"
    t.string "icon"
    t.integer "play_count", default: 0, null: false
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["teacher_id", "client_id"], name: "index_music_items_on_teacher_id_and_client_id", unique: true
    t.index ["teacher_id"], name: "index_music_items_on_teacher_id"
  end

  create_table "parent_links", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "parent_id", null: false
    t.bigint "student_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["parent_id", "student_id"], name: "index_parent_links_on_parent_id_and_student_id", unique: true
    t.index ["parent_id"], name: "index_parent_links_on_parent_id"
    t.index ["student_id"], name: "index_parent_links_on_student_id"
  end

  create_table "parent_login_logs", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "teacher_id", null: false
    t.string "client_id", limit: 64, null: false
    t.string "student_id", limit: 64, null: false
    t.string "student_name"
    t.string "parent_name"
    t.string "login_time"
    t.string "device_info"
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["teacher_id", "client_id"], name: "index_parent_login_logs_on_teacher_id_and_client_id", unique: true
    t.index ["teacher_id"], name: "index_parent_login_logs_on_teacher_id"
  end

  create_table "parent_messages", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "teacher_id", null: false
    t.string "client_id", limit: 64, null: false
    t.string "student_id", limit: 64, null: false
    t.string "student_name"
    t.string "parent_name"
    t.string "parent_phone"
    t.text "content"
    t.string "date"
    t.text "reply"
    t.string "reply_date"
    t.boolean "is_read", default: false, null: false
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["teacher_id", "client_id"], name: "index_parent_messages_on_teacher_id_and_client_id", unique: true
    t.index ["teacher_id", "student_id"], name: "index_parent_messages_on_teacher_id_and_student_id"
    t.index ["teacher_id"], name: "index_parent_messages_on_teacher_id"
  end

  create_table "point_histories", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "teacher_id", null: false
    t.string "client_id", limit: 64, null: false
    t.string "student_id", limit: 64, null: false
    t.string "student_name"
    t.integer "delta", default: 0, null: false
    t.text "reason"
    t.string "date"
    t.bigint "timestamp"
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["teacher_id", "client_id"], name: "index_point_histories_on_teacher_id_and_client_id", unique: true
    t.index ["teacher_id", "student_id"], name: "index_point_histories_on_teacher_id_and_student_id"
    t.index ["teacher_id"], name: "index_point_histories_on_teacher_id"
  end

  create_table "quiz_questions", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "interactive_game_id", null: false
    t.string "client_id", null: false
    t.text "prompt"
    t.string "english_word"
    t.string "pronunciation"
    t.json "options"
    t.integer "correct_index", default: 0, null: false
    t.text "explanation"
    t.text "image", size: :medium
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["interactive_game_id"], name: "index_quiz_questions_on_interactive_game_id"
  end

  create_table "reward_items", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "teacher_id", null: false
    t.string "client_id", limit: 64, null: false
    t.string "name", null: false
    t.integer "points_cost", default: 0, null: false
    t.string "icon"
    t.integer "stock", default: 0, null: false
    t.text "description"
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["teacher_id", "client_id"], name: "index_reward_items_on_teacher_id_and_client_id", unique: true
    t.index ["teacher_id"], name: "index_reward_items_on_teacher_id"
  end

  create_table "reward_redemptions", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "teacher_id", null: false
    t.string "client_id", limit: 64, null: false
    t.string "student_id", limit: 64, null: false
    t.string "student_name"
    t.string "reward_id", limit: 64
    t.string "reward_name"
    t.integer "points_spent", default: 0, null: false
    t.string "date"
    t.string "status", default: "pending", null: false
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["teacher_id", "client_id"], name: "index_reward_redemptions_on_teacher_id_and_client_id", unique: true
    t.index ["teacher_id", "student_id"], name: "index_reward_redemptions_on_teacher_id_and_student_id"
    t.index ["teacher_id"], name: "index_reward_redemptions_on_teacher_id"
  end

  create_table "semester_results", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "teacher_id", null: false
    t.string "client_id", limit: 64, null: false
    t.string "student_id", limit: 64, null: false
    t.string "school_year"
    t.string "semester"
    t.float "math_score"
    t.string "math_level"
    t.float "vietnamese_score"
    t.string "vietnamese_level"
    t.float "english_score"
    t.string "english_level"
    t.string "science_level"
    t.string "history_geo_level"
    t.string "ethics_level"
    t.string "music_level"
    t.string "art_level"
    t.string "pe_level"
    t.string "self_autonomy"
    t.string "communication"
    t.string "problem_solving"
    t.string "patriotism"
    t.string "compassion"
    t.string "diligence"
    t.string "honesty"
    t.string "responsibility"
    t.string "award_title"
    t.text "overall_comment"
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["teacher_id", "client_id"], name: "index_semester_results_on_teacher_id_and_client_id", unique: true
    t.index ["teacher_id", "student_id"], name: "index_semester_results_on_teacher_id_and_student_id"
    t.index ["teacher_id"], name: "index_semester_results_on_teacher_id"
  end

  create_table "students", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.bigint "teacher_id", null: false
    t.string "client_id", limit: 64, null: false
    t.string "code", null: false
    t.string "name", null: false
    t.string "dob"
    t.string "gender"
    t.text "avatar", size: :medium
    t.string "parent_name"
    t.string "parent_phone"
    t.string "password"
    t.integer "points", default: 0, null: false
    t.integer "stars", default: 0, null: false
    t.integer "game_participation_count", default: 0, null: false
    t.text "notes"
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["teacher_id", "client_id"], name: "index_students_on_teacher_id_and_client_id", unique: true
    t.index ["teacher_id", "code"], name: "index_students_on_teacher_id_and_code"
    t.index ["teacher_id"], name: "index_students_on_teacher_id"
  end

  create_table "users", charset: "utf8mb4", collation: "utf8mb4_unicode_ci", force: :cascade do |t|
    t.string "role", null: false
    t.string "name", null: false
    t.string "email", null: false
    t.string "phone"
    t.string "password_digest", null: false
    t.string "class_code"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["class_code"], name: "index_users_on_class_code", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "app_settings", "users", column: "teacher_id", on_delete: :cascade
  add_foreign_key "attendance_records", "users", column: "teacher_id", on_delete: :cascade
  add_foreign_key "auth_sessions", "users", on_delete: :cascade
  add_foreign_key "daily_comments", "users", column: "teacher_id", on_delete: :cascade
  add_foreign_key "interactive_games", "users", column: "teacher_id", on_delete: :cascade
  add_foreign_key "music_items", "users", column: "teacher_id", on_delete: :cascade
  add_foreign_key "parent_links", "students", on_delete: :cascade
  add_foreign_key "parent_links", "users", column: "parent_id", on_delete: :cascade
  add_foreign_key "parent_login_logs", "users", column: "teacher_id", on_delete: :cascade
  add_foreign_key "parent_messages", "users", column: "teacher_id", on_delete: :cascade
  add_foreign_key "point_histories", "users", column: "teacher_id", on_delete: :cascade
  add_foreign_key "quiz_questions", "interactive_games", on_delete: :cascade
  add_foreign_key "reward_items", "users", column: "teacher_id", on_delete: :cascade
  add_foreign_key "reward_redemptions", "users", column: "teacher_id", on_delete: :cascade
  add_foreign_key "semester_results", "users", column: "teacher_id", on_delete: :cascade
  add_foreign_key "students", "users", column: "teacher_id", on_delete: :cascade
end
