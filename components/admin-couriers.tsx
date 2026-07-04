"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Truck,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Package,
  UserPlus,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/lib/models";

interface AdminCourier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  workZone: string;
  isAvailable: boolean;
  orderCount: number;
  createdAt: string;
}

export function AdminCouriers() {
  const [couriers, setCouriers] = useState<AdminCourier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<AdminCourier | null>(
    null
  );
  const [expandedCourier, setExpandedCourier] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [workZone, setWorkZone] = useState("");
  const [editWorkZone, setEditWorkZone] = useState("");
  const [editIsAvailable, setEditIsAvailable] = useState("true");

  const fetchCouriers = useCallback(async () => {
    setLoading(true);
    try {
      const [couriersRes, ordersRes] = await Promise.all([
        fetch("/api/admin/couriers"),
        fetch("/api/orders"),
      ]);
      const couriersData = await couriersRes.json();
      const ordersData = await ordersRes.json();
      setCouriers(Array.isArray(couriersData) ? couriersData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch {
      toast.error("Не удалось загрузить курьеров");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCouriers();
  }, [fetchCouriers]);

  function openCreate() {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setWorkZone("");
    setCreateDialogOpen(true);
  }

  function openEdit(courier: AdminCourier) {
    setSelectedCourier(courier);
    setEditWorkZone(courier.workZone);
    setEditIsAvailable(courier.isAvailable ? "true" : "false");
    setEditDialogOpen(true);
  }

  function openAssign(courier: AdminCourier) {
    setSelectedCourier(courier);
    setAssignDialogOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !password.trim() || !workZone.trim()) {
      toast.error("Заполните обязательные поля");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Создаём курьера...");

    try {
      const res = await fetch("/api/admin/couriers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim(),
          password: password.trim(),
          workZone: workZone.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка при создании");
      }

      const created = await res.json();
      setCouriers((prev) => [created, ...prev]);
      toast.success("Курьер создан", { id: toastId });
      setCreateDialogOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Не удалось создать курьера",
        { id: toastId }
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourier) return;

    setSaving(true);
    const toastId = toast.loading("Сохраняем изменения...");

    try {
      const res = await fetch("/api/admin/couriers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedCourier.id,
          workZone: editWorkZone.trim(),
          isAvailable: editIsAvailable === "true",
        }),
      });

      if (!res.ok) throw new Error("Ошибка при обновлении");

      const updated = await res.json();
      setCouriers((prev) =>
        prev.map((c) =>
          c.id === selectedCourier.id
            ? {
                ...c,
                workZone: updated.workZone,
                isAvailable: updated.isAvailable,
              }
            : c
        )
      );
      toast.success("Курьер обновлён", { id: toastId });
      setEditDialogOpen(false);
    } catch {
      toast.error("Не удалось обновить курьера", { id: toastId });
    } finally {
      setSaving(false);
    }
  }

  async function handleAssign(orderId: string, courierId: string | null) {
    const toastId = toast.loading("Назначаем курьера...");
    try {
      const res = await fetch("/api/orders/assign-courier", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, courierId }),
      });

      if (!res.ok) throw new Error("Ошибка при назначении");

      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));

      setCouriers((prev) =>
        prev.map((c) => {
          if (c.id === courierId) return { ...c, orderCount: c.orderCount + 1 };
          if (courierId === null) {
            const oldOrder = orders.find((o) => o.id === orderId);
            if (oldOrder?.courierId === c.id)
              return { ...c, orderCount: Math.max(0, c.orderCount - 1) };
          }
          return c;
        })
      );

      toast.success("Курьер назначен", { id: toastId });
    } catch {
      toast.error("Не удалось назначить курьера", { id: toastId });
    }
  }

  const getCourierOrders = useCallback(
    (courierId: string) => {
      return orders.filter((o) => o.courierId === courierId);
    },
    [orders]
  );

  const unassignedOrders = orders.filter((o) => !o.courierId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Курьеры</h2>
          <p className="text-sm text-muted-foreground">
            Всего курьеров: {couriers.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCouriers}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Обновить
          </Button>
          <Button size="sm" onClick={openCreate}>
            <UserPlus className="h-4 w-4 mr-2" />
            Добавить курьера
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      ) : couriers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Truck className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg text-muted-foreground">Нет курьеров</p>
          <Button variant="outline" size="sm" onClick={openCreate}>
            <UserPlus className="h-4 w-4 mr-2" />
            Добавить первого курьера
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {couriers.map((courier) => {
            const isExpanded = expandedCourier === courier.id;
            const courierOrders = getCourierOrders(courier.id);
            const deliveredCount = courierOrders.filter(
              (o) => o.status === "delivered"
            ).length;

            return (
              <div
                key={courier.id}
                className="rounded-lg border p-4 sm:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">
                          {courier.name}
                        </span>
                        <Badge
                          variant={
                            courier.isAvailable ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {courier.isAvailable ? "Свободен" : "Занят"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {courier.workZone}
                        </span>
                        {courier.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {courier.phone}
                          </span>
                        )}
                        {courier.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {courier.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right mr-2">
                      <p className="text-sm font-medium">
                        {courier.orderCount}
                      </p>
                      <p className="text-xs text-muted-foreground">заказов</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAssign(courier)}
                    >
                      <Package className="h-4 w-4 mr-1" />
                      Назначить
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(courier)}
                    >
                      Правка
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedCourier(isExpanded ? null : courier.id)
                      }
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t pt-4 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-2xl font-bold">
                          {courier.orderCount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Всего заказов
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-2xl font-bold">{deliveredCount}</p>
                        <p className="text-xs text-muted-foreground">
                          Доставлено
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-2xl font-bold">
                          {
                            courierOrders.filter(
                              (o) => o.status === "in_transit"
                            ).length
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">В пути</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-2xl font-bold">
                          {
                            courierOrders.filter(
                              (o) =>
                                o.status === "pending" ||
                                o.status === "preparing"
                            ).length
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Активные
                        </p>
                      </div>
                    </div>

                    {courierOrders.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          Заказы курьера
                        </h4>
                        <div className="space-y-2">
                          {courierOrders.map((order) => (
                            <div
                              key={order.id}
                              className="flex items-center justify-between rounded-lg border p-3 text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-muted-foreground text-xs">
                                  #
                                  {order.id.split("-")[0].toUpperCase() +
                                    order.id.slice(-4).toUpperCase()}
                                </span>
                                <span className="text-muted-foreground">
                                  {order.address}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {statusLabel(order.status)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {courierOrders.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Нет назначенных заказов
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить курьера</DialogTitle>
            <DialogDescription>
              Заполните данные нового курьера
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courier-name">Имя *</Label>
              <Input
                id="courier-name"
                placeholder="Иван Петров"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courier-email">Email</Label>
              <Input
                id="courier-email"
                type="email"
                placeholder="courier@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courier-phone">Телефон *</Label>
              <Input
                id="courier-phone"
                placeholder="+7 (999) 123-45-67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courier-password">Пароль *</Label>
              <Input
                id="courier-password"
                type="password"
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courier-zone">Зона работы *</Label>
              <Input
                id="courier-zone"
                placeholder="Находка"
                value={workZone}
                onChange={(e) => setWorkZone(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Создаём..." : "Создать курьера"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать курьера</DialogTitle>
            <DialogDescription>Измените данные курьера</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-zone">Зона работы</Label>
              <Input
                id="edit-zone"
                placeholder="Находка"
                value={editWorkZone}
                onChange={(e) => setEditWorkZone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-available">Статус</Label>
              <Select
                value={editIsAvailable}
                onValueChange={(value) => {
                  if (value) setEditIsAvailable(value);
                }}
              >
                <SelectTrigger id="edit-available">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Свободен</SelectItem>
                  <SelectItem value="false">Занят</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Сохраняем..." : "Сохранить изменения"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Назначить заказы — {selectedCourier?.name}
            </DialogTitle>
            <DialogDescription>
              {unassignedOrders.length > 0
                ? "Выберите заказ для назначения курьеру"
                : "Нет заказов без курьера"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {unassignedOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      #
                      {order.id.split("-")[0].toUpperCase() +
                        order.id.slice(-4).toUpperCase()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {deliveryTypeLabel(order.deliveryType)}
                    </Badge>
                  </div>
                  <p className="text-sm truncate">{order.address}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.name} — {order.phone}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    handleAssign(order.id, selectedCourier?.id ?? null)
                  }
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Назначить
                </Button>
              </div>
            ))}
            {unassignedOrders.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Все заказы уже назначены курьерам
              </p>
            )}
          </div>
          {selectedCourier && (
            <div className="border-t pt-3 mt-2">
              <h4 className="text-sm font-medium mb-2">
                Текущие заказы {selectedCourier.name}
              </h4>
              {getCourierOrders(selectedCourier.id).length > 0 ? (
                <div className="space-y-2">
                  {getCourierOrders(selectedCourier.id).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border p-2 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs text-muted-foreground">
                          #
                          {order.id.split("-")[0].toUpperCase() +
                            order.id.slice(-4).toUpperCase()}
                        </span>
                        <span className="truncate text-muted-foreground">
                          {order.address}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive shrink-0"
                        onClick={() => handleAssign(order.id, null)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Нет назначенных заказов
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function statusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: "Новый",
    preparing: "Готовится",
    in_transit: "В пути",
    delivered: "Доставлен",
    cancelled: "Отменён",
  };
  return labels[status] || status;
}

function deliveryTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    food: "Еда",
    groceries: "Продукты",
    parcels: "Посылки",
    flowers: "Цветы",
  };
  return labels[type] || type;
}
