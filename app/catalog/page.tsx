import { ShoppingBag } from "lucide-react";
import { categories, products } from "@/lib/data";
import { CatalogClient } from "@/components/catalog-client";

export default function CatalogPage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="space-y-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Каталог товаров
              </h1>
              <p className="text-lg text-muted-foreground">
                Выберите товары и добавьте их в заказ
              </p>
            </div>
          </div>
        </div>

        <CatalogClient categories={categories} products={products} />
      </div>
    </div>
  );
}
