class Student < ListRecord
  has_many :parent_links, dependent: :delete_all

  validates :code, :name, presence: true

  # What a parent may see: everything except the linking password.
  def as_parent_json
    as_api_json.except("password")
  end
end
