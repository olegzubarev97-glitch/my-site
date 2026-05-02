import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Flame, ChefHat, Loader2 } from "lucide-react";

const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MEAL_LABELS: Record<string, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack1: "Перекус 1",
  snack2: "Перекус 2",
};

interface RationMenuDialogProps {
  slug: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function calcCalories(caloriesPer100g: number, weight: number) {
  return Math.round((caloriesPer100g * weight) / 100);
}

export function RationMenuDialog({ slug, open, onOpenChange }: RationMenuDialogProps) {
  const { data, isLoading } = trpc.ration.getBySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug && open }
  );
  const [activeDay, setActiveDay] = useState(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-[#6B7B5E]" />
            Меню рациона
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#6B7B5E]" />
          </div>
        )}

        {!isLoading && data && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              {data.imageUrl && (
                <img
                  src={data.imageUrl}
                  alt={data.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
              )}
              <div>
                <h3 className="text-lg font-semibold text-[#1E1E1E]">{data.name}</h3>
                <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                  <Flame className="w-4 h-4 text-[#E07B3A]" />
                  {data.calories} ккал / день
                </div>
              </div>
            </div>

            {data.days && data.days.length > 0 ? (
              <>
                <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
                  {data.days.map((day: any) => (
                    <button
                      key={day.dayIndex}
                      type="button"
                      onClick={() => setActiveDay(day.dayIndex)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        activeDay === day.dayIndex
                          ? "bg-[#6B7B5E] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {DAY_NAMES[day.dayIndex] || day.dayName}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {data.days
                    .find((d: any) => d.dayIndex === activeDay)
                    ?.meals.map((meal: any) => (
                      <div key={meal.id} className="border border-gray-100 rounded-xl p-3">
                        <div className="text-sm font-semibold text-[#1E1E1E] mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#6B7B5E]" />
                          {meal.name || MEAL_LABELS[meal.mealType] || meal.mealType}
                        </div>
                        <div className="space-y-2">
                          {meal.dishes.map((dishLink: any) => {
                            const dish = dishLink.dish;
                            if (!dish) return null;
                            const calories = calcCalories(dish.caloriesPer100g, dishLink.weight);
                            return (
                              <div
                                key={dishLink.id}
                                className="flex items-center gap-3 py-1.5"
                              >
                                {dish.imageUrl && (
                                  <img
                                    src={dish.imageUrl}
                                    alt={dish.name}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-[#1E1E1E] truncate">
                                    {dish.name}
                                  </div>
                                  <div className="text-xs text-[#6B6B6B]">
                                    {dishLink.weight} г
                                  </div>
                                </div>
                                <div className="text-sm font-medium text-[#E07B3A]">
                                  {calories} ккал
                                </div>
                              </div>
                            );
                          })}
                          {meal.dishes.length === 0 && (
                            <div className="text-xs text-gray-400 py-1">Нет блюд</div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-400 py-8 text-center">
                Меню для этого рациона ещё не составлено
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
