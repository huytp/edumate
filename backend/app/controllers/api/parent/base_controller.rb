module Api
  module Parent
    class BaseController < ApplicationController
      before_action :require_parent!

      private

      def child
        @child ||= current_user.children.includes(:teacher).find(params[:child_id] || params[:id])
      end

      # Records of one student in their teacher's classroom.
      def child_records(model)
        model.where(teacher_id: child.teacher_id, student_id: child.client_id).ordered
      end
    end
  end
end
