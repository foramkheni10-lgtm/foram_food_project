
import json
import re

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.db_config import db


router = APIRouter(
    prefix="/api/ai-assistant",
    tags=["AI Food Assistant"]
)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.2:1b"


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)


# --------------------------------------------------
# 1. CHECK WHETHER THE MESSAGE IS FOOD-RELATED
# --------------------------------------------------

FOOD_KEYWORDS = [
    "food", "eat", "eating", "hungry", "meal", "breakfast",
    "lunch", "dinner", "snack", "snacks", "restaurant",
    "menu", "dish", "dishes", "cuisine", "order", "ordering",
    "pizza", "burger", "sandwich", "pasta", "biryani",
    "rice", "roti", "naan", "paneer", "chicken", "fish",
    "mutton", "fries", "tikka", "masala", "chole",
    "dessert", "sweet", "cake", "brownie", "ice cream",
    "drink", "drinks", "beverage", "juice", "lassi",
    "milkshake", "coffee", "tea", "soda", "cold drink",
    "spicy", "non spicy", "mild", "vegetarian", "non veg",
    "vegan", "healthy", "salad", "soup", "recommend",
    "recommendation", "suggest", "suggestion", "popular",
    "best food", "something to eat", "what should i eat"
]

NON_FOOD_KEYWORDS = [
    "clothes", "cloth", "jeans", "pants", "pant", "shirt",
    "tshirt", "t-shirt", "dress", "shoes", "sneakers",
    "fashion", "jacket", "trousers", "shorts", "skirt",
    "mobile", "phone", "laptop", "computer", "electronics",
    "furniture", "watch", "makeup", "cosmetics", "books",
    "school bag", "handbag", "car", "bike", "vehicle"
]


def is_food_related(message: str) -> bool:
    text = message.lower().strip()

    # Explicit unrelated shopping requests should be rejected.
    for word in NON_FOOD_KEYWORDS:
        if re.search(r"\b" + re.escape(word) + r"\b", text):
            return False

    # Accept clear food-related requests.
    for word in FOOD_KEYWORDS:
        if re.search(r"\b" + re.escape(word) + r"\b", text):
            return True

    # Do not generate food recommendations for unrelated messages.
    return False


# --------------------------------------------------
# 2. DETECT CUSTOMER FOOD PREFERENCES
# --------------------------------------------------

def detect_preferences(message: str):
    message = message.lower().replace("-", " ")

    non_spicy = any(word in message for word in [
        "non spicy", "not spicy", "mild",
        "less spicy", "no spice"
    ])

    non_vegetarian = any(word in message for word in [
        "non vegetarian", "non veg",
        "chicken", "fish", "mutton", "prawn"
    ])

    vegetarian = (
        not non_vegetarian
        and any(word in message for word in [
            "vegetarian", "veg food", "pure veg",
            "vegetarian food", "non meat"
        ])
    )

    return {
        "spicy": (
            not non_spicy
            and any(word in message for word in [
                "spicy", "hot food", "peri peri"
            ])
        ),
        "non_spicy": non_spicy,
        "dessert": any(word in message for word in [
            "dessert", "sweet", "ice cream", "chocolate",
            "brownie", "cake", "gulab jamun"
        ]),
        "drinks": any(word in message for word in [
            "cold drink", "cold drinks", "drink", "drinks",
            "beverage", "beverages", "juice", "soft drink",
            "lassi", "milkshake", "mojito"
        ]),
        "vegetarian": vegetarian,
        "non_vegetarian": non_vegetarian,
        "popular": any(word in message for word in [
            "popular", "best", "famous", "top rated"
        ])
    }
    message = message.lower().replace("-", " ")

    non_spicy = any(word in message for word in [
        "non spicy", "not spicy", "mild",
        "less spicy", "no spice"
    ])

    return {
        "spicy": (
            not non_spicy
            and any(word in message for word in [
                "spicy", "hot food", "peri peri"
            ])
        ),

        "non_spicy": non_spicy,

        "dessert": any(word in message for word in [
            "dessert", "sweet", "ice cream", "chocolate",
            "brownie", "cake", "gulab jamun"
        ]),

        "drinks": any(word in message for word in [
            "cold drink", "cold drinks", "drink", "drinks",
            "beverage", "beverages", "juice", "soft drink",
            "lassi", "milkshake", "mojito"
        ]),

        "vegetarian": any(word in message for word in [
            "vegetarian", "veg food", "pure veg",
            "vegetarian food", "non meat"
        ]),

        "non_vegetarian": any(word in message for word in [
            "non vegetarian", "non veg",
            "chicken", "fish", "mutton", "prawn"
        ]),

        "popular": any(word in message for word in [
            "popular", "best", "famous", "top rated"
        ])
    }

# --------------------------------------------------
# 3. EXTRACT CUSTOMER BUDGET
# --------------------------------------------------

def extract_budget(message: str):
    message = message.lower()

    patterns = [
        r"(?:under|below|less than|within|max(?:imum)?|budget(?: of)?|upto|up to)\s*(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?)",
        r"₹\s*(\d+(?:\.\d+)?)",
        r"(\d+(?:\.\d+)?)\s*(?:rupees|rs\.?)\b"
    ]

    for pattern in patterns:
        match = re.search(pattern, message)

        if match:
            return float(match.group(1))

    return None


# --------------------------------------------------
# 4. EXTRACT NUMBER OF PEOPLE
# --------------------------------------------------

def extract_people_count(message: str):
    message = message.lower()

    patterns = [
        r"for\s+(\d+)\s+people",
        r"for\s+(\d+)\s+persons?",
        r"for\s+(\d+)\s+of\s+us"
    ]

    for pattern in patterns:
        match = re.search(pattern, message)

        if match:
            return int(match.group(1))

    return 1


# --------------------------------------------------
# 5. FOOD CLASSIFICATION HELPERS
# --------------------------------------------------

def is_spicy(food):
    description = str(food.get("description") or "").lower()
    name = str(food.get("name") or "").lower()
    spice_level = str(food.get("spice_level") or "").lower().strip()

    if is_drink(food) or is_dessert(food):
        return False

    spicy_keywords = [
        "spicy", "peri peri", "chilli", "chili",
        "schezwan", "vindaloo", "hot and spicy",
        "spiced", "masala", "tikka"
    ]

    if spice_level in ["medium", "high", "spicy", "hot"]:
        return True

    return any(
        word in name or word in description
        for word in spicy_keywords
    )

    description = str(food.get("description") or "").lower()
    name = str(food.get("name") or "").lower()
    spice_level = str(food.get("spice_level") or "").lower().strip()

    # Drinks and desserts should never be recommended as spicy meals.
    if is_drink(food) or is_dessert(food):
        return False

    spicy_keywords = [
        "spicy", "peri peri", "chilli", "chili",
        "schezwan", "vindaloo", "jalapeno"
    ]

    return (
        spice_level in ["medium", "high", "spicy", "hot"]
        or any(word in name or word in description
               for word in spicy_keywords)
    )

def is_dessert(food):
    name = str(food.get("name") or "").lower()
    category = str(food.get("category") or "").lower()

    dessert_keywords = [
        "brownie", "cake", "ice cream", "gulab jamun",
        "rasgulla", "kheer", "pudding", "pastry",
        "chocolate", "dessert", "sweet"
    ]

    return (
        category in ["dessert", "desserts"]
        or any(word in name for word in dessert_keywords)
    )


def is_drink(food):
    name = str(
        food.get("name") or food.get("food_name") or ""
    ).lower().strip()

    category = str(
        food.get("category") or ""
    ).lower().strip()

    drink_categories = [
        "drink", "drinks",
        "beverage", "beverages",
        "cold drink", "cold drinks"
    ]

    drink_keywords = [
        "juice", "coke", "coca cola", "pepsi",
        "sprite", "limca", "lemonade", "lassi",
        "milkshake", "mojito", "iced tea",
        "water", "soda", "coffee", "tea"
    ]

    non_drink_keywords = [
        "burger", "pizza", "sandwich", "biryani",
        "paneer", "fries", "pasta", "chole",
        "brownie", "cake", "dessert"
    ]

    if any(word in name for word in non_drink_keywords):
        return False

    return (
        category in drink_categories
        or any(word in name for word in drink_keywords)
    )
    name = str(
        food.get("name") or food.get("food_name") or ""
    ).lower().strip()

    category = str(
        food.get("category") or ""
    ).lower().strip()

    drink_categories = [
        "drink", "drinks",
        "beverage", "beverages",
        "cold drink", "cold drinks"
    ]

    drink_keywords = [
        "juice", "coke", "coca cola", "pepsi",
        "sprite", "limca", "lemonade", "lassi",
        "milkshake", "mojito", "iced tea",
        "water", "soda", "coffee", "tea"
    ]

    if category in drink_categories:
        return True

    return any(
        word in name
        for word in drink_keywords
    )

    name = str(food.get("name") or "").lower().strip()
    category = str(food.get("category") or "").lower().strip()

    drink_categories = [
        "drink", "drinks", "beverage", "beverages",
        "cold drink", "cold drinks"
    ]

    drink_keywords = [
        "juice", "coke", "coca cola", "pepsi",
        "sprite", "limca", "lemonade", "lassi",
        "milkshake", "mojito", "iced tea",
        "water", "soda", "coffee", "tea"
    ]

    return (
        category in drink_categories
        or any(word in name for word in drink_keywords)
    )
    name = str(food.get("name") or "").lower()
    category = str(food.get("category") or "").lower()

    drink_keywords = [
        "juice", "cold drink", "soft drink", "coke",
        "pepsi", "sprite", "limca", "lemonade",
        "lassi", "milkshake", "mojito", "iced tea",
        "water", "soda", "coffee", "tea"
    ]

    non_drink_keywords = [
        "brownie", "cake", "ice cream", "burger",
        "pizza", "sandwich", "biryani", "paneer",
        "fries", "pasta", "chole", "dessert"
    ]

    return (
        (
            category in ["drink", "drinks", "beverage", "beverages"]
            or any(word in name for word in drink_keywords)
        )
        and not any(word in name for word in non_drink_keywords)
    )


def is_vegetarian(food):
    category = str(food.get("category") or "").lower()
    name = str(food.get("name") or "").lower()
    description = str(food.get("description") or "").lower()

    non_veg_keywords = [
        "chicken", "mutton", "fish", "egg",
        "prawn", "meat", "non veg"
    ]

    if category in ["non veg", "non-veg", "non vegetarian"]:
        return False

    return not any(
        word in name or word in description
        for word in non_veg_keywords
    )


def get_food_price(food):
    try:
        return float(food.get("price"))
    except (TypeError, ValueError):
        return None


# --------------------------------------------------
# 6. AI FOOD ASSISTANT API
# --------------------------------------------------

@router.post("/chat")
async def chat_with_food_assistant(request: ChatRequest):

    try:
        customer_message = request.message.strip()

        if not customer_message:
            raise HTTPException(
                status_code=400,
                detail="Please enter your food preference."
            )

        # STEP 1: Reject unrelated requests BEFORE AI recommendations.

        if not is_food_related(customer_message):
            return {
                "reply": (
                    "I'm your Smart FoodCourt AI assistant. "
                    "I can help you discover delicious food, "
                    "spicy dishes, desserts, cold drinks and "
                    "restaurant recommendations. "
                    "What would you like to eat today?"
                ),
                "recommendations": [],
                "budget": None,
                "people_count": 1
            }

        # STEP 2: Read actual available food records from MongoDB.

        foods = list(db.foods.find())

        if not foods:
            return {
                "reply": "Sorry, there are no food items available right now.",
                "recommendations": [],
                "budget": None,
                "people_count": 1
            }

        menu = []

        for food in foods:

            name = food.get("name") or food.get("food_name")

            if not name:
                continue

            if food.get("available") is False:
                continue

            if food.get("availability") is False:
                continue

            menu.append({
                "id": str(food["_id"]),
                "name": name,
                "description": food.get("description", ""),
                "category": food.get("category", ""),
                "price": food.get("price"),
                "spice_level": food.get("spice_level")
            })

        if not menu:
            return {
                "reply": "No available food items were found.",
                "recommendations": [],
                "budget": None,
                "people_count": 1
            }

        # STEP 3: Detect preferences, budget and people count.

        preferences = detect_preferences(customer_message)

        budget = extract_budget(customer_message)

        people_count = extract_people_count(customer_message)

        # STEP 4: Ask Ollama to understand the food request.

        prompt = f"""
You are the Smart FoodCourt AI food assistant.

The customer is asking for food recommendations.

Customer message:
{customer_message}

Available MongoDB food menu:
{json.dumps(menu, ensure_ascii=False)}

Instructions:
1. Recommend only items from the provided menu.
2. Never invent food names or prices.
3. Respect the customer's preferences and budget.
4. Consider all parts of the customer's request.
5. Return valid JSON only.

Expected JSON:
{{
    "reply": "Friendly response",
    "recommended_ids": ["actual_menu_id"]
}}
"""

        # STEP 5: Get AI response from local Ollama.

        async with httpx.AsyncClient(timeout=120.0) as client:

            response = await client.post(
                OLLAMA_URL,
                json={
                    "model": MODEL_NAME,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json"
                }
            )

            response.raise_for_status()

            ai_result = response.json()

        result = json.loads(ai_result["response"])

        recommended_ids = result.get("recommended_ids", [])

        if not isinstance(recommended_ids, list):
            recommended_ids = []

              # STEP 6: Filter actual food recommendations.

        recommended_foods = []

        has_special_preference = any([
            preferences["spicy"],
            preferences["non_spicy"],
            preferences["dessert"],
            preferences["drinks"],
            preferences["vegetarian"],
            preferences["non_vegetarian"]
        ])

        # DRINKS
        if preferences["drinks"]:
            recommended_foods = [
                food for food in menu
                if is_drink(food)
            ]

        # OTHER SPECIAL PREFERENCES
        else:

            if preferences["spicy"]:
                recommended_foods.extend([
                    food for food in menu
                    if is_spicy(food)
                ])

            if preferences["non_spicy"]:
                recommended_foods.extend([
                    food for food in menu
                    if not is_spicy(food)
                    and not is_dessert(food)
                    and not is_drink(food)
                ])

            if preferences["dessert"]:
                recommended_foods.extend([
                    food for food in menu
                    if is_dessert(food)
                ])

            if preferences["vegetarian"]:
                recommended_foods.extend([
                    food for food in menu
                    if is_vegetarian(food)
                    and not is_drink(food)
                ])

            if preferences["non_vegetarian"]:
                recommended_foods.extend([
                    food for food in menu
                    if not is_vegetarian(food)
                    and not is_drink(food)
                ])

            # NORMAL AI RECOMMENDATIONS
            if not has_special_preference:
                recommended_foods = [
                    food for food in menu
                    if food["id"] in recommended_ids
                ]
        # STEP 7: Apply customer's budget.

        if budget is not None:
            recommended_foods = [
                food for food in recommended_foods
                if get_food_price(food) is not None
                and get_food_price(food) <= budget
            ]

        # STEP 8: Remove duplicate recommendations.

                # STEP 8: Remove duplicate food names.

        unique_foods = {}

        for food in recommended_foods:
            normalized_name = re.sub(
                r"\s+",
                " ",
                food["name"].strip().lower()
            )

            if normalized_name not in unique_foods:
                unique_foods[normalized_name] = food

        recommended_foods = list(unique_foods.values())

        # STEP 9: Build a conversational response.

        preference_names = []

        if preferences["spicy"]:
            preference_names.append("spicy food")

        if preferences["non_spicy"]:
            preference_names.append("non-spicy food")

        if preferences["dessert"]:
            preference_names.append("desserts")

        if preferences["drinks"]:
            preference_names.append("cold drinks")

        if preferences["vegetarian"]:
            preference_names.append("vegetarian food")

        if preferences["non_vegetarian"]:
            preference_names.append("non-vegetarian food")

        if preferences["popular"]:
            preference_names.append("popular food")

        if budget is not None:
            preference_names.append(f"within ₹{budget:g} per item")

        if people_count > 1:
            preference_names.append(f"for {people_count} people")

        if recommended_foods:

            if preference_names:
                reply = (
                    "Here are some recommendations for "
                    + ", ".join(preference_names)
                    + " from our Smart FoodCourt menu!"
                )
            else:
                reply = result.get(
                    "reply",
                    "Here are some recommendations from our menu!"
                )

        else:
            reply = (
                "Sorry, I couldn't find suitable available food "
                "matching your requirements. Try changing your "
                "preferences or budget."
            )

        # STEP 10: Return recommendations to React frontend.

        return {
            "reply": reply,
            "recommendations": recommended_foods,
            "budget": budget,
            "people_count": people_count
        }

    except HTTPException:
        raise

    except httpx.RequestError as error:

        print("Ollama Connection Error:", error)

        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to connect to the local Ollama AI model. "
                "Please check whether Ollama is running."
            )
        )

    except Exception as error:

        print("AI Assistant Error:", error)

        raise HTTPException(
            status_code=500,
            detail="Something went wrong with the AI assistant."
        )
