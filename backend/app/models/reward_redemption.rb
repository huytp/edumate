class RewardRedemption < ListRecord
  validates :student_id, presence: true
  validates :status, inclusion: { in: %w[pending delivered] }
end
