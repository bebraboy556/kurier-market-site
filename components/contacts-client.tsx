"use client";

import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Map,
  Send,
  MessageCircle,
  Globe,
  ChevronDown,
  Smartphone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ContactInfo } from "@/lib/data";
import { useState } from "react";

const socialIcons: Record<string, React.ReactNode> = {
  Send: <Send className="h-4 w-4" />,
  MessageCircle: <MessageCircle className="h-4 w-4" />,
  Vk: <Globe className="h-4 w-4" />,
};

interface ContactsClientProps {
  info: ContactInfo;
}

export function ContactsClient({ info }: ContactsClientProps) {
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Контакты
        </h1>
        <p className="text-lg text-muted-foreground">
          Свяжитесь с нами любым удобным способом
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Phone className="h-4 w-4" />
              </div>
              <CardTitle>Телефон</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Заказы</p>
                <a
                  href={`tel:${info.orderPhone.replace(/[^+\d]/g, "")}`}
                  className="text-lg font-medium text-primary hover:underline"
                >
                  {info.orderPhone}
                </a>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Диспетчер</p>
                <a
                  href={`tel:${info.dispatcherPhone.replace(/[^+\d]/g, "")}`}
                  className="text-lg font-medium text-primary hover:underline"
                >
                  {info.dispatcherPhone}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </div>
              <CardTitle>Email</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <a
              href={`mailto:${info.email}`}
              className="text-lg font-medium text-primary hover:underline"
            >
              {info.email}
            </a>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-4 w-4" />
            </div>
            <CardTitle>Адрес</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{info.address}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock className="h-4 w-4" />
            </div>
            <CardTitle>Режим работы</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {info.workSchedule.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5"
              >
                <span className="font-medium">{item.days}</span>
                <Badge variant="outline" className="text-sm">
                  {item.hours}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Map className="h-4 w-4" />
            </div>
            <CardTitle>Зона доставки</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{info.deliveryZone}</p>

          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left font-medium">
                    Направление
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">Цена</th>
                </tr>
              </thead>
              <tbody>
                {info.deliveryZonePrices.map((zone) => (
                  <tr key={zone.id} className="border-b last:border-0">
                    <td className="px-4 py-2.5">{zone.name}</td>
                    <td className="px-4 py-2.5 text-right">
                      от {zone.basePrice} ₽
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() => setMapOpen(!mapOpen)}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            {mapOpen ? "Скрыть карту" : "Показать зону на карте"}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                mapOpen && "rotate-180"
              )}
            />
          </button>

          {mapOpen && (
            <div className="overflow-hidden rounded-xl border">
              <iframe
                title="Зона доставки"
                src={`https://yandex.ru/map-widget/v1/?ll=${info.coordinates.lng}%2C${info.coordinates.lat}&z=12&l=map`}
                width="100%"
                height="350"
                className="border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Send className="h-4 w-4" />
            </div>
            <CardTitle>Социальные сети</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {info.socials.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {socialIcons[social.icon]}
                {social.label}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Smartphone className="h-4 w-4" />
            </div>
            <CardTitle>Мобильное приложение</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Установите наше приложение для быстрого и удобного оформления
            заказов.
          </p>
          <a
            href={info.appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Smartphone className="h-4 w-4" />
            Скачать приложение
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
