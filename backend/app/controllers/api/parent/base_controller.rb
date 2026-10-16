module Api
  module Parent
    # Parents sign in per student (Api::Parent::SessionsController), not with a user account.
    class BaseController < ApplicationController
      skip_before_action :authenticate!
      before_action :authenticate_parent!

      private

      attr_reader :parent_session, :child

      # Expects "Authorization: Bearer <token>" issued by Api::Parent::SessionsController.
      def authenticate_parent!
        token = request.authorization.to_s[/\ABearer (.+)\z/, 1]
        @parent_session = ParentSession.find_by_token(token)
        @child = parent_session&.student
        render json: { error: "Unauthorized" }, status: :unauthorized unless child
      end

      # Records of the signed-in student in their teacher's classroom.
      def child_records(model)
        model.where(teacher_id: child.teacher_id, student_id: child.client_id).ordered
      end
    end
  end
end
