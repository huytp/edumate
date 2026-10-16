# Shared CRUD + batch sync for every list resource, scoped to the signed-in teacher's classroom.
# Subclasses only declare their model.
module Api
  class RecordsController < ApplicationController
    class_attribute :model

    before_action :require_teacher!

    def index
      render json: scope.map(&:as_api_json)
    end

    def show
      render json: scope.find_by!(client_id: params[:id]).as_api_json
    end

    def create
      record = records.new(client_id: json_body["id"].presence || "#{model.model_name.singular}-#{SecureRandom.hex(6)}")
      record.assign_api_attributes(json_body)
      record.position = (records.minimum(:position) || 0) - 1 # new items appear first, as in the UI
      record.save!
      render json: record.as_api_json, status: :created
    end

    def update
      record = records.find_by!(client_id: params[:id])
      record.assign_api_attributes(json_body)
      record.save!
      render json: record.as_api_json
    end

    def destroy
      records.find_by!(client_id: params[:id]).destroy!
      head :no_content
    end

    # Applies the changes the frontend computed since its last sync:
    #   { "upsert": [records...], "delete": [ids...], "order": [all ids in UI order] }
    # Only touched records are written, so concurrent edits from other devices are not lost.
    def batch
      upserts = Array(json_body["upsert"])
      deletes = Array(json_body["delete"]).map(&:to_s)

      model.transaction do
        upserts.each do |payload|
          record = records.find_or_initialize_by(client_id: payload["id"].to_s)
          record.assign_api_attributes(payload)
          record.save!
        end
        records.where(client_id: deletes).destroy_all if deletes.any?
        records.apply_order!(json_body["order"]) if json_body["order"].present?
      end

      render json: { upserted: upserts.size, deleted: deletes.size }
    end

    private

    def records
      model.where(teacher: current_user)
    end

    def scope
      records.ordered
    end
  end
end
