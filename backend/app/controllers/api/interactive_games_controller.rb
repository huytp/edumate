module Api
  class InteractiveGamesController < RecordsController
    self.model = InteractiveGame

    private

    def scope
      super.includes(:quiz_questions)
    end
  end
end
