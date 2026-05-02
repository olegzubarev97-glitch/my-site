import pandas as pd
import mysql.connector
from mysql.connector import Error

# ── Config ──────────────────────────────────────────────────────
EXCEL_PATH = "/Users/olegzubarev/Desktop/FoodNutrion/рационы один файл.xlsx"
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "inbalance",
    "password": "inbalance_pass",
    "database": "inbalance",
}

# ration_id from DB (seeded order: SLIM=1, FIT=2, SPORT=3, MASS=4)
RATIONS = [
    {"id": 1, "name": "SLIM", "rows": (0, 33)},
    {"id": 2, "name": "FIT", "rows": (42, 77)},
    {"id": 3, "name": "SPORT", "rows": (87, 122)},
    {"id": 4, "name": "MASS", "rows": (130, 164)},
]

DAY_ORDER = {"Пн": 0, "Вт": 1, "Ср": 2, "Чт": 3, "Пт": 4, "Сб": 5, "Вс": 6}
DAY_ALIASES = {"ВТ": "Вт", "СР": "Ср", "пн": "Пн"}

MEAL_ORDER = {"Завтрак": 0, "Перекус": 1, "Обед": 2, "Ужин": 3}
MEAL_ALIASES = {"Доп": "Перекус", "перекус": "Перекус", "ужин": "Ужин"}


def normalize_day(day):
    if pd.isna(day):
        return None
    d = str(day).strip()
    d = DAY_ALIASES.get(d, d)
    return d if d in DAY_ORDER else None


def normalize_meal(meal):
    if pd.isna(meal):
        return None
    m = str(meal).strip()
    m = MEAL_ALIASES.get(m, m)
    return m if m in MEAL_ORDER else None


from datetime import datetime

def clean_weight(val):
    if pd.isna(val):
        return ""
    v = str(val).strip()
    if v.lower() in ["1 порц.", "1 порц"]:
        return "1 порц."
    # Remove trailing 'г' if present and return with it for consistency
    if v.endswith("г") and v[:-1].replace(".", "", 1).isdigit():
        return v
    if v.replace(".", "", 1).isdigit():
        return v + "г"
    return v


def clean_number(val):
    """Handle Excel auto-converted dates (e.g. 14 -> 2026-01-14)."""
    if pd.isna(val):
        return None
    if isinstance(val, datetime):
        return val.day
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def clean_name(name):
    if pd.isna(name):
        return ""
    return str(name).strip().replace("\n", " / ")


def main():
    df = pd.read_excel(EXCEL_PATH, sheet_name="Лист1")

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)

        # Clear existing menu data to avoid duplicates
        cursor.execute("DELETE FROM dailyMealDishes")
        cursor.execute("DELETE FROM dailyMeals")
        cursor.execute("DELETE FROM rationDays")
        cursor.execute("DELETE FROM dishes")
        conn.commit()

        dish_cache = {}  # name_lower -> dish_id

        for ration in RATIONS:
            ration_id = ration["id"]
            start, end = ration["rows"]
            subset = df.iloc[start : end + 1]

            print(f"\nImporting {ration['name']} (rows {start}-{end})...")

            # Track meals per day to assign sortOrder inside each day
            day_meal_counters = {}

            for _, row in subset.iterrows():
                day = normalize_day(row.get("День"))
                meal = normalize_meal(row.get("Прием пищи"))
                name = clean_name(row.get("Блюдо"))
                weight = clean_weight(row.get("Вес, г"))
                protein = clean_number(row.get("Белки")) or 0
                fat = clean_number(row.get("Жиры")) or 0
                carbs = clean_number(row.get("Углеводы")) or 0
                calories = clean_number(row.get("Ккал"))

                if not day or not meal or not name:
                    continue
                if calories is None:
                    continue

                # Ensure dish exists
                name_key = name.lower()
                if name_key not in dish_cache:
                    cursor.execute(
                        """
                        INSERT INTO dishes (name, calories, protein, fat, carbs, weight, isActive)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        """,
                        (name, int(calories), str(protein), str(fat), str(carbs), weight, True),
                    )
                    conn.commit()
                    dish_cache[name_key] = cursor.lastrowid
                    print(f"  Created dish: {name}")

                dish_id = dish_cache[name_key]

                # Ensure rationDay exists
                day_index = DAY_ORDER[day]
                cursor.execute(
                    "SELECT id FROM rationDays WHERE rationId = %s AND dayIndex = %s",
                    (ration_id, day_index),
                )
                day_row = cursor.fetchone()
                if day_row:
                    ration_day_id = day_row["id"]
                else:
                    cursor.execute(
                        "INSERT INTO rationDays (rationId, dayIndex, dayName) VALUES (%s, %s, %s)",
                        (ration_id, day_index, day),
                    )
                    conn.commit()
                    ration_day_id = cursor.lastrowid

                # Create dailyMeal for this occurrence
                meal_sort = MEAL_ORDER[meal]
                cursor.execute(
                    "INSERT INTO dailyMeals (rationDayId, mealType, sortOrder) VALUES (%s, %s, %s)",
                    (ration_day_id, meal, meal_sort),
                )
                conn.commit()
                daily_meal_id = cursor.lastrowid

                # Add dish to meal
                cursor.execute(
                    "SELECT MAX(sortOrder) as max_sort FROM dailyMealDishes WHERE dailyMealId = %s",
                    (daily_meal_id,),
                )
                max_sort = cursor.fetchone()["max_sort"]
                dish_sort = (max_sort or 0) + 1

                cursor.execute(
                    "INSERT INTO dailyMealDishes (dailyMealId, dishId, weight, sortOrder) VALUES (%s, %s, %s, %s)",
                    (daily_meal_id, dish_id, weight, dish_sort),
                )
                conn.commit()

        print("\n✅ Import complete!")
        print(f"Total unique dishes: {len(dish_cache)}")

    except Error as e:
        print(f"❌ Database error: {e}")
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


if __name__ == "__main__":
    main()
