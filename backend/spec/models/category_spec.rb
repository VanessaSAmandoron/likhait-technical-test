require 'rails_helper'

RSpec.describe Category, type: :model do
  describe "validations" do
    it "is valid with a name" do
      expect(Category.new(name: "Food")).to be_valid
    end

    it "is invalid without a name" do
      category = Category.new(name: nil)
      expect(category).not_to be_valid
      expect(category.errors[:name]).to include("can't be blank")
    end

    it "is invalid with a blank name" do
      category = Category.new(name: "   ")
      expect(category).not_to be_valid
      expect(category.errors[:name]).to include("can't be blank")
    end

    it "is invalid when the name exceeds 100 characters" do
      category = Category.new(name: "a" * 101)
      expect(category).not_to be_valid
      expect(category.errors[:name]).to include("is too long (maximum is 100 characters)")
    end

    it "is invalid with a duplicate name" do
      Category.create!(name: "Food")
      category = Category.new(name: "Food")
      expect(category).not_to be_valid
      expect(category.errors[:name]).to include("has already been taken")
    end

    it "is invalid with a case-insensitive duplicate name" do
      Category.create!(name: "Food")
      category = Category.new(name: "food")
      expect(category).not_to be_valid
      expect(category.errors[:name]).to include("has already been taken")
    end
  end

  describe "name normalization" do
    it "strips surrounding whitespace before validation" do
      category = Category.create!(name: "  Groceries  ")
      expect(category.name).to eq("Groceries")
    end
  end

  describe "emoji" do
    it "is valid with an emoji" do
      expect(Category.new(name: "Groceries", emoji: "🥑")).to be_valid
    end

    it "is valid without an emoji" do
      expect(Category.new(name: "Groceries", emoji: nil)).to be_valid
    end

    it "stores a blank emoji as nil" do
      category = Category.create!(name: "Groceries", emoji: "  ")
      expect(category.emoji).to be_nil
    end
  end

  describe "associations" do
    it "prevents destruction when dependent expenses exist" do
      category = Category.create!(name: "Food")
      Expense.create!(description: "Lunch", amount: 10.0, category: category, date: Date.today)

      expect { category.destroy }.not_to change(Category, :count)
      expect(category.errors[:base]).to be_present
    end

    it "can be destroyed when it has no expenses" do
      category = Category.create!(name: "Food")

      expect { category.destroy }.to change(Category, :count).by(-1)
    end
  end
end
