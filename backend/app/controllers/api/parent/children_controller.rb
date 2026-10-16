module Api
  module Parent
    class ChildrenController < BaseController
      RATE_LIMIT_STORE = ActiveSupport::Cache::MemoryStore.new

      rate_limit to: 10, within: 1.minute, only: :create, store: RATE_LIMIT_STORE,
        with: -> { render json: { error: "Too many attempts, please try again later" }, status: :too_many_requests }

      def index
        render json: current_user.children.includes(teacher: :app_setting).map { |student| summary(student) }
      end

      # Links a child: { classCode, studentCode, password } as handed out by the teacher.
      def create
        teacher = User.find_by(role: "teacher", class_code: json_body["classCode"].to_s.strip.upcase)
        student = teacher&.students&.find_by(code: json_body["studentCode"].to_s.strip.upcase)
        unless student&.password.present? && ActiveSupport::SecurityUtils.secure_compare(student.password, json_body["password"].to_s.strip)
          return render json: { error: "Mã lớp, mã học sinh hoặc mật khẩu không đúng" }, status: :unprocessable_entity
        end

        ParentLink.find_or_create_by!(parent: current_user, student: student)
        render json: summary(student), status: :created
      end

      # Everything the parent portal shows for one child; teacher-only comments are excluded.
      def show
        ParentLoginLog.prepend!(child.teacher, login_log_payload)

        render json: {
          settings: child.teacher.settings.as_parent_json,
          student: child.as_parent_json,
          attendance: child_records(AttendanceRecord).map(&:as_api_json),
          comments: child_records(DailyComment).where(is_private_to_teacher: [ false, nil ]).map(&:as_api_json),
          semesterResults: child_records(SemesterResult).map(&:as_api_json),
          pointsHistory: child_records(PointHistory).map(&:as_api_json),
          redemptions: child_records(RewardRedemption).map(&:as_api_json),
          messages: child_records(ParentMessage).map(&:as_api_json)
        }
      end

      def destroy
        current_user.parent_links.find_by!(student: child).destroy!
        head :no_content
      end

      private

      def summary(student)
        settings = student.teacher.settings
        { id: student.id, name: student.name, code: student.code, avatar: student.avatar,
          className: settings.class_name, schoolName: settings.school_name, teacherName: settings.teacher_name }.compact
      end

      def login_log_payload
        {
          "studentId" => child.client_id,
          "studentName" => child.name,
          "parentName" => current_user.name,
          "loginTime" => Time.current.strftime("%Y-%m-%d %H:%M:%S"),
          "deviceInfo" => request.user_agent.to_s.include?("Mobile") ? "Điện thoại di động (Mobile)" : "Máy tính bàn / Laptop"
        }
      end
    end
  end
end
