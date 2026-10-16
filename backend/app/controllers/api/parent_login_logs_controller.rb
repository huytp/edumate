module Api
  class ParentLoginLogsController < RecordsController
    self.model = ParentLoginLog

    # Newest first, capped at ParentLoginLog::MAX_ENTRIES.
    def create
      render json: ParentLoginLog.prepend!(current_user, json_body).as_api_json, status: :created
    end
  end
end
