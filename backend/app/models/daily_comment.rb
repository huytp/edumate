class DailyComment < ListRecord
  CATEGORIES = %w[mon_hoc nang_luc pham_chat tong_hop].freeze

  validates :student_id, :date, presence: true
  validates :category, inclusion: { in: CATEGORIES }
end
