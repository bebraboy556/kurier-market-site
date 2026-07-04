// Мок-данные для статического режима (без БД)
// Используются когда USE_DATABASE=false или БД недоступна

import { Service, Order, PickupPoint, PointProduct } from "./models";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "client" | "admin" | "courier";
  createdAt: string;
}

export const mockUsers: MockUser[] = [
  {
    id: "mock-admin-1",
    name: "Администратор",
    email: "admin@kurier.market",
    phone: "+7 (924) 444-22-20",
    password: "admin123",
    role: "admin",
    createdAt: new Date("2024-01-01").toISOString(),
  },
  {
    id: "mock-client-1",
    name: "Иван Петров",
    email: "ivan@example.com",
    phone: "+7 (999) 123-45-67",
    password: "client123",
    role: "client",
    createdAt: new Date("2024-06-01").toISOString(),
  },
  {
    id: "mock-client-2",
    name: "Анна Смирнова",
    email: "anna@example.com",
    phone: "+7 (999) 234-56-78",
    password: "client123",
    role: "client",
    createdAt: new Date("2024-06-02").toISOString(),
  },
  {
    id: "mock-courier-1",
    name: "Алексей Курьер",
    email: "courier@kurier.market",
    phone: "+7 (999) 111-22-33",
    password: "courier123",
    role: "courier",
    createdAt: new Date("2024-05-01").toISOString(),
  },
  {
    id: "mock-courier-2",
    name: "Дмитрий Скороход",
    email: "dmitry@kurier.market",
    phone: "+7 (999) 222-33-44",
    password: "courier123",
    role: "courier",
    createdAt: new Date("2024-05-15").toISOString(),
  },
  {
    id: "mock-courier-3",
    name: "Елена Быстрая",
    email: "elena@kurier.market",
    phone: "+7 (999) 333-44-55",
    password: "courier123",
    role: "courier",
    createdAt: new Date("2024-06-01").toISOString(),
  },
];

export const mockServices: Service[] = [
  {
    id: "mock-service-1",
    name: "API Gateway",
    description: "Шлюз для микросервисной архитектуры",
    status: "active",
    url: "https://api.example.com",
    createdAt: new Date("2024-01-15").toISOString(),
    updatedAt: new Date("2024-01-15").toISOString(),
  },
  {
    id: "mock-service-2",
    name: "Auth Service",
    description: "Сервис аутентификации и авторизации",
    status: "active",
    url: "https://auth.example.com",
    createdAt: new Date("2024-02-01").toISOString(),
    updatedAt: new Date("2024-02-01").toISOString(),
  },
  {
    id: "mock-service-3",
    name: "ML Pipeline",
    description: "Пайплайн для обработки данных с AI",
    status: "deploying",
    url: undefined,
    createdAt: new Date("2024-03-10").toISOString(),
    updatedAt: new Date("2024-03-10").toISOString(),
  },
];

export const mockOrders: Order[] = [
  {
    id: "mock-order-1",
    deliveryType: "food",
    address: "ул. Ленина, д. 10, кв. 5",
    name: "Иван Петров",
    phone: "+7 (999) 123-45-67",
    comment: "Позвонить за 10 минут",
    courierId: "mock-courier-1",
    status: "delivered",
    statusHistory: [
      { status: "pending", timestamp: "2024-06-01T12:00:00Z" },
      { status: "preparing", timestamp: "2024-06-01T12:15:00Z" },
      { status: "in_transit", timestamp: "2024-06-01T12:45:00Z" },
      { status: "delivered", timestamp: "2024-06-01T13:30:00Z" },
    ],
    createdAt: new Date("2024-06-01T12:00:00Z").toISOString(),
    updatedAt: new Date("2024-06-01T13:30:00Z").toISOString(),
  },
  {
    id: "mock-order-2",
    deliveryType: "groceries",
    address: "пр. Мира, д. 25, под. 3",
    name: "Анна Смирнова",
    phone: "+7 (999) 234-56-78",
    comment: "",
    courierId: "mock-courier-1",
    status: "in_transit",
    statusHistory: [
      { status: "pending", timestamp: "2024-06-02T10:30:00Z" },
      { status: "preparing", timestamp: "2024-06-02T10:45:00Z" },
      { status: "in_transit", timestamp: "2024-06-02T11:00:00Z" },
    ],
    createdAt: new Date("2024-06-02T10:30:00Z").toISOString(),
    updatedAt: new Date("2024-06-02T11:00:00Z").toISOString(),
  },
  {
    id: "mock-order-3",
    deliveryType: "parcels",
    address: "ул. Пушкина, д. 5, оф. 12",
    name: "ООО «Ромашка»",
    phone: "+7 (999) 345-67-89",
    comment: "Офис с 9 до 18",
    status: "preparing",
    statusHistory: [
      { status: "pending", timestamp: "2024-06-03T09:00:00Z" },
      { status: "preparing", timestamp: "2024-06-03T09:00:00Z" },
    ],
    createdAt: new Date("2024-06-03T09:00:00Z").toISOString(),
    updatedAt: new Date("2024-06-03T09:00:00Z").toISOString(),
  },
  {
    id: "mock-order-4",
    deliveryType: "flowers",
    address: "ул. Океанская, д. 15, кв. 42",
    name: "Мария Иванова",
    phone: "+7 (999) 456-78-90",
    comment: "Букет к 18:00",
    courierId: "mock-courier-2",
    status: "in_transit",
    statusHistory: [
      { status: "pending", timestamp: "2024-06-04T14:00:00Z" },
      { status: "preparing", timestamp: "2024-06-04T14:15:00Z" },
      { status: "in_transit", timestamp: "2024-06-04T14:45:00Z" },
    ],
    createdAt: new Date("2024-06-04T14:00:00Z").toISOString(),
    updatedAt: new Date("2024-06-04T14:45:00Z").toISOString(),
  },
  {
    id: "mock-order-5",
    deliveryType: "groceries",
    address: "ул. Комсомольская, д. 8",
    name: "Сергей Петров",
    phone: "+7 (999) 567-89-01",
    comment: "",
    courierId: undefined,
    status: "pending",
    statusHistory: [{ status: "pending", timestamp: "2024-06-05T10:00:00Z" }],
    createdAt: new Date("2024-06-05T10:00:00Z").toISOString(),
    updatedAt: new Date("2024-06-05T10:00:00Z").toISOString(),
  },
];

export interface MockCourier {
  id: string;
  workZone: string;
  isAvailable: boolean;
}

export const mockCouriers: MockCourier[] = [
  {
    id: "mock-courier-1",
    workZone: "Находка",
    isAvailable: true,
  },
  {
    id: "mock-courier-2",
    workZone: "Владивосток",
    isAvailable: true,
  },
  {
    id: "mock-courier-3",
    workZone: "Находка",
    isAvailable: false,
  },
];

export const mockPickupPoints: PickupPoint[] = [
  {
    id: "mock-point-1",
    name: "Точка выдачи на Ленинской",
    address: "ул. Ленинская, д. 5",
    city: "Находка",
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString(),
  },
  {
    id: "mock-point-2",
    name: "Точка выдачи на Мира",
    address: "пр. Мира, д. 10",
    city: "Находка",
    createdAt: new Date("2024-01-15").toISOString(),
    updatedAt: new Date("2024-01-15").toISOString(),
  },
  {
    id: "mock-point-3",
    name: "Пункт выдачи в Новолитовске",
    address: "ул. Центральная, д. 1",
    city: "Новолитовск",
    createdAt: new Date("2024-02-01").toISOString(),
    updatedAt: new Date("2024-02-01").toISOString(),
  },
];

export const mockPointProducts: PointProduct[] = [
  {
    id: "mock-pp-1",
    pointId: "mock-point-1",
    name: "Пицца Маргарита",
    price: 499,
    description: "Классическая пицца с соусом, моцареллой и базиликом",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    categoryId: "food",
    createdAt: new Date("2024-06-01").toISOString(),
    updatedAt: new Date("2024-06-01").toISOString(),
  },
  {
    id: "mock-pp-2",
    pointId: "mock-point-1",
    name: "Молоко 3.2%, 1 л",
    price: 89,
    description: "Свежее молоко от местного производителя",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
    categoryId: "groceries",
    createdAt: new Date("2024-06-01").toISOString(),
    updatedAt: new Date("2024-06-01").toISOString(),
  },
  {
    id: "mock-pp-3",
    pointId: "mock-point-2",
    name: "Коробка малая",
    price: 199,
    description: "Картонная коробка 30x20x15 см",
    image:
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop",
    categoryId: "parcels",
    createdAt: new Date("2024-06-02").toISOString(),
    updatedAt: new Date("2024-06-02").toISOString(),
  },
  {
    id: "mock-pp-4",
    pointId: "mock-point-3",
    name: "Букет роз, 15 шт",
    price: 2499,
    description: "Бордовые розы в крафтовой упаковке",
    image:
      "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=300&fit=crop",
    categoryId: "flowers",
    createdAt: new Date("2024-06-03").toISOString(),
    updatedAt: new Date("2024-06-03").toISOString(),
  },
];
