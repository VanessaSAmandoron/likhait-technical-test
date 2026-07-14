class MakePayerNameNullable < ActiveRecord::Migration[7.2]
  # The API does not collect payer_name (not in strong params, form, or JSON
  # output), yet the column was NOT NULL, which made expense creation impossible.
  # Relax the constraint so records can be created without a payer.
  def up
    change_column_null :expenses, :payer_name, true
  end

  def down
    change_column_null :expenses, :payer_name, false
  end
end
