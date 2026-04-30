import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export function GalleryManager() {
  const { data: images, refetch } = trpc.gallery.adminList.useQuery();
  const [newUrl, setNewUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");

  const createMutation = trpc.gallery.create.useMutation({
    onSuccess: () => { toast.success("Изображение добавлено"); refetch(); setNewUrl(""); setNewCaption(""); },
  });
  const deleteMutation = trpc.gallery.delete.useMutation({
    onSuccess: () => { toast.success("Изображение удалено"); refetch(); },
  });
  const updateMutation = trpc.gallery.update.useMutation({
    onSuccess: () => refetch(),
  });

  const handleAdd = () => {
    if (!newUrl.trim()) return;
    createMutation.mutate({
      url: newUrl.trim(),
      caption: newCaption.trim() || undefined,
      sortOrder: (images?.length || 0) + 1,
      isActive: true,
    });
  };

  const move = (id: number, dir: number) => {
    const idx = images?.findIndex((i) => i.id === id);
    if (idx === undefined || idx < 0) return;
    const targetIdx = idx + dir;
    if (!images || targetIdx < 0 || targetIdx >= images.length) return;
    const current = images[idx];
    const target = images[targetIdx];
    updateMutation.mutate({ id: current.id, sortOrder: target.sortOrder });
    updateMutation.mutate({ id: target.id, sortOrder: current.sortOrder });
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#1E1E1E] mb-6">Галерея</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex gap-3">
          <Input
            placeholder="URL изображения"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Подпись"
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            className="w-48"
          />
          <Button
            onClick={handleAdd}
            disabled={createMutation.isPending || !newUrl.trim()}
            className="bg-[#6B7B5E] hover:bg-[#4A5A3F] text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Изображение</TableHead>
              <TableHead>Подпись</TableHead>
              <TableHead>Порядок</TableHead>
              <TableHead>Активно</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {images?.map((img, idx) => (
              <TableRow key={img.id}>
                <TableCell>
                  <img src={img.url} alt={img.caption || ""} className="w-16 h-16 object-cover rounded-lg" />
                </TableCell>
                <TableCell>{img.caption || "-"}</TableCell>
                <TableCell>{img.sortOrder}</TableCell>
                <TableCell>
                  <Switch
                    checked={img.isActive}
                    onCheckedChange={(checked) =>
                      updateMutation.mutate({ id: img.id, isActive: checked })
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => move(img.id, -1)} disabled={idx === 0}>
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => move(img.id, 1)} disabled={idx === (images.length - 1)}>
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteMutation.mutate({ id: img.id })}
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
    </div>
  );
}
