# Parents no longer have accounts: they sign in from the class link with the student's code and password.
class CreateParentSessions < ActiveRecord::Migration[8.0]
  def change
    create_table :parent_sessions do |t|
      t.references :teacher, null: false, foreign_key: { to_table: :users, on_delete: :cascade }
      # Students are re-created on import, so the session points at the stable client id.
      t.string :student_client_id, limit: 64, null: false
      t.string :token_digest, null: false
      t.datetime :expires_at, null: false
      t.string :user_agent
      t.timestamps
    end
    add_index :parent_sessions, :token_digest, unique: true

    drop_table :parent_links do |t|
      t.references :parent, null: false, foreign_key: { to_table: :users, on_delete: :cascade }
      t.references :student, null: false, foreign_key: { on_delete: :cascade }
      t.timestamps
      t.index [:parent_id, :student_id], unique: true
    end
  end
end
