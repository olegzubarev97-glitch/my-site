import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Phone } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  contacted: "В обработке",
  closed: "Закрыта",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-orange-100 text-orange-700",
  contacted: "bg-blue-100 text-blue-700",
  closed: "bg-green-100 text-green-700",
};

export function LeadManager() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { data: leads, refetch } = trpc.lead.list.useQuery(
    statusFilter ? { status: statusFilter as any, limit: 100, offset: 0 } : { limit: 100, offset: 0 }
  );

  const updateStatus = trpc.lead.updateStatus.useMutation({
    onSuccess: () => { toast.success("Статус обновлен"); refetch(); },
  });
  const deleteLead = trpc.lead.delete.useMutation({
    onSuccess: () => { toast.success("Заявка удалена"); refetch(); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#1E1E1E]">Заявки</h1>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="new">Новые</SelectItem>
            <SelectItem value="contacted">В обработке</SelectItem>
            <SelectItem value="closed">Закрытые</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Цель</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads?.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>
                  <a href={`tel:${lead.phone}`} className="text-[#6B7B5E] hover:underline flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {lead.phone}
                  </a>
                </TableCell>
                <TableCell className="capitalize">{lead.goal}</TableCell>
                <TableCell>
                  <Select
                    value={lead.status}
                    onValueChange={(v) => updateStatus.mutate({ id: lead.id, status: v as any })}
                  >
                    <SelectTrigger className="h-8 w-[140px]">
                      <Badge className={STATUS_COLORS[lead.status]}>
                        {STATUS_LABELS[lead.status]}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Новая</SelectItem>
                      <SelectItem value="contacted">В обработке</SelectItem>
                      <SelectItem value="closed">Закрыта</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("ru-RU") : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => deleteLead.mutate({ id: lead.id })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!leads || leads.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                  Нет заявок
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
