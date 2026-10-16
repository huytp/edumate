class Student < ListRecord
  validates :code, :name, presence: true

  # What a parent may see: everything except the sign-in password.
  def as_parent_json
    as_api_json.except("password")
  end
end
