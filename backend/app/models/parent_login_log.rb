class ParentLoginLog < ListRecord
  MAX_ENTRIES = 100

  validates :student_id, presence: true

  # Inserts a log at the top of a teacher's list and keeps only the newest MAX_ENTRIES.
  def self.prepend!(teacher, payload)
    logs = where(teacher: teacher)
    transaction do
      logs.update_all("position = position + 1")
      log = logs.new(client_id: payload["id"].presence || "log-#{(Time.current.to_f * 1000).to_i}")
      log.assign_api_attributes(payload)
      log.position = 0
      log.save!
      logs.where(position: MAX_ENTRIES..).delete_all
      log
    end
  end
end
