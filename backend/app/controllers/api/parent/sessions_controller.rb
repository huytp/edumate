module Api
  module Parent
    class SessionsController < BaseController
      RATE_LIMIT_STORE = ActiveSupport::Cache::MemoryStore.new

      skip_before_action :authenticate_parent!, only: :create
      rate_limit to: 10, within: 1.minute, only: :create, store: RATE_LIMIT_STORE,
        with: -> { render json: { error: "Thử quá nhiều lần, vui lòng đợi một phút rồi thử lại" }, status: :too_many_requests }

      # { classCode, studentCode, password }: the class code comes from the link the teacher shares.
      def create
        teacher = User.find_by(role: "teacher", class_code: json_body["classCode"].to_s.strip.upcase)
        student = teacher&.students&.find_by(code: json_body["studentCode"].to_s.strip.upcase)
        unless student&.password.present? && ActiveSupport::SecurityUtils.secure_compare(student.password, json_body["password"].to_s.strip)
          return render json: { error: "Mã học sinh hoặc mật khẩu không đúng" }, status: :unauthorized
        end

        _session, token = ParentSession.start!(student, user_agent: request.user_agent)
        ParentLoginLog.prepend!(teacher, login_log_payload(student))
        render json: { token: token }, status: :created
      end

      def destroy
        parent_session.destroy!
        head :no_content
      end

      private

      def login_log_payload(student)
        {
          "studentId" => student.client_id,
          "studentName" => student.name,
          "parentName" => student.parent_name.presence || "Phụ huynh em #{student.name}",
          "loginTime" => Time.current.strftime("%Y-%m-%d %H:%M:%S"),
          "deviceInfo" => request.user_agent.to_s.include?("Mobile") ? "Điện thoại di động (Mobile)" : "Máy tính bàn / Laptop"
        }
      end
    end
  end
end
