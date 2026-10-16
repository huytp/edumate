module Api
  class SettingsController < ApplicationController
    before_action :require_teacher!

    def show
      render json: current_user.settings.as_api_json
    end

    def update
      settings = current_user.settings.merge_api_attributes(json_body)
      settings.save!
      render json: settings.as_api_json
    end
  end
end
