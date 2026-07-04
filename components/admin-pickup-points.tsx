"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Plus, Pencil, Trash2, Store, Building2 } from "lucide-react";
import { toast } from "sonner";
import type { PickupPoint } from "@/lib/models";

export function AdminPickupPoints() {
  const [points, setPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<PickupPoint | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPoints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pickup-points");
      const data = await res.json();
      setPoints(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Не удалось загрузить точки выдачи");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  function openCreate() {
    setEditingPoint(null);
    setName("");
    setAddress("");
    setCity("");
    setDialogOpen(true);
  }

  function openEdit(point: PickupPoint) {
    setEditingPoint(point);
    setName(point.name);
    setAddress(point.address);
    setCity(point.city);
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !city.trim()) {
      toast.error("Заполните все поля");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(
      editingPoint ? "Сохраняем изменения..." : "Создаём точку..."
    );

    try {
      if (editingPoint) {
        const res = await fetch("/api/pickup-points", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingPoint.id,
            name: name.trim(),
            address: address.trim(),
            city: city.trim(),
          }),
        });

        if (!res.ok) throw new Error("Ошибка при обновлении");

        const updated = await res.json();
        setPoints((prev) =>
          prev.map((p) => (p.id === editingPoint.id ? updated : p))
        );
        toast.success("Точка обновлена", { id: toastId });
      } else {
        const res = await fetch("/api/pickup-points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            address: address.trim(),
            city: city.trim(),
          }),
        });

        if (!res.ok) throw new Error("Ошибка при создании");

        const created = await res.json();
        setPoints((prev) => [...prev, created]);
        toast.success("Точка создана", { id: toastId });
      }

      setDialogOpen(false);
    } catch {
      toast.error(
        editingPoint ? "Не удалось обновить точку" : "Не удалось создать точку",
        { id: toastId }
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Вы уверены, что хотите удалить эту точку выдачи?"
    );
    if (!confirmed) return;

    const toastId = toast.loading("Удаляем...");
    try {
      const res = await fetch(`/api/pickup-points?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Ошибка при удалении");

      setPoints((prev) => prev.filter((p) => p.id !== id));
      toast.success("Точка удалена", { id: toastId });
    } catch {
      toast.error("Не удалось удалить точку", { id: toastId });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Пункты выдачи</h2>
          <p className="text-sm text-muted-foreground">
            Всего точек: {points.length}
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить точку
        </Button>
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
      ) : points.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Store className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg text-muted-foreground">Нет точек выдачи</p>
          <Button variant="outline" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Создать первую точку
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {points.map((point) => (
            <div
              key={point.id}
              className="rounded-lg border p-4 flex items-start justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium truncate">{point.name}</span>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 ml-6">
                  {point.address}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 ml-6">
                  <Building2 className="h-3.5 w-3.5" />
                  {point.city}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(point)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(point.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPoint ? "Редактировать точку" : "Создать точку выдачи"}
            </DialogTitle>
            <DialogDescription>
              {editingPoint
                ? "Измените данные точки выдачи"
                : "Заполните данные новой точки выдачи"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="point-name">Название</Label>
              <Input
                id="point-name"
                placeholder="Точка выдачи на Ленинской"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="point-address">Адрес</Label>
              <Input
                id="point-address"
                placeholder="ул. Ленинская, д. 5"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="point-city">Город</Label>
              <Input
                id="point-city"
                placeholder="Находка"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving
                ? "Сохраняем..."
                : editingPoint
                  ? "Сохранить изменения"
                  : "Создать точку"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
