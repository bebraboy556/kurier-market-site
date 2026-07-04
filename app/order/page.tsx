import { UtensilsCrossed, ShoppingCart, Package, Flower2 } from "lucide-react";
import { deliveryServices } from "@/lib/data";
import { OrderForm } from "@/components/order-form";

const serviceIcons: Record<string, React.ReactNode> = {
  UtensilsCrossed: <UtensilsCrossed className="h-8 w-8" />,
  ShoppingCart: <ShoppingCart className="h-8 w-8" />,
  Package: <Package className="h-8 w-8" />,
  Flower2: <Flower2 className="h-8 w-8" />,
};

export default function OrderPage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="space-y-4 mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Оформить заказ
          </h1>
          <p className="text-lg text-muted-foreground">
            Заполните форму — и мы свяжемся с вами
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-4 mb-10">
          {deliveryServices.map((service) => (
            <div
              key={service.id}
              className="flex flex-col items-center text-center gap-2 rounded-lg border p-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {serviceIcons[service.icon]}
              </div>
              <div className="text-sm font-medium">{service.title}</div>
              <div className="text-xs text-muted-foreground">
                {service.price}
              </div>
            </div>
          ))}
        </div>

        <OrderForm />
      </div>
    </div>
  );
}
