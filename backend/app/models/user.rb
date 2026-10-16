class User < ApplicationRecord
  # "parent" accounts are legacy: parents now sign in per student from the class link (ParentSession).
  ROLES = %w[teacher parent].freeze

  has_secure_password

  has_many :auth_sessions, dependent: :delete_all

  # Teacher side: one classroom per account.
  has_one :app_setting, foreign_key: :teacher_id, dependent: :destroy, inverse_of: :teacher
  has_many :students, foreign_key: :teacher_id, inverse_of: :teacher
  has_many :parent_sessions, foreign_key: :teacher_id, dependent: :delete_all

  normalizes :email, with: ->(email) { email.strip.downcase }

  validates :role, inclusion: { in: ROLES }
  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 6 }, allow_nil: true

  before_create :assign_class_code, if: :teacher?

  def teacher?
    role == "teacher"
  end

  def parent?
    role == "parent"
  end

  def settings
    app_setting || create_app_setting!
  end

  def as_api_json
    { "id" => id, "role" => role, "name" => name, "email" => email, "phone" => phone, "classCode" => class_code }.compact
  end

  private

  def assign_class_code
    self.class_code ||= loop do
      code = SecureRandom.alphanumeric(6).upcase
      break code unless User.exists?(class_code: code)
    end
  end
end
