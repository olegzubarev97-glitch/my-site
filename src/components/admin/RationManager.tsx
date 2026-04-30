import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function RationManager() {
  const { data: rations, refetch } = trpc.ration.adminList.useQuery();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const createMutation = trpc.ration.create.useMutation({
    onSuccess: () => { toast.success("Рацион создан"); refetch(); setOpen(false); },
    onError: () => toast.error("Ошибка создания"),
  });
  const updateMutation = trpc.ration.update.useMutation({
    onSuccess: () => { toast.success("Рацион обновлен"); refetch(); setOpen(false); setEditing(null); },
    onError: () => toast.error("Ошибка обновления"),
  });
  const deleteMutation = trpc.ration.delete.useMutation({
    onSuccess: () => { toast.success("Рацион удален"); refetch(); },
    onError: () => toast.error("Ошибка удаления"),
  });

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
      isActive: fd.get("isActive") === "on",
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...data });
    } else {
      createMutation.mutate(data as any);
    }
  };

  const openEdit = (ration: any) => {
    setEditing(ration);
    setOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
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
              <TableHead>Активен</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rations?.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.calories}</TableCell>
                <TableCell>{r.priceDay.toLocaleString("ru-RU")} ₽</TableCell>
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
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
                <Input name="calories" type="number" defaultValue={editing?.calories || ""} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Белки</label>
                <Input name="protein" defaultValue={editing?.protein || ""} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Жиры</label>
                <Input name="fat" defaultValue={editing?.fat || ""} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Углеводы</label>
                <Input name="carbs" defaultValue={editing?.carbs || ""} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Цена/день</label>
                <Input name="priceDay" type="number" defaultValue={editing?.priceDay || ""} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Цена/неделя</label>
                <Input name="priceWeek" type="number" defaultValue={editing?.priceWeek || ""} required />
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
                <Switch name="isActive" defaultChecked={editing ? editing.isActive : true} />
                <label className="text-sm">Активен</label>
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
