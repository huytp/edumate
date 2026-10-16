# Base class for every list the frontend manages (students, attendance, ...).
# Each record belongs to one teacher's classroom, is identified there by the
# frontend-generated `client_id`, and is ordered by `position`.
class ListRecord < ApplicationRecord
  self.abstract_class = true
  include ApiSerializable

  belongs_to :teacher, class_name: "User"

  validates :client_id, presence: true, uniqueness: { scope: :teacher_id }

  scope :ordered, -> { order(:position, :id) }

  def self.api_hidden_columns
    %w[teacher_id]
  end

  # Rewrites `position` for the given client ids so the list keeps the UI order.
  # Call it on a teacher-scoped relation.
  def self.apply_order!(client_ids)
    client_ids = Array(client_ids).map(&:to_s)
    return if client_ids.empty?

    where(client_id: client_ids).update_all([ "position = FIELD(client_id, ?) - 1", client_ids ])
  end
end
