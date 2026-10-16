# Maps table columns (snake_case) to the JSON shape the frontend uses (camelCase),
# so records round-trip exactly as they were stored in localStorage before.
module ApiSerializable
  extend ActiveSupport::Concern

  INTERNAL_COLUMNS = %w[id position created_at updated_at].freeze

  class_methods do
    # { "column_name" => "jsonKey" }
    def api_fields
      @api_fields ||= (column_names - INTERNAL_COLUMNS - api_hidden_columns)
        .index_with { |column| api_key_overrides.fetch(column) { column.camelize(:lower) } }
    end

    # The frontend's own id is stored in `client_id` and exposed as "id".
    def api_key_overrides
      { "client_id" => "id" }
    end

    def api_hidden_columns
      []
    end
  end

  # Nil values are left out, mirroring optional (undefined) fields in the TypeScript types.
  def as_api_json
    self.class.api_fields.each_with_object({}) do |(column, key), json|
      value = public_send(column)
      json[key] = value unless value.nil?
    end
  end

  # Full replacement: a key missing from the payload resets the column to its default.
  def assign_api_attributes(payload)
    self.class.api_fields.each do |column, key|
      next if column == "client_id"

      self[column] = payload.key?(key) ? payload[key] : self.class.column_defaults[column]
    end
    self
  end
end
