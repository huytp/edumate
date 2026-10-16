module Api
  class AuthController < ApplicationController
    RATE_LIMIT_STORE = ActiveSupport::Cache::MemoryStore.new

    skip_before_action :authenticate!, only: %i[register login]
    rate_limit to: 10, within: 1.minute, only: %i[register login], store: RATE_LIMIT_STORE,
      with: -> { render json: { error: "Too many attempts, please try again later" }, status: :too_many_requests }

    # { role: "teacher" | "parent", name, email, phone, password }
    def register
      user = User.new(json_body.slice("role", "name", "email", "phone", "password"))
      User.transaction do
        user.save!
        EdumateData.setup_classroom!(user) if user.teacher?
      end
      render json: session_payload(user), status: :created
    end

    # { email, password }
    def login
      user = User.authenticate_by(email: json_body["email"].to_s.strip.downcase, password: json_body["password"].to_s)
      return render json: { error: "Email hoặc mật khẩu không đúng" }, status: :unauthorized unless user

      render json: session_payload(user)
    end

    def logout
      current_session.destroy!
      head :no_content
    end

    def me
      render json: { user: current_user.as_api_json }
    end

    private

    def session_payload(user)
      _session, token = AuthSession.start!(user, user_agent: request.user_agent)
      { token: token, user: user.as_api_json }
    end
  end
end
