module Api
  module Parent
    class MessagesController < BaseController
      # { content } — sender and student are taken from the session, not the payload.
      def create
        messages = ParentMessage.where(teacher_id: child.teacher_id)
        message = messages.new(
          client_id: "msg-#{(Time.current.to_f * 1000).to_i}-#{SecureRandom.hex(2)}",
          student_id: child.client_id,
          student_name: child.name,
          parent_name: current_user.name,
          parent_phone: current_user.phone.presence || child.parent_phone,
          content: json_body["content"].to_s.strip,
          date: Time.current.strftime("%Y-%m-%d %H:%M"),
          is_read: false,
          position: (messages.minimum(:position) || 0) - 1
        )
        return render json: { error: "Nội dung tin nhắn trống" }, status: :unprocessable_entity if message.content.blank?

        message.save!
        render json: message.as_api_json, status: :created
      end
    end
  end
end
