class AttendanceRecord < ListRecord
  STATUSES = %w[present excused unexcused late].freeze

  validates :date, :student_id, presence: true
  validates :status, inclusion: { in: STATUSES }
end
