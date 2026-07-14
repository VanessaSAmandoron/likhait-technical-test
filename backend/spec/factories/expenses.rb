FactoryBot.define do
  factory :expense do
    description { "MyString" }
    amount { "9.99" }
    association :category
    payer_name { "MyString" }
    date { Date.current }
  end
end
