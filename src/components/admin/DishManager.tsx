import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  "Завтрак": "Завтраки",
  "Обед": "Обеды",
  "Ужин": "Ужины",
  "Перекус": "Перекусы",
};

const CATEGORY_ORDER = ["Завтрак", "Обед", "Ужин", "Перекус"];

export function DishManager() {
  const { data: dishesList, refetch } = trpc.dish.adminList.useQuery();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [isActive, setIsActive] = useState(true);

  const createMutation = trpc.dish.create.useMutation({
    onSuccess: () => { toast.success("Блюдо создано"); refetch(); setOpen(false); },
    onError: () => toast.error("Ошибка создания"),
  });
  const updateMutation = trpc.dish.update.useMutation({
    onSuccess: () => { toast.success("Блюдо обновлено"); refetch(); setOpen(false); setEditing(null); },
    onError: () => toast.error("Ошибка обновления"),
  });
  const deleteMutation = trpc.dish.delete.useMutation({
    onSuccess: () => { toast.success("Блюдо удалено"); refetch(); },
    onError: () => toast.error("Ошибка удаления"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      description: (fd.get("description") as string) || undefined,
      imageUrl: (fd.get("imageUrl") as string) || undefined,
      calories: Number(fd.get("calories")),
      protein: fd.get("protein") as string,
      fat: fd.get("fat") as string,
      carbs: fd.get("carbs") as string,
      weight: fd.get("weight") as string,
      isActive,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...data });
    } else {
      createMutation.mutate(data as any);
    }
  };

  const openEdit = (dish: any) => {
    setEditing(dish);
    setIsActive(dish.isActive);
    setOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setIsActive(true);
    setOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#1E1E1E]">Блюда</h1>
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
              <TableHead>Б/Ж/У</TableHead>
              <TableHead>Вес</TableHead>
              <TableHead>Активно</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(() => {
              const grouped = new Map<string, typeof dishesList>();
              for (const d of dishesList ?? []) {
                const cat = (d as any).category || "Перекус";
                if (!grouped.has(cat)) grouped.set(cat, []);
                grouped.get(cat)!.push(d);
              }
              const rows: React.ReactNode[] = [];
              for (const cat of CATEGORY_ORDER) {
                const items = grouped.get(cat);
                if (!items || items.length === 0) continue;
                rows.push(
                  <TableRow key={`cat-${cat}`} className="bg-gray-50">
                    <TableCell colSpan={6} className="font-semibold text-[#6B7B5E] py-2">
                      {CATEGORY_LABELS[cat] || cat} ({items.length})
                    </TableCell>
                  </TableRow>
                );
                for (const d of items) {
                  rows.push(
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {d.imageUrl && (
                            <img src={d.imageUrl} alt={d.name} className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          {d.name}
                        </div>
                      </TableCell>
                      <TableCell>{d.calories}</TableCell>
                      <TableCell>{d.protein}/{d.fat}/{d.carbs}</TableCell>
                      <TableCell>{d.weight}</TableCell>
                      <TableCell>
                        <Switch checked={d.isActive} disabled />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(d)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteMutation.mutate({ id: d.id })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }
              }
              return rows;
            })()}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Редактировать блюдо" : "Новое блюдо"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Название</label>
              <Input name="name" defaultValue={editing?.name || ""} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Описание</label>
              <Textarea name="description" defaultValue={editing?.description || ""} rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">URL фотографии</label>
              <Input name="imageUrl" defaultValue={editing?.imageUrl || ""} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Ккал (на порцию)</label>
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
            <div>
              <label className="text-sm font-medium mb-1 block">Вес порции</label>
              <Input name="weight" defaultValue={editing?.weight ?? ""} required />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <label className="text-sm">Активно</label>
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
