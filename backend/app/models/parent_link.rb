class ParentLink < ApplicationRecord
  belongs_to :parent, class_name: "User"
  belongs_to :student

  validates :student_id, uniqueness: { scope: :parent_id }
end
