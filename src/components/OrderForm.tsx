import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import { Check, Phone, User, Target, MessageSquare } from "lucide-react";

interface OrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedRation?: number | null;
}

export function OrderForm({ open, onOpenChange, preSelectedRation }: OrderFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [goal, setGoal] = useState("fit");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: rations } = trpc.ration.list.useQuery();
  const createLead = trpc.lead.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Заявка отправлена! Мы свяжемся с вами в течение 15 минут.");
    },
    onError: () => {
      toast.error("Ошибка при отправке. Попробуйте позже.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Заполните имя и телефон");
      return;
    }
    createLead.mutate({
      name: name.trim(),
      phone: phone.trim(),
      goal: goal as "slim" | "fit" | "sport" | "mass" | "maintenance",
      comment: comment.trim() || undefined,
      rationId: preSelectedRation ?? undefined,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSubmitted(false);
      setName("");
      setPhone("");
      setGoal("fit");
      setComment("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#1E1E1E]">
            {submitted ? "Заявка отправлена!" : "Подобрать рацион"}
          </DialogTitle>
        </DialogHeader>
        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-[#6B7B5E]/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-[#6B7B5E]" />
            </div>
            <p className="text-center text-[#6B6B6B]">
              Спасибо! Мы перезвоним вам в течение 15 минут для подбора оптимального рациона.
            </p>
            <Button onClick={handleClose} className="bg-[#6B7B5E] hover:bg-[#4A5A3F] text-white">
              Закрыть
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-[#1E1E1E]">
                <User className="w-4 h-4 text-[#6B7B5E]" />
                Имя
              </Label>
              <Input
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-[#E8E5E0] focus-visible:ring-[#6B7B5E]"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-[#1E1E1E]">
                <Phone className="w-4 h-4 text-[#6B7B5E]" />
                Телефон
              </Label>
              <Input
                placeholder="+7 (999) 999-99-99"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border-[#E8E5E0] focus-visible:ring-[#6B7B5E]"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-[#1E1E1E]">
                <Target className="w-4 h-4 text-[#6B7B5E]" />
                Цель
              </Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger className="border-[#E8E5E0] focus:ring-[#6B7B5E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slim">Похудение</SelectItem>
                  <SelectItem value="fit">Поддержание формы</SelectItem>
                  <SelectItem value="sport">Спортивное питание</SelectItem>
                  <SelectItem value="mass">Набор массы</SelectItem>
                  <SelectItem value="maintenance">Здоровое питание</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {preSelectedRation && rations && (
              <div className="text-sm text-[#6B6B6B] bg-[#F5F1EB] p-3 rounded-lg">
                Выбран рацион:{" "}
                <span className="font-medium text-[#1E1E1E]">
                  {rations.find((r) => r.id === preSelectedRation)?.name || ""}
                </span>
              </div>
            )}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-[#1E1E1E]">
                <MessageSquare className="w-4 h-4 text-[#6B7B5E]" />
                Комментарий
              </Label>
              <Textarea
                placeholder="Аллергии, предпочтения, адрес доставки..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="border-[#E8E5E0] focus-visible:ring-[#6B7B5E] min-h-[80px]"
              />
            </div>
            <Button
              type="submit"
              disabled={createLead.isPending}
              className="w-full bg-[#6B7B5E] hover:bg-[#4A5A3F] text-white h-12 text-base"
            >
              {createLead.isPending ? "Отправка..." : "Отправить заявку"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
