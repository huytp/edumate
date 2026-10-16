# One row per teacher holding the app configuration (AppSettings in the frontend).
class AppSetting < ApplicationRecord
  include ApiSerializable

  belongs_to :teacher, class_name: "User"

  # Fields a parent may see (school/teacher info and speech preferences).
  PUBLIC_FIELDS = %w[
    schoolName className schoolYear teacherName teacherPhone teacherEmail appTitle appLogo
    soundEffectsEnabled speechEnabled speechVoice speechRate speechPitch preferredVoiceURI
  ].freeze

  def self.api_hidden_columns
    %w[teacher_id]
  end

  def self.api_key_overrides
    { "preferred_voice_uri" => "preferredVoiceURI" }
  end

  # The class code is shown to the teacher so they can hand it to parents.
  def as_api_json
    super.merge("classCode" => teacher.class_code)
  end

  def as_parent_json
    as_api_json.slice(*PUBLIC_FIELDS)
  end

  # Settings are merged rather than replaced: only keys present in the payload change.
  def merge_api_attributes(payload)
    self.class.api_fields.each do |column, key|
      self[column] = payload[key] if payload.key?(key)
    end
    self
  end
end
