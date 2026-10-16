class QuizQuestion < ApplicationRecord
  include ApiSerializable

  belongs_to :interactive_game

  def self.api_hidden_columns
    %w[interactive_game_id]
  end

  def assign_api_attributes(payload)
    super
    self.client_id = payload["id"].presence || "q-#{SecureRandom.hex(4)}"
    self.options = Array(payload["options"])
    self
  end
end
