# This migration comes from sessions (originally 20141013140604)
class CreateSessionsSurveyValues < ActiveRecord::Migration[4.2]
  def change
    create_table :sessions_survey_values do |t|
      t.text :value
      t.integer :survey_field_id
      t.integer :user_id
      t.integer :user_survey_id

      t.index :user_survey_id
      t.index [:survey_field_id, :user_survey_id], name: :isurvey_field_and_user
    end
  end
end
