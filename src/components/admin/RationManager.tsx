import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const DAY_NAMES = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
const MEAL_TYPES = [
  { value: "breakfast", label: "Завтрак" },
  { value: "lunch", label: "Обед" },
  { value: "dinner", label: "Ужин" },
  { value: "snack1", label: "Перекус 1" },
  { value: "snack2", label: "Перекус 2" },
];

interface MenuMealDish {
  dishId: number;
  weight: number;
  sortOrder: number;
  dishName?: string;
  dishImageUrl?: string | null;
}

interface MenuMeal {
  mealType: "breakfast" | "lunch" | "dinner" | "snack1" | "snack2";
  name?: string;
  sortOrder: number;
  dishes: MenuMealDish[];
  isOpen: boolean;
}

interface MenuDay {
  dayIndex: number;
  dayName: string;
  meals: MenuMeal[];
}

function createEmptyMenu(): MenuDay[] {
  return DAY_NAMES.map((name, idx) => ({
    dayIndex: idx,
    dayName: name,
    meals: [],
  }));
}

function calcDishCalories(dish: any, weight: number) {
  if (!dish) return 0;
  return Math.round((dish.caloriesPer100g * weight) / 100);
}

export function RationManager() {
  const { data: rations, refetch } = trpc.ration.adminList.useQuery();
  const { data: allDishes } = trpc.dish.adminList.useQuery();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [menu, setMenu] = useState<MenuDay[]>(createEmptyMenu());
  const [activeDay, setActiveDay] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const createMutation = trpc.ration.create.useMutation({
    onSuccess: () => { toast.success("Рацион создан"); refetch(); setOpen(false); resetMenu(); },
    onError: () => toast.error("Ошибка создания"),
  });
  const updateMutation = trpc.ration.update.useMutation({
    onSuccess: () => { toast.success("Рацион обновлен"); refetch(); setOpen(false); setEditing(null); resetMenu(); },
    onError: () => toast.error("Ошибка обновления"),
  });
  const deleteMutation = trpc.ration.delete.useMutation({
    onSuccess: () => { toast.success("Рацион удален"); refetch(); },
    onError: () => toast.error("Ошибка удаления"),
  });

  const getWithMenu = trpc.ration.getWithMenu.useQuery(
    { id: editing?.id ?? 0 },
    { enabled: !!editing?.id && open }
  );

  function resetMenu() {
    setMenu(createEmptyMenu());
    setActiveDay(0);
  }

  useEffect(() => {
    if (editing && getWithMenu.data && getWithMenu.data.id === editing.id) {
      const data = getWithMenu.data;
      const loadedMenu: MenuDay[] = DAY_NAMES.map((name, idx) => {
        const dayData = data.days.find((d: any) => d.dayIndex === idx);
        return {
          dayIndex: idx,
          dayName: name,
          meals: dayData
            ? dayData.meals.map((m: any) => ({
                mealType: m.mealType,
                name: m.name || undefined,
                sortOrder: m.sortOrder,
                isOpen: true,
                dishes: m.dishes.map((d: any) => ({
                  dishId: d.dishId,
                  weight: d.weight,
                  sortOrder: d.sortOrder,
                  dishName: d.dish?.name,
                  dishImageUrl: d.dish?.imageUrl,
                })),
              }))
            : [],
        };
      });
      setMenu(loadedMenu);
      setActiveDay(0);
    } else if (!editing) {
      resetMenu();
    }
  }, [editing, getWithMenu.data]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      slug: fd.get("slug") as string,
      calories: Number(fd.get("calories")),
      protein: fd.get("protein") as string,
      fat: fd.get("fat") as string,
      carbs: fd.get("carbs") as string,
      priceDay: Number(fd.get("priceDay")),
      priceWeek: Number(fd.get("priceWeek")),
      description: (fd.get("description") as string) || undefined,
      targetAudience: (fd.get("targetAudience") as string) || undefined,
      imageUrl: (fd.get("imageUrl") as string) || undefined,
      sortOrder: Number(fd.get("sortOrder") || 0),
      isActive,
    };

    const menuPayload = menu
      .filter((day) => day.meals.length > 0)
      .map((day) => ({
        dayIndex: day.dayIndex,
        dayName: day.dayName,
        meals: day.meals.map((meal) => ({
          mealType: meal.mealType,
          name: meal.name,
          sortOrder: meal.sortOrder,
          dishes: meal.dishes.map((d) => ({
            dishId: d.dishId,
            weight: d.weight,
            sortOrder: d.sortOrder,
          })),
        })),
      }));

    if (editing) {
      updateMutation.mutate({ id: editing.id, ...data, menu: menuPayload });
    } else {
      createMutation.mutate({ ...data, menu: menuPayload } as any);
    }
  };

  const openEdit = (ration: any) => {
    setEditing(ration);
    setIsActive(ration.isActive);
    setOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setIsActive(true);
    setOpen(true);
    resetMenu();
  };

  const addMeal = (dayIndex: number) => {
    setMenu((prev) =>
      prev.map((day) =>
        day.dayIndex === dayIndex
          ? {
              ...day,
              meals: [
                ...day.meals,
                {
                  mealType: "breakfast",
                  name: "",
                  sortOrder: day.meals.length,
                  dishes: [],
                  isOpen: true,
                },
              ],
            }
          : day
      )
    );
  };

  const removeMeal = (dayIndex: number, mealIdx: number) => {
    setMenu((prev) =>
      prev.map((day) =>
        day.dayIndex === dayIndex
          ? { ...day, meals: day.meals.filter((_, i) => i !== mealIdx) }
          : day
      )
    );
  };

  const updateMeal = (dayIndex: number, mealIdx: number, patch: Partial<MenuMeal>) => {
    setMenu((prev) =>
      prev.map((day) =>
        day.dayIndex === dayIndex
          ? {
              ...day,
              meals: day.meals.map((m, i) => (i === mealIdx ? { ...m, ...patch } : m)),
            }
          : day
      )
    );
  };

  const addDishToMeal = (dayIndex: number, mealIdx: number, dishId: number, weight: number) => {
    const dish = allDishes?.find((d) => d.id === dishId);
    if (!dish) return;
    setMenu((prev) =>
      prev.map((day) =>
        day.dayIndex === dayIndex
          ? {
              ...day,
              meals: day.meals.map((m, i) =>
                i === mealIdx
                  ? {
                      ...m,
                      dishes: [
                        ...m.dishes,
                        {
                          dishId,
                          weight,
                          sortOrder: m.dishes.length,
                          dishName: dish.name,
                          dishImageUrl: dish.imageUrl,
                        },
                      ],
                    }
                  : m
              ),
            }
          : day
      )
    );
  };

  const removeDishFromMeal = (dayIndex: number, mealIdx: number, dishIdx: number) => {
    setMenu((prev) =>
      prev.map((day) =>
        day.dayIndex === dayIndex
          ? {
              ...day,
              meals: day.meals.map((m, i) =>
                i === mealIdx ? { ...m, dishes: m.dishes.filter((_, di) => di !== dishIdx) } : m
              ),
            }
          : day
      )
    );
  };

  const updateDishWeight = (dayIndex: number, mealIdx: number, dishIdx: number, weight: number) => {
    setMenu((prev) =>
      prev.map((day) =>
        day.dayIndex === dayIndex
          ? {
              ...day,
              meals: day.meals.map((m, i) =>
                i === mealIdx
                  ? {
                      ...m,
                      dishes: m.dishes.map((d, di) => (di === dishIdx ? { ...d, weight } : d)),
                    }
                  : m
              ),
            }
          : day
      )
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#1E1E1E]">Рационы</h1>
        <Button onClick={openCreate} className="bg-[#6B7B5E] hover:bg-[#4A5A3F] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Добавить
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Ккал</TableHead>
              <TableHead>Цена/день</TableHead>
              <TableHead>Дней меню</TableHead>
              <TableHead>Активен</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rations?.map((r: any) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.calories}</TableCell>
                <TableCell>{r.priceDay.toLocaleString("ru-RU")} ₽</TableCell>
                <TableCell>{r.daysCount ?? 0}</TableCell>
                <TableCell>
                  <Switch checked={r.isActive} disabled />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteMutation.mutate({ id: r.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Редактировать рацион" : "Новый рацион"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Название</label>
                <Input name="name" defaultValue={editing?.name || ""} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Slug</label>
                <Input name="slug" defaultValue={editing?.slug || ""} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Калории</label>
                <Input name="calories" type="number" defaultValue={editing?.calories ?? ""} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Белки</label>
                <Input name="protein" defaultValue={editing?.protein ?? ""} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Жиры</label>
                <Input name="fat" defaultValue={editing?.fat ?? ""} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Углеводы</label>
                <Input name="carbs" defaultValue={editing?.carbs ?? ""} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Цена/день</label>
                <Input name="priceDay" type="number" defaultValue={editing?.priceDay ?? ""} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Цена/неделя</label>
                <Input name="priceWeek" type="number" defaultValue={editing?.priceWeek ?? ""} required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Описание</label>
              <Textarea name="description" defaultValue={editing?.description || ""} rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Кому подходит</label>
              <Textarea name="targetAudience" defaultValue={editing?.targetAudience || ""} rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">URL изображения</label>
              <Input name="imageUrl" defaultValue={editing?.imageUrl || ""} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Порядок</label>
                <Input name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <label className="text-sm">Активен</label>
              </div>
            </div>

            {/* Menu Builder */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold mb-3">Меню рациона</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {DAY_NAMES.map((name, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveDay(idx)}
                    className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                      activeDay === idx
                        ? "bg-[#6B7B5E] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>

              <div className="mt-3 space-y-3">
                {menu[activeDay]?.meals.length === 0 && (
                  <div className="text-sm text-gray-400 py-4 text-center">Нет приёмов пищи</div>
                )}
                {menu[activeDay]?.meals.map((meal, mealIdx) => (
                  <div key={mealIdx} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateMeal(activeDay, mealIdx, { isOpen: !meal.isOpen })
                          }
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {meal.isOpen ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <Select
                          value={meal.mealType}
                          onValueChange={(v) => updateMeal(activeDay, mealIdx, { mealType: v as MenuMeal["mealType"] })}
                        >
                          <SelectTrigger className="w-[160px] h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MEAL_TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          className="w-[180px] h-8 text-sm"
                          placeholder="Название (опц.)"
                          value={meal.name || ""}
                          onChange={(e) => updateMeal(activeDay, mealIdx, { name: e.target.value })}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                        onClick={() => removeMeal(activeDay, mealIdx)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {meal.isOpen && (
                      <div className="space-y-2 pl-7">
                        {meal.dishes.length === 0 && (
                          <div className="text-xs text-gray-400 py-1">Нет блюд</div>
                        )}
                        {meal.dishes.map((dish, dishIdx) => {
                          const dishInfo = allDishes?.find((d) => d.id === dish.dishId);
                          return (
                            <div key={dishIdx} className="flex items-center gap-2">
                              {dish.dishImageUrl && (
                                <img
                                  src={dish.dishImageUrl}
                                  alt={dish.dishName}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              )}
                              <div className="flex-1 text-sm">{dish.dishName || dishInfo?.name}</div>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  className="w-20 h-7 text-sm"
                                  value={dish.weight}
                                  onChange={(e) =>
                                    updateDishWeight(activeDay, mealIdx, dishIdx, Number(e.target.value))
                                  }
                                />
                                <span className="text-xs text-gray-400 w-8">г</span>
                                <span className="text-xs text-gray-500 w-16 text-right">
                                  {calcDishCalories(dishInfo, dish.weight)} ккал
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 h-7 w-7 p-0"
                                  onClick={() => removeDishFromMeal(activeDay, mealIdx, dishIdx)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}

                        <div className="flex items-center gap-2 pt-1">
                          <Select
                            onValueChange={(val) => {
                              const dishId = Number(val);
                              const input = document.getElementById(`weight-${activeDay}-${mealIdx}`) as HTMLInputElement;
                              const weight = Number(input?.value || 100);
                              if (dishId && weight > 0) {
                                addDishToMeal(activeDay, mealIdx, dishId, weight);
                              }
                            }}
                          >
                            <SelectTrigger className="flex-1 h-8 text-sm">
                              <SelectValue placeholder="Добавить блюдо..." />
                            </SelectTrigger>
                            <SelectContent>
                              {allDishes?.filter((d) => d.isActive).map((d) => (
                                <SelectItem key={d.id} value={String(d.id)}>
                                  {d.name} ({d.caloriesPer100g} ккал/100г)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            id={`weight-${activeDay}-${mealIdx}`}
                            type="number"
                            defaultValue={100}
                            className="w-20 h-8 text-sm"
                          />
                          <span className="text-xs text-gray-400">г</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => addMeal(activeDay)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Добавить приём пищи
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#6B7B5E] hover:bg-[#4A5A3F] text-white">
              {editing ? "Сохранить" : "Создать"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
