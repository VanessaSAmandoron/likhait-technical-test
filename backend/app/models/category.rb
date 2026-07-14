class Category < ApplicationRecord
  has_many :expenses, dependent: :restrict_with_error

  validates :name,
            presence: true,
            length: { maximum: 100 },
            uniqueness: { case_sensitive: false }
  validates :emoji, length: { maximum: 16 }, allow_nil: true

  before_validation :normalize_name

  private

  def normalize_name
    self.name = name.strip if name.is_a?(String)
    self.emoji = emoji.strip.presence if emoji.is_a?(String)
  end
end
