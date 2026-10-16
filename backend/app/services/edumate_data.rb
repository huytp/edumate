# Reads and writes one teacher's classroom in the same JSON shape as the frontend data
# (the shape of the old JSON backup file, so those backups can still be imported).
module EdumateData
  # JSON key => model
  COLLECTIONS = {
    "students" => Student,
    "attendance" => AttendanceRecord,
    "pointsHistory" => PointHistory,
    "rewards" => RewardItem,
    "redemptions" => RewardRedemption,
    "comments" => DailyComment,
    "semesterResults" => SemesterResult,
    "games" => InteractiveGame,
    "music" => MusicItem,
    "messages" => ParentMessage,
    "loginLogs" => ParentLoginLog
  }.freeze

  # Content a brand-new classroom starts with (no students yet).
  STARTER_COLLECTIONS = %w[rewards games music].freeze

  DEFAULT_DATA_PATH = Rails.root.join("db/seeds/default_data.json")

  module_function

  def export(teacher)
    collections = COLLECTIONS.transform_values do |model|
      scope = model.where(teacher: teacher).ordered
      scope = scope.includes(:quiz_questions) if model == InteractiveGame
      scope.map(&:as_api_json)
    end
    { "settings" => teacher.settings.as_api_json }.merge(collections)
  end

  # Replaces every collection present in `data`; collections that are absent are left untouched.
  def import!(teacher, data)
    ActiveRecord::Base.transaction do
      teacher.settings.merge_api_attributes(data["settings"]).save! if data["settings"].is_a?(Hash)

      COLLECTIONS.each do |key, model|
        next unless data[key].is_a?(Array)

        records = model.where(teacher: teacher)
        records.destroy_all
        data[key].each_with_index do |payload, index|
          record = records.new(client_id: payload["id"].to_s)
          record.assign_api_attributes(payload)
          record.position = index
          record.save!
        end
      end
    end
  end

  # Wipes the classroom and loads the sample class shipped with the app.
  def reset!(teacher)
    sample = default_data
    sample["settings"] = sample["settings"].merge(teacher_identity(teacher))
    import!(teacher, sample)
  end

  # Called right after a teacher registers.
  def setup_classroom!(teacher)
    sample = default_data
    import!(teacher, sample.slice(*STARTER_COLLECTIONS).merge("settings" => sample["settings"].merge(teacher_identity(teacher))))
  end

  # Sample data uses {{TODAY}} so attendance and comments always show up for the current day.
  def default_data
    JSON.parse(File.read(DEFAULT_DATA_PATH).gsub("{{TODAY}}", Date.current.iso8601))
  end

  def teacher_identity(teacher)
    { "teacherName" => teacher.name, "teacherEmail" => teacher.email, "teacherPhone" => teacher.phone.to_s }
  end
end
