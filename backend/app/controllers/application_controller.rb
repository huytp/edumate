class ApplicationController < ActionController::API
  before_action :authenticate!

  rescue_from ActiveRecord::RecordNotFound do
    render json: { error: "Not found" }, status: :not_found
  end

  rescue_from ActiveRecord::RecordInvalid do |error|
    render json: { error: error.record.errors.full_messages.to_sentence, details: error.record.errors.to_hash }, status: :unprocessable_entity
  end

  rescue_from ActiveRecord::RecordNotUnique do
    render json: { error: "A record with this id already exists" }, status: :conflict
  end

  rescue_from JSON::ParserError do
    render json: { error: "Invalid JSON body" }, status: :bad_request
  end

  private

  attr_reader :current_user, :current_session

  # Expects "Authorization: Bearer <token>" issued by Api::AuthController.
  def authenticate!
    token = request.authorization.to_s[/\ABearer (.+)\z/, 1]
    @current_session = AuthSession.find_by_token(token)
    return render json: { error: "Unauthorized" }, status: :unauthorized unless @current_session

    @current_user = @current_session.user
  end

  def require_teacher!
    render json: { error: "Teacher account required" }, status: :forbidden unless current_user.teacher?
  end

  def require_parent!
    render json: { error: "Parent account required" }, status: :forbidden unless current_user.parent?
  end

  # Reads the raw JSON body so the camelCase payload reaches the models untouched.
  def json_body
    @json_body ||= request.raw_post.present? ? JSON.parse(request.raw_post) : {}
  end
end
