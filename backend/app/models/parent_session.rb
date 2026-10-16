# A parent's sign-in for one student, started from the class link with the student's code and password.
# Like AuthSession, only a SHA-256 digest of the token is stored.
class ParentSession < ApplicationRecord
  TTL = 30.days

  belongs_to :teacher, class_name: "User"

  scope :active, -> { where("expires_at > ?", Time.current) }

  # Returns [session, raw_token]; the raw token is only available here.
  def self.start!(student, user_agent: nil)
    token = SecureRandom.urlsafe_base64(32)
    session = create!(teacher_id: student.teacher_id, student_client_id: student.client_id,
      token_digest: AuthSession.digest(token), expires_at: TTL.from_now, user_agent: user_agent.to_s.first(255))
    [ session, token ]
  end

  def self.find_by_token(token)
    active.find_by(token_digest: AuthSession.digest(token)) if token.present?
  end

  # Nil once the teacher deletes the student, which ends the session.
  def student
    Student.find_by(teacher_id: teacher_id, client_id: student_client_id)
  end
end
