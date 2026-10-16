module Api
  module Parent
    class ChildrenController < BaseController
      # Everything the parent portal shows for the signed-in student; teacher-only comments are excluded.
      def show
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
    end
  end
end
