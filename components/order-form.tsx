"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { z } from "zod";
import {
  UtensilsCrossed,
  ShoppingCart,
  Package,
  Flower2,
  MapPin,
  Weight,
  Box,
  Info,
  Store,
} from "lucide-react";
import { deliveryZones } from "@/lib/data";

const deliveryTypeLabels: Record<
  string,
  { label: string; icon: React.ReactNode }
> = {
  food: {
    label: "Доставка еды",
    icon: <UtensilsCrossed className="h-4 w-4" />,
  },
  groceries: {
    label: "Доставка продуктов",
    icon: <ShoppingCart className="h-4 w-4" />,
  },
  parcels: { label: "Доставка посылок", icon: <Package className="h-4 w-4" /> },
  flowers: { label: "Доставка цветов", icon: <Flower2 className="h-4 w-4" /> },
};

const orderFormSchema = z.object({
  deliveryType: z.enum(["food", "groceries", "parcels", "flowers"]),
  pickupPointId: z.string().optional(),
  address: z.string().min(1, "Укажите адрес"),
  name: z.string().min(1, "Укажите имя"),
  phone: z.string().min(1, "Укажите телефон"),
  comment: z.string().optional(),
});

function calculateCost(
  basePrice: number,
  volumeLiters: number,
  weightKg: number
): number {
  let cost = basePrice;

  if (volumeLiters > 50) {
    cost += Math.ceil((volumeLiters - 50) / 10) * 50;
  }

  if (weightKg > 10) {
    cost += Math.ceil((weightKg - 10) / 5) * 50;
  }

  return cost;
}

export function OrderForm() {
  const router = useRouter();
  const [deliveryType, setDeliveryType] = useState("food");
  const [deliveryZone, setDeliveryZone] = useState("");
  const [volumeLiters, setVolumeLiters] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    id: string;
    deliveryType: string;
  } | null>(null);
  const [pickupPoints, setPickupPoints] = useState<
    { id: string; name: string; address: string; city: string }[]
  >([]);
  const [pickupPointId, setPickupPointId] = useState("");

  useEffect(() => {
    fetch("/api/pickup-points")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPickupPoints(data);
      })
      .catch(() => {});
  }, []);

  const selectedZone = deliveryZones.find((z) => z.id === deliveryZone);

  const deliveryCost = useMemo(() => {
    if (!selectedZone) return null;
    const vol = parseFloat(volumeLiters) || 0;
    const wt = parseFloat(weightKg) || 0;
    return calculateCost(selectedZone.basePrice, vol, wt);
  }, [selectedZone, volumeLiters, weightKg]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = orderFormSchema.safeParse({
      deliveryType,
      pickupPointId: pickupPointId || undefined,
      address,
      name,
      phone,
      comment,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Отправляем заказ...");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка при создании заказа");
      }

      const order = await res.json();
      toast.success("Заказ оформлен!", { id: toastId });
      setConfirmedOrder({
        id: order.id,
        deliveryType: order.deliveryType,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Не удалось создать заказ",
        { id: toastId }
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleCloseConfirm() {
    setConfirmedOrder(null);
    router.push("/");
  }

  const orderNumber = confirmedOrder?.id
    ? confirmedOrder.id.split("-")[0].toUpperCase() +
      confirmedOrder.id.slice(-4).toUpperCase()
    : "";

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="deliveryType">Тип доставки</Label>
          <Select
            value={deliveryType}
            onValueChange={(value) => value && setDeliveryType(value)}
          >
            <SelectTrigger className="w-full" id="deliveryType">
              <SelectValue>
                {deliveryType && (
                  <span className="flex items-center gap-2">
                    {deliveryTypeLabels[deliveryType]?.icon}
                    {deliveryTypeLabels[deliveryType]?.label}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(deliveryTypeLabels).map(([value, item]) => (
                <SelectItem key={value} value={value}>
                  <span className="flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deliveryZone">Зона доставки</Label>
          <Select
            value={deliveryZone}
            onValueChange={(value) => value && setDeliveryZone(value)}
          >
            <SelectTrigger className="w-full" id="deliveryZone">
              <SelectValue placeholder="Выберите зону доставки" />
            </SelectTrigger>
            <SelectContent>
              {deliveryZones.map((zone) => (
                <SelectItem key={zone.id} value={zone.id}>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {zone.name}
                    <span className="text-muted-foreground ml-auto">
                      от {zone.basePrice} ₽
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {pickupPoints.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="pickupPoint">Пункт выдачи (необязательно)</Label>
            <Select
              value={pickupPointId}
              onValueChange={(value) =>
                value != null && setPickupPointId(value)
              }
            >
              <SelectTrigger className="w-full" id="pickupPoint">
                <SelectValue placeholder="Выберите пункт выдачи" />
              </SelectTrigger>
              <SelectContent>
                {pickupPoints.map((point) => (
                  <SelectItem key={point.id} value={point.id}>
                    <span className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <span>{point.name}</span>
                      <span className="text-muted-foreground text-xs ml-auto">
                        {point.city}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Вес, кг</Label>
            <div className="relative">
              <Weight className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="weight"
                type="number"
                min="0"
                step="0.1"
                placeholder="0"
                className="pl-9"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="volume">Объём, л</Label>
            <div className="relative">
              <Box className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="volume"
                type="number"
                min="0"
                step="0.1"
                placeholder="0"
                className="pl-9"
                value={volumeLiters}
                onChange={(e) => setVolumeLiters(e.target.value)}
              />
            </div>
          </div>
        </div>

        {deliveryCost !== null && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-lg border bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>
                  Стоимость доставки
                  {selectedZone && (
                    <>
                      {" "}
                      в <strong>{selectedZone.name}</strong>
                    </>
                  )}
                </span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {deliveryCost.toLocaleString("ru-RU")} ₽
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Базовая цена: {selectedZone?.basePrice} ₽
              {(parseFloat(volumeLiters) || 0) > 50 && (
                <span>
                  {" "}
                  · надбавка за объём:{" "}
                  {Math.ceil(((parseFloat(volumeLiters) || 0) - 50) / 10) *
                    50}{" "}
                  ₽
                </span>
              )}
              {(parseFloat(weightKg) || 0) > 10 && (
                <span>
                  {" "}
                  · надбавка за вес:{" "}
                  {Math.ceil(((parseFloat(weightKg) || 0) - 10) / 5) * 50} ₽
                </span>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="address">Адрес доставки</Label>
          <Input
            id="address"
            placeholder="ул. Ленина, д. 10, кв. 5"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Имя</Label>
          <Input
            id="name"
            placeholder="Иван Петров"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Телефон</Label>
          <Input
            id="phone"
            placeholder="+7 (999) 123-45-67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment">Комментарий</Label>
          <Textarea
            id="comment"
            placeholder="Дополнительные пожелания"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base"
          disabled={submitting}
        >
          {submitting ? "Отправляем..." : "Оформить заказ"}
        </Button>
      </form>

      <Dialog
        open={!!confirmedOrder}
        onOpenChange={(open) => {
          if (!open) handleCloseConfirm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">Заказ оформлен!</DialogTitle>
            <DialogDescription>
              Спасибо! Ваш заказ принят и передан в обработку.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Номер заказа</p>
              <p className="text-2xl font-bold tracking-wider text-primary">
                {orderNumber}
              </p>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              <p>
                Тип:{" "}
                <span className="font-medium text-foreground">
                  {confirmedOrder &&
                    deliveryTypeLabels[confirmedOrder.deliveryType]?.label}
                </span>
              </p>
              <p className="mt-1">
                Сохраните номер заказа для отслеживания статуса
              </p>
            </div>
          </div>
          <Button onClick={handleCloseConfirm} className="w-full">
            На главную
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
