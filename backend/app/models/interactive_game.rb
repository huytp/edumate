class InteractiveGame < ListRecord
  CATEGORIES = %w[english_vocab math_blitz trivia external].freeze

  has_many :quiz_questions, -> { order(:position) }, dependent: :delete_all

  validates :title, presence: true
  validates :category, inclusion: { in: CATEGORIES }

  def as_api_json
    json = super
    json["questions"] = quiz_questions.map(&:as_api_json) if quiz_questions.any?
    json
  end

  # Questions are stored in their own table but edited as part of the game.
  def assign_api_attributes(payload)
    super
    @pending_questions = Array(payload["questions"])
    self
  end

  after_save :replace_questions, if: -> { defined?(@pending_questions) && !@pending_questions.nil? }

  private

  def replace_questions
    quiz_questions.delete_all
    @pending_questions.each_with_index do |question, index|
      quiz_questions.build.assign_api_attributes(question).tap { |q| q.position = index }.save!
    end
    @pending_questions = nil
    quiz_questions.reset
  end
end
