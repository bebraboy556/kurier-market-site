import {
  UtensilsCrossed,
  ShoppingCart,
  Package,
  Flower2,
  Zap,
  ShieldCheck,
  Headphones,
  MapPin,
  ChevronRight,
  ArrowRight,
  Star,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deliveryServices, advantages, steps, stats } from "@/lib/data";

const serviceIcons: Record<string, React.ReactNode> = {
  UtensilsCrossed: <UtensilsCrossed className="h-8 w-8" />,
  ShoppingCart: <ShoppingCart className="h-8 w-8" />,
  Package: <Package className="h-8 w-8" />,
  Flower2: <Flower2 className="h-8 w-8" />,
};

const advantageIcons: Record<string, React.ReactNode> = {
  Zap: <Zap className="h-6 w-6" />,
  ShieldCheck: <ShieldCheck className="h-6 w-6" />,
  Headphones: <Headphones className="h-6 w-6" />,
  MapPin: <MapPin className="h-6 w-6" />,
};

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="gradient-hero-vibrant pattern-grid">
        <div className="container mx-auto px-4 py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 pulse-dot" />
              Работаем по всему городу
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Доставим всё, что нужно
              <span className="block text-primary">быстро и с заботой</span>
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
              Закажите доставку еды, продуктов, посылок или цветов. Надёжные
              курьеры, отслеживание в реальном времени и поддержка 24/7.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/order"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors h-12 w-full sm:w-auto"
              >
                Оформить заказ
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#services"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-8 py-3 text-base font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors h-12 w-full sm:w-auto"
              >
                Наши услуги
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Наши услуги
          </h2>
          <p className="text-lg text-muted-foreground">
            Выберите подходящий тип доставки — займёмся остальным
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {deliveryServices.map((service) => (
            <Link key={service.id} href={`/order?type=${service.id}`}>
              <Card className="card-hover h-full group cursor-pointer">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {serviceIcons[service.icon]}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{service.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-primary">
                    {service.price}
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const statsData = [
    { value: stats.orders, label: "Выполненных заказов" },
    { value: stats.couriers, label: "Курьеров" },
    { value: stats.clients, label: "Довольных клиентов" },
    { value: stats.cities, label: "Города" },
  ];

  return (
    <section className="border-y bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {statsData.map((stat) => (
            <div key={stat.label} className="text-center space-y-2">
              <div className="text-3xl sm:text-4xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AdvantagesSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Почему выбирают нас
          </h2>
          <p className="text-lg text-muted-foreground">
            Мы делаем всё, чтобы ваш заказ пришёл вовремя и в идеальном
            состоянии
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map((advantage) => (
            <div key={advantage.id} className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {advantageIcons[advantage.icon]}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{advantage.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {advantage.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="border-t bg-muted/30 py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Как это работает
          </h2>
          <p className="text-lg text-muted-foreground">
            Всего несколько шагов — и заказ уже в пути
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative">
          {steps.map((step, index) => (
            <div key={step.id} className="relative text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  {index + 1}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Готовы сделать заказ?
            </h2>
            <p className="text-lg text-muted-foreground">
              Оставьте заявку — и мы свяжемся с вами в ближайшее время
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/order">
              <Button size="lg" className="h-12 px-8 text-base gap-2">
                Оформить заказ
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a
              href="https://2gis.ru/nahodka/geo/70000001109683072"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-8 py-3 text-base font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors h-12"
            >
              <Star className="h-5 w-5" />
              Оставить отзыв
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <StatsSection />
      <AdvantagesSection />
      <HowItWorksSection />
      <CTASection />
    </>
  );
}
