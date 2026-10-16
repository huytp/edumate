Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    post "auth/register", to: "auth#register"
    post "auth/login", to: "auth#login"
    delete "auth/logout", to: "auth#logout"
    get "auth/me", to: "auth#me"

    # Teacher: their own classroom
    get "data", to: "data#show"
    post "data/import", to: "data#import"
    post "data/reset", to: "data#reset"

    resource :settings, only: %i[show update]

    %i[
      students attendance_records point_histories reward_items reward_redemptions
      daily_comments semester_results interactive_games music_items parent_messages parent_login_logs
    ].each do |name|
      resources name, only: %i[index show create update destroy] do
        post :batch, on: :collection
      end
    end

    # Parent: linked children only
    namespace :parent do
      resources :children, only: %i[index show create destroy] do
        resources :messages, only: :create
      end
    end
  end
end
