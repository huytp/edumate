# A login token. Only a SHA-256 digest is stored, so a database leak does not expose tokens.
class AuthSession < ApplicationRecord
  TTL = 30.days

  belongs_to :user

  scope :active, -> { where("expires_at > ?", Time.current) }

  def self.digest(token)
    Digest::SHA256.hexdigest(token.to_s)
  end

  # Returns [session, raw_token]; the raw token is only available here.
  def self.start!(user, user_agent: nil)
    token = SecureRandom.urlsafe_base64(32)
    session = create!(user: user, token_digest: digest(token), expires_at: TTL.from_now, user_agent: user_agent.to_s.first(255))
    [ session, token ]
  end

  def self.find_by_token(token)
    active.includes(:user).find_by(token_digest: digest(token)) if token.present?
  end
end
