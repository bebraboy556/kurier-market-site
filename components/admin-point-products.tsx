"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Package, Store } from "lucide-react";
import { toast } from "sonner";
import type { PickupPoint, PointProduct } from "@/lib/models";
import { categories } from "@/lib/data";

export function AdminPointProducts() {
  const [points, setPoints] = useState<PickupPoint[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<string>("");
  const [products, setProducts] = useState<PointProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PointProduct | null>(
    null
  );
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPoints = useCallback(async () => {
    try {
      const res = await fetch("/api/pickup-points");
      const data = await res.json();
      setPoints(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
        setSelectedPointId(data[0].id);
      }
    } catch {
      toast.error("Не удалось загрузить точки");
    }
  }, []);

  const fetchProducts = useCallback(async (pointId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/point-products?pointId=${pointId}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Не удалось загрузить товары");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  useEffect(() => {
    if (selectedPointId) {
      fetchProducts(selectedPointId);
    }
  }, [selectedPointId, fetchProducts]);

  function openCreate() {
    setEditingProduct(null);
    setName("");
    setPrice("");
    setDescription("");
    setImage("");
    setCategoryId("");
    setDialogOpen(true);
  }

  function openEdit(product: PointProduct) {
    setEditingProduct(product);
    setName(product.name);
    setPrice(String(product.price));
    setDescription(product.description ?? "");
    setImage(product.image ?? "");
    setCategoryId(product.categoryId);
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !price || !categoryId) {
      toast.error("Заполните обязательные поля");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Укажите корректную цену");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(
      editingProduct ? "Сохраняем изменения..." : "Создаём товар..."
    );

    try {
      if (editingProduct) {
        const res = await fetch("/api/point-products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingProduct.id,
            name: name.trim(),
            price: priceNum,
            description: description.trim() || undefined,
            image: image.trim() || undefined,
            categoryId,
          }),
        });

        if (!res.ok) throw new Error("Ошибка при обновлении");

        const updated = await res.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? updated : p))
        );
        toast.success("Товар обновлён", { id: toastId });
      } else {
        const res = await fetch("/api/point-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pointId: selectedPointId,
            name: name.trim(),
            price: priceNum,
            description: description.trim() || undefined,
            image: image.trim() || undefined,
            categoryId,
          }),
        });

        if (!res.ok) throw new Error("Ошибка при создании");

        const created = await res.json();
        setProducts((prev) => [...prev, created]);
        toast.success("Товар создан", { id: toastId });
      }

      setDialogOpen(false);
    } catch {
      toast.error(
        editingProduct
          ? "Не удалось обновить товар"
          : "Не удалось создать товар",
        { id: toastId }
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Вы уверены, что хотите удалить этот товар?"
    );
    if (!confirmed) return;

    const toastId = toast.loading("Удаляем...");
    try {
      const res = await fetch(`/api/point-products?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Ошибка при удалении");

      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Товар удалён", { id: toastId });
    } catch {
      toast.error("Не удалось удалить товар", { id: toastId });
    }
  }

  const selectedPoint = points.find((p) => p.id === selectedPointId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Товары точек</h2>
          <p className="text-sm text-muted-foreground">
            Управляйте товарами для каждой точки выдачи
          </p>
        </div>
        {selectedPointId && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить товар
          </Button>
        )}
      </div>

      {points.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Store className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg text-muted-foreground">
            Сначала создайте точки выдачи
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {points.map((point) => (
              <Button
                key={point.id}
                variant={selectedPointId === point.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPointId(point.id)}
              >
                {point.name}
              </Button>
            ))}
          </div>

          {selectedPoint && (
            <p className="text-sm text-muted-foreground">
              Товары для:{" "}
              <span className="font-medium text-foreground">
                {selectedPoint.name}
              </span>
              {" · "}
              {selectedPoint.address}, {selectedPoint.city}
            </p>
          )}

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <Skeleton className="h-32 w-full rounded-md" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg text-muted-foreground">
                Нет товаров для этой точки
              </p>
              <Button variant="outline" size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить товар
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="flex flex-col overflow-hidden"
                >
                  {product.image && (
                    <div className="relative aspect-video bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <CardContent className="flex-1 p-4 space-y-2">
                    <h3 className="font-semibold leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-primary">
                      {product.price.toLocaleString("ru-RU")} ₽
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Категория:{" "}
                      {categories.find((c) => c.id === product.categoryId)
                        ?.title ?? product.categoryId}
                    </p>
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEdit(product)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Изменить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                      Удалить
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Редактировать товар" : "Добавить товар"}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct
                    ? "Измените данные товара"
                    : `Новый товар для точки: ${selectedPoint?.name}`}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pp-name">Название *</Label>
                  <Input
                    id="pp-name"
                    placeholder="Пицца Маргарита"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pp-price">Цена *</Label>
                  <Input
                    id="pp-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="499"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pp-category">Категория *</Label>
                  <Select
                    value={categoryId}
                    onValueChange={(v) => v && setCategoryId(v)}
                  >
                    <SelectTrigger id="pp-category">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pp-description">Описание</Label>
                  <Textarea
                    id="pp-description"
                    placeholder="Краткое описание товара"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pp-image">URL изображения</Label>
                  <Input
                    id="pp-image"
                    placeholder="https://example.com/image.jpg"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving
                    ? "Сохраняем..."
                    : editingProduct
                      ? "Сохранить изменения"
                      : "Добавить товар"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
