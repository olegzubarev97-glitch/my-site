import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Pencil, Save, X } from "lucide-react";

export function ConfigManager() {
  const { data: configs, refetch } = trpc.config.getAll.useQuery();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const updateMutation = trpc.config.update.useMutation({
    onSuccess: () => { toast.success("Настройка обновлена"); refetch(); setEditingKey(null); },
  });

  const handleSave = (key: string) => {
    updateMutation.mutate({ key, value: editValue });
  };

  const startEdit = (item: any) => {
    setEditingKey(item.key);
    setEditValue(item.value);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#1E1E1E] mb-6">Настройки сайта</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ключ</TableHead>
              <TableHead>Значение</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {configs?.map((item) => (
              <TableRow key={item.key}>
                <TableCell className="font-mono text-sm text-gray-600">{item.key}</TableCell>
                <TableCell>
                  {editingKey === item.key ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm">{item.value}</span>
                  )}
                </TableCell>
                <TableCell>
                  {editingKey === item.key ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSave(item.key)}
                        disabled={updateMutation.isPending}
                      >
                        <Save className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingKey(null)}>
                        <X className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => startEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
