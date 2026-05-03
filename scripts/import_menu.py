import pandas as pd
import mysql.connector
from mysql.connector import Error
from datetime import datetime

# ── Config ──────────────────────────────────────────────────────
EXCEL_PATH = "/Users/olegzubarev/Desktop/FoodNutrion/рационы один файл.xlsx"
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "inbalance",
    "password": "inbalance_pass",
    "database": "inbalance",
}

# Block definitions: (start_row, end_row, price_row, name, slug, calories, description, targetAudience)
RATIONS_DEF = [
    (0, 31, 34, "BALANCE 1200", "balance-1200", 1200,
     "Низкокалорийный рацион для похудения и детокса. Легкие блюда, богатые белком.",
     "Для тех, кто хочет сбросить вес и подтянуть фигуру."),
    (37, 71, 74, "BALANCE 1500", "balance-1500", 1500,
     "Сбалансированный рацион для комфортного снижения веса. Оптимальное соотношение КБЖУ.",
     "Для активных людей, которые хотят похудеть без голода."),
    (76, 113, 116, "BALANCE 1800", "balance-1800", 1800,
     "Рацион для поддержания формы и здорового образа жизни. Полноценное питание с достаточной калорийностью.",
     "Для тех, кто ведет активный образ жизни и занимается спортом."),
    (119, 155, 158, "BALANCE 2000", "balance-2000", 2000,
     "Рацион для поддержания веса и высокой активности. Максимум энергии для тренировок и работы.",
     "Для спортсменов и людей с высокой физической нагрузкой."),
    (161, 197, 200, "BALANCE 2500", "balance-2500", 2500,
     "Высококалорийный рацион для набора мышечной массы. Богатый белком и сложными углеводами.",
     "Для хардгейнеров и бодибилдеров в период набора массы."),
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


def clean_weight(val):
    if pd.isna(val):
        return ""
    v = str(val).strip()
    if v.lower() in ["1 порц.", "1 порц"]:
        return "1 порц."
    if v.endswith("г") and v[:-1].replace(".", "", 1).isdigit():
        return v
    if v.replace(".", "", 1).isdigit():
        return v + "г"
    return v


def clean_name(name):
    if pd.isna(name):
        return ""
    return str(name).strip().replace("\n", " / ")


def clean_number(val):
    if pd.isna(val):
        return None
    if isinstance(val, datetime):
        return val.day
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def parse_prices(row):
    """Extract prices for 1, 3, 5, 7, 14 days from price row."""
    prices = []
    for i in range(5):
        val = row[i] if i < len(row) else None
        if val and "р" in str(val):
            try:
                prices.append(int(str(val).replace("р", "").replace(" ", "").strip()))
            except ValueError:
                prices.append(None)
        else:
            prices.append(None)
    return prices


def main():
    df = pd.read_excel(EXCEL_PATH, sheet_name="Лист1")

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)

        # Clear everything
        cursor.execute("DELETE FROM dailyMealDishes")
        cursor.execute("DELETE FROM dailyMeals")
        cursor.execute("DELETE FROM rationDays")
        cursor.execute("DELETE FROM dishes")
        cursor.execute("DELETE FROM rations")
        conn.commit()

        dish_cache = {}  # name_lower -> dish_id

        for idx, (start, end, price_row, name, slug, calories, description, target) in enumerate(RATIONS_DEF):
            ration_id = idx + 1
            sort_order = idx + 1

            # Parse prices
            price_data = df.iloc[price_row]
            prices = parse_prices(price_data.tolist())
            price1 = prices[0] or 0
            price3 = prices[1] or 0
            price5 = prices[2] or 0
            price7 = prices[3] or 0
            price14 = prices[4] or 0

            # Use declared calories from definition
            avg_kcal = calories

            subset = df.iloc[start : end + 1]

            # Calculate average daily macros from Excel data
            day_macros = {}
            for _, row in subset.iterrows():
                day = normalize_day(row.get("День"))
                protein = clean_number(row.get("Белки")) or 0
                fat = clean_number(row.get("Жиры")) or 0
                carbs = clean_number(row.get("Углеводы")) or 0
                kcal = clean_number(row.get("Ккал"))
                # Sanity check: fix obvious Excel typos where carbs are 10x+ too high
                if carbs > 150 and kcal and kcal > 0:
                    calc_carbs = (kcal - protein * 4 - fat * 9) / 4
                    if calc_carbs > 0:
                        carbs = round(calc_carbs, 1)
                if day:
                    if day not in day_macros:
                        day_macros[day] = [0.0, 0.0, 0.0]
                    day_macros[day][0] += protein
                    day_macros[day][1] += fat
                    day_macros[day][2] += carbs
            avg_protein = round(sum(v[0] for v in day_macros.values()) / max(len(day_macros), 1), 1)
            avg_fat = round(sum(v[1] for v in day_macros.values()) / max(len(day_macros), 1), 1)
            avg_carbs = round(sum(v[2] for v in day_macros.values()) / max(len(day_macros), 1), 1)

            # Insert ration
            cursor.execute(
                """
                INSERT INTO rations (id, name, slug, calories, protein, fat, carbs,
                    price1Day, price5Days, price7Days, price14Days,
                    description, targetAudience, sortOrder, isActive)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (ration_id, name, slug, avg_kcal, str(avg_protein), str(avg_fat), str(avg_carbs),
                 price1, price5, price7, price14,
                 description, target, sort_order, True),
            )
            conn.commit()

            print(f"\nImporting {name} (rows {start}-{end})...")

            for _, row in subset.iterrows():
                day = normalize_day(row.get("День"))
                meal = normalize_meal(row.get("Прием пищи"))
                dish_name = clean_name(row.get("Блюдо"))
                weight = clean_weight(row.get("Вес, г"))
                protein = clean_number(row.get("Белки")) or 0
                fat = clean_number(row.get("Жиры")) or 0
                carbs = clean_number(row.get("Углеводы")) or 0
                kcal = clean_number(row.get("Ккал"))

                if not day or not meal or not dish_name:
                    continue
                if kcal is None:
                    continue

                # Sanity check: fix obvious Excel typos where carbs are 10x+ too high
                if carbs > 150 and kcal > 0:
                    calc_carbs = (kcal - protein * 4 - fat * 9) / 4
                    if calc_carbs > 0:
                        carbs = round(calc_carbs, 1)

                # Ensure dish exists
                name_key = dish_name.lower()
                if name_key not in dish_cache:
                    cursor.execute(
                        """
                        INSERT INTO dishes (name, calories, protein, fat, carbs, weight, isActive)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        """,
                        (dish_name, int(kcal), str(protein), str(fat), str(carbs), weight, True),
                    )
                    conn.commit()
                    dish_cache[name_key] = cursor.lastrowid

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

                # Create dailyMeal
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
