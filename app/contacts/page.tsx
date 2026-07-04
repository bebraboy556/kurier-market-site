import { Phone } from "lucide-react";
import { contactInfo } from "@/lib/data";
import { ContactsClient } from "@/components/contacts-client";

export default function ContactsPage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Контакты
            </h1>
            <p className="text-lg text-muted-foreground">
              Свяжитесь с нами любым удобным способом
            </p>
          </div>
        </div>
        <ContactsClient info={contactInfo} />
      </div>
    </div>
  );
}
