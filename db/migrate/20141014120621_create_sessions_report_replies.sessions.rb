# This migration comes from sessions (originally 20141013141511)
class CreateSessionsReportReplies < ActiveRecord::Migration[4.2]
  def change
    create_table :sessions_report_replies do |t|
      t.integer :report_id
      t.integer :user_id
      t.text :message
      t.timestamps

      t.index :report_id
    end
  end
end
