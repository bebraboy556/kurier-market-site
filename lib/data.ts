export interface DeliveryService {
  id: string;
  title: string;
  description: string;
  icon: string;
  price: string;
}

export interface Advantage {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Step {
  id: string;
  title: string;
  description: string;
}

export const deliveryServices: DeliveryService[] = [
  {
    id: "food",
    title: "Доставка еды",
    description:
      "Горячие обеды, пицца, суши и любимые блюда из ресторанов рядом с вами.",
    icon: "UtensilsCrossed",
    price: "от 199 ₽",
  },
  {
    id: "groceries",
    title: "Доставка продуктов",
    description:
      "Свежие продукты, напитки и товары первой необходимости с доставкой на дом.",
    icon: "ShoppingCart",
    price: "от 99 ₽",
  },
  {
    id: "parcels",
    title: "Доставка посылок",
    description: "Быстрая и надёжная доставка документов и посылок по городу.",
    icon: "Package",
    price: "от 299 ₽",
  },
  {
    id: "flowers",
    title: "Доставка цветов",
    description: "Свежие букеты и цветочные композиции с бережной доставкой.",
    icon: "Flower2",
    price: "от 499 ₽",
  },
];

export const advantages: Advantage[] = [
  {
    id: "speed",
    title: "Быстрая доставка",
    description:
      "Доставляем заказы в течение 30–60 минут в любой район города.",
    icon: "Zap",
  },
  {
    id: "quality",
    title: "Надёжность",
    description: "Более 500 довольных клиентов. Все курьеры проходят проверку.",
    icon: "ShieldCheck",
  },
  {
    id: "support",
    title: "Поддержка 24/7",
    description: "Всегда на связи. Решаем любые вопросы в любое время суток.",
    icon: "Headphones",
  },
  {
    id: "tracking",
    title: "Отслеживание",
    description:
      "Следите за заказом в реальном времени от принятия до доставки.",
    icon: "MapPin",
  },
];

export const steps: Step[] = [
  {
    id: "choose",
    title: "Выберите тип доставки",
    description:
      "Еда, продукты, посылки или цветы — мы доставим всё, что нужно.",
  },
  {
    id: "order",
    title: "Заполните форму",
    description:
      "Укажите адрес, контактные данные и оставьте комментарий к заказу.",
  },
  {
    id: "deliver",
    title: "Получите заказ",
    description:
      "Курьер доставит заказ по указанному адресу в кратчайшие сроки.",
  },
  {
    id: "track",
    title: "Отслеживайте статус",
    description: "В любой момент проверьте статус заказа по его номеру.",
  },
];

export const stats = {
  orders: "5 000+",
  couriers: "20+",
  clients: "500+",
  cities: "6",
};

export interface Category {
  id: string;
  title: string;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  categoryId: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  basePrice: number;
}

export const deliveryZones: DeliveryZone[] = [
  { id: "nahodka", name: "Находка", basePrice: 250 },
  { id: "novolitovsk", name: "Новолитовск", basePrice: 400 },
  { id: "volchanets", name: "Волчанец", basePrice: 700 },
  { id: "livadiya", name: "Ливадия", basePrice: 800 },
  { id: "vrangeL", name: "Врангель", basePrice: 800 },
  { id: "ekaterinovka", name: "Екатериновка", basePrice: 600 },
];

export interface ContactInfo {
  orderPhone: string;
  dispatcherPhone: string;
  email: string;
  address: string;
  socials: { label: string; url: string; icon: string }[];
  workSchedule: { days: string; hours: string }[];
  deliveryZone: string;
  deliveryZonePrices: DeliveryZone[];
  appStoreUrl: string;
  coordinates: { lat: number; lng: number };
}

export const contactInfo: ContactInfo = {
  orderPhone: "8-924-444-22-20",
  dispatcherPhone: "602-602",
  email: "info@kurier-market.ru",
  address: "г. Находка, ул. Ленинская, д. 5",
  socials: [
    { label: "Telegram", url: "https://t.me/kurier_market", icon: "Send" },
    {
      label: "WhatsApp",
      url: "https://wa.me/79244442220",
      icon: "MessageCircle",
    },
    { label: "VK", url: "https://vk.com/kurier_market", icon: "Vk" },
  ],
  workSchedule: [
    { days: "Пн–Пт", hours: "08:00 – 22:00" },
    { days: "Сб", hours: "09:00 – 21:00" },
    { days: "Вс", hours: "10:00 – 20:00" },
  ],
  deliveryZone:
    "Осуществляем доставку по г. Находка и ближайшим населённым пунктам.",
  deliveryZonePrices: deliveryZones,
  appStoreUrl: "https://kurier-market.ru/download",
  coordinates: { lat: 42.8241, lng: 132.8927 },
};

export const categories: Category[] = [
  { id: "food", title: "Еда", icon: "UtensilsCrossed" },
  { id: "groceries", title: "Продукты", icon: "ShoppingCart" },
  { id: "parcels", title: "Посылки", icon: "Package" },
  { id: "flowers", title: "Цветы", icon: "Flower2" },
];

const productImages: Record<string, string> = {
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
  groceries:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
  parcels:
    "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop",
  flowers:
    "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=300&fit=crop",
};

export const products: Product[] = [
  {
    id: "pizza-margherita",
    name: "Пицца Маргарита",
    price: 499,
    description: "Классическая пицца с соусом, моцареллой и базиликом",
    image: productImages.food,
    categoryId: "food",
  },
  {
    id: "pizza-pepperoni",
    name: "Пицца Пепперони",
    price: 599,
    description: "Пицца с пепперони, сыром и томатным соусом",
    image: productImages.food,
    categoryId: "food",
  },
  {
    id: "sushi-set",
    name: "Сет суши",
    price: 899,
    description: "Ассорти из 24 штук: нигири, роллы и гунканы",
    image: productImages.food,
    categoryId: "food",
  },
  {
    id: "poke-bowl",
    name: "Поу-боул с лососем",
    price: 449,
    description: "Рис, лосось, авокадо, огурец, соус спайси",
    image: productImages.food,
    categoryId: "food",
  },
  {
    id: "milk-1l",
    name: "Молоко 3.2%, 1 л",
    price: 89,
    description: "Свежее молоко от местного производителя",
    image: productImages.groceries,
    categoryId: "groceries",
  },
  {
    id: "bread",
    name: "Хлеб бородинский",
    price: 59,
    description: "Ржаной хлеб по традиционному рецепту",
    image: productImages.groceries,
    categoryId: "groceries",
  },
  {
    id: "eggs-10",
    name: "Яйца куриные, 10 шт",
    price: 129,
    description: "Отборные яйца категории С1",
    image: productImages.groceries,
    categoryId: "groceries",
  },
  {
    id: "apple-kg",
    name: "Яблоки, 1 кг",
    price: 149,
    description: "Сочные красные яблоки",
    image: productImages.groceries,
    categoryId: "groceries",
  },
  {
    id: "box-s",
    name: "Коробка малая",
    price: 199,
    description: "Картонная коробка 30×20×15 см для небольших посылок",
    image: productImages.parcels,
    categoryId: "parcels",
  },
  {
    id: "box-m",
    name: "Коробка средняя",
    price: 299,
    description: "Картонная коробка 40×30×20 см для посылок среднего размера",
    image: productImages.parcels,
    categoryId: "parcels",
  },
  {
    id: "box-l",
    name: "Коробка большая",
    price: 399,
    description: "Картонная коробка 60×40×30 см для крупных посылок",
    image: productImages.parcels,
    categoryId: "parcels",
  },
  {
    id: "envelope",
    name: "Конверт курьерский",
    price: 99,
    description: "Непромокаемый конверт для документов формата А4",
    image: productImages.parcels,
    categoryId: "parcels",
  },
  {
    id: "rose-bouquet",
    name: "Букет роз, 15 шт",
    price: 2499,
    description: "Бордовые розы в крафтовой упаковке",
    image: productImages.flowers,
    categoryId: "flowers",
  },
  {
    id: "tulip-bouquet",
    name: "Букет тюльпанов, 9 шт",
    price: 1499,
    description: "Разноцветные тюльпаны, сезонные",
    image: productImages.flowers,
    categoryId: "flowers",
  },
  {
    id: "lily-bouquet",
    name: "Букет лилий, 7 шт",
    price: 1999,
    description: "Белые лилии с зеленью",
    image: productImages.flowers,
    categoryId: "flowers",
  },
  {
    id: "chamomile-bouquet",
    name: "Букет ромашек, 21 шт",
    price: 999,
    description: "Полевые ромашки в льняной ленте",
    image: productImages.flowers,
    categoryId: "flowers",
  },
];
