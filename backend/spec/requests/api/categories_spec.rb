require 'rails_helper'

RSpec.describe "Api::Categories", type: :request do
  describe "GET /api/categories" do
    let!(:food) { Category.create!(name: "Food") }
    let!(:transport) { Category.create!(name: "Transport") }
    let!(:supplies) { Category.create!(name: "Supplies") }

    it "returns all categories" do
      get "/api/categories"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(3)
      expect(json.map { |c| c["name"] }).to include("Food", "Transport", "Supplies")
    end

    it "returns categories in alphabetical order" do
      get "/api/categories"

      json = JSON.parse(response.body)
      expect(json.map { |c| c["name"] }).to eq([ "Food", "Supplies", "Transport" ])
    end
  end

  describe "POST /api/categories" do
    context "with valid parameters" do
      let(:valid_params) { { category: { name: "Groceries" } } }

      it "creates a new category" do
        expect {
          post "/api/categories", params: valid_params, as: :json
        }.to change(Category, :count).by(1)

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json["name"]).to eq("Groceries")
        expect(json["id"]).to be_present
      end

      it "strips surrounding whitespace from the name" do
        post "/api/categories", params: { category: { name: "  Groceries  " } }, as: :json

        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)["name"]).to eq("Groceries")
      end

      it "persists an optional emoji" do
        post "/api/categories", params: { category: { name: "Groceries", emoji: "🥑" } }, as: :json

        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)["emoji"]).to eq("🥑")
      end
    end

    context "with invalid parameters" do
      it "rejects a blank name" do
        expect {
          post "/api/categories", params: { category: { name: "" } }, as: :json
        }.not_to change(Category, :count)

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)["errors"]).to include("Name can't be blank")
      end

      it "rejects a duplicate name" do
        Category.create!(name: "Food")

        expect {
          post "/api/categories", params: { category: { name: "Food" } }, as: :json
        }.not_to change(Category, :count)

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)["errors"]).to include("Name has already been taken")
      end

      it "rejects a case-insensitive duplicate name" do
        Category.create!(name: "Food")

        expect {
          post "/api/categories", params: { category: { name: "food" } }, as: :json
        }.not_to change(Category, :count)

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "PATCH /api/categories/:id" do
    let!(:category) { Category.create!(name: "Food", emoji: "🍔") }

    context "with valid parameters" do
      it "updates the name and emoji" do
        patch "/api/categories/#{category.id}",
              params: { category: { name: "Groceries", emoji: "🥑" } }, as: :json

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json["name"]).to eq("Groceries")
        expect(json["emoji"]).to eq("🥑")
        expect(category.reload.name).to eq("Groceries")
      end
    end

    context "with invalid parameters" do
      it "rejects a blank name" do
        patch "/api/categories/#{category.id}",
              params: { category: { name: "" } }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        expect(category.reload.name).to eq("Food")
      end

      it "rejects a duplicate name" do
        Category.create!(name: "Transport")

        patch "/api/categories/#{category.id}",
              params: { category: { name: "Transport" } }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "DELETE /api/categories/:id" do
    it "deletes a category without expenses" do
      category = Category.create!(name: "Food")

      expect {
        delete "/api/categories/#{category.id}"
      }.to change(Category, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "refuses to delete a category that has expenses" do
      category = Category.create!(name: "Food")
      Expense.create!(description: "Lunch", amount: 10.0, category: category, date: Date.today)

      expect {
        delete "/api/categories/#{category.id}"
      }.not_to change(Category, :count)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)["errors"]).to be_present
    end
  end
end
