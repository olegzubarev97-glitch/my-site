import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Search } from "lucide-react";

export function ContentManager() {
  const { data: contentList, refetch } = trpc.content.getAll.useQuery();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const updateMutation = trpc.content.update.useMutation({
    onSuccess: () => { toast.success("Контент обновлен"); refetch(); setOpen(false); setEditing(null); },
  });

  const filtered = contentList?.filter(
    (c) =>
      c.key.toLowerCase().includes(search.toLowerCase()) ||
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      c.section.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!editing) return;
    updateMutation.mutate({ key: editing.key, content: editing.content });
  };

  const openEdit = (item: any) => {
    setEditing({ ...item });
    setOpen(true);
  };

  const sections = Array.from(new Set(contentList?.map((c) => c.section) || []));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#1E1E1E]">Контент сайта</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {sections.map((section) => (
        <div key={section} className="mb-8">
          <h2 className="text-lg font-medium text-[#1E1E1E] mb-3 capitalize">{section}</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ключ</TableHead>
                  <TableHead>Текст</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered
                  ?.filter((c) => c.section === section)
                  .map((item) => (
                    <TableRow key={item.key}>
                      <TableCell className="font-mono text-sm text-gray-600">{item.key}</TableCell>
                      <TableCell className="max-w-md truncate">{item.content}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Редактировать контент</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Ключ</label>
                <Input value={editing.key} disabled />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Секция</label>
                <Input value={editing.section} disabled />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Текст</label>
                <Textarea
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  rows={8}
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="w-full bg-[#6B7B5E] hover:bg-[#4A5A3F] text-white"
              >
                {updateMutation.isPending ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
