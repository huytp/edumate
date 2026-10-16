module Api
  class DataController < ApplicationController
    before_action :require_teacher!

    # Everything the teacher's app needs at startup, in the backup-file shape.
    def show
      render json: EdumateData.export(current_user)
    end

    # Restores a JSON backup exported from the app.
    def import
      EdumateData.import!(current_user, json_body)
      head :no_content
    end

    # Restores the sample class.
    def reset
      EdumateData.reset!(current_user)
      head :no_content
    end
  end
end
