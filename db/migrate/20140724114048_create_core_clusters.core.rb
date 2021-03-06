# This migration comes from core (originally 20140721095500)
class CreateCoreClusters < ActiveRecord::Migration[4.2]
  def change
    create_table :core_clusters do |t|
      t.string   "name",        null: false
      t.string   "host",        null: false
      t.text     "description"
      t.text     "public_key",  null: false
      t.text     "private_key", null: false
      t.string   "admin_login", null: false
      t.timestamps

      t.index :public_key, unique: true
      t.index :private_key, unique: true
    end
  end
end
