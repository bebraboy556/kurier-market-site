"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  UtensilsCrossed,
  ShoppingBag,
  Package,
  Flower2,
  Plus,
  Store,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Category, Product } from "@/lib/data";

const categoryIcons: Record<string, React.ReactNode> = {
  UtensilsCrossed: <UtensilsCrossed className="h-4 w-4" />,
  ShoppingCart: <ShoppingCart className="h-4 w-4" />,
  Package: <Package className="h-4 w-4" />,
  Flower2: <Flower2 className="h-4 w-4" />,
};

interface PickupPointInfo {
  id: string;
  name: string;
  address: string;
  city: string;
}

interface PointProductInfo {
  id: string;
  pointId: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  categoryId: string;
}

interface CatalogClientProps {
  categories: Category[];
  products: Product[];
}

export function CatalogClient({ categories, products }: CatalogClientProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePoint, setActivePoint] = useState<string | null>(null);
  const [pickupPoints, setPickupPoints] = useState<PickupPointInfo[]>([]);
  const [pointProducts, setPointProducts] = useState<PointProductInfo[]>([]);
  const [loadingPointProducts, setLoadingPointProducts] = useState(false);

  useEffect(() => {
    fetch("/api/pickup-points")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPickupPoints(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!activePoint) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingPointProducts(true);
    fetch(`/api/point-products?pointId=${activePoint}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          if (Array.isArray(data)) setPointProducts(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingPointProducts(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activePoint]);

  function handlePointSelect(pointId: string | null) {
    setActivePoint(pointId);
    if (pointId) {
      setActiveCategory(null);
    }
  }

  const displayProducts = activePoint
    ? pointProducts
    : activeCategory
      ? products.filter((p) => p.categoryId === activeCategory)
      : products;

  function handleAddToOrder(item: Product | PointProductInfo) {
    toast.success(`${item.name} добавлен в заказ`);
    router.push(`/order?type=${item.categoryId}`);
  }

  return (
    <div className="space-y-8">
      {pickupPoints.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Store className="h-4 w-4" />
            <span>Фильтр по точкам выдачи</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activePoint === null ? "default" : "outline"}
              size="sm"
              onClick={() => handlePointSelect(null)}
            >
              Все точки
            </Button>
            {pickupPoints.map((point) => (
              <Button
                key={point.id}
                variant={activePoint === point.id ? "default" : "outline"}
                size="sm"
                onClick={() => handlePointSelect(point.id)}
                className="gap-1.5"
              >
                <MapPin className="h-3.5 w-3.5" />
                {point.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveCategory(null)}
        >
          Все
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat.id)}
            className="gap-1.5"
          >
            {categoryIcons[cat.icon]}
            {cat.title}
          </Button>
        ))}
      </div>

      {loadingPointProducts ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Загрузка товаров...</p>
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg text-muted-foreground">
            {activePoint
              ? "В этой точке пока нет товаров"
              : "В этой категории пока нет товаров"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayProducts.map((item) => (
            <Card
              key={item.id}
              className="card-hover flex flex-col overflow-hidden group"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {"image" in item && item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Package className="h-12 w-12" />
                  </div>
                )}
                <Badge className="absolute left-2 top-2" variant="secondary">
                  {item.price.toLocaleString("ru-RU")} ₽
                </Badge>
              </div>
              <CardContent className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="font-semibold leading-tight">{item.name}</h3>
                {"description" in item && item.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  className="w-full gap-2"
                  size="sm"
                  onClick={() => handleAddToOrder(item)}
                >
                  <Plus className="h-4 w-4" />В заказ
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
