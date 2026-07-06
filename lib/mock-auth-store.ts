
import { mockUsers, type MockUser } from "./mock-data";

interface InMemoryUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: "client" | "admin" | "courier";
  createdAt: string;
  updatedAt: string;
}

interface SafeUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "client" | "admin" | "courier";
  createdAt: string;
  updatedAt: string;
}

const users: InMemoryUser[] = mockUsers.map((u: MockUser) => ({
  id: u.id,
  name: u.name,
  email: u.email || undefined,
  phone: u.phone || undefined,
  password: u.password,
  role: u.role,
  createdAt: u.createdAt,
  updatedAt: u.createdAt,
}));

function toSafeUser(u: InMemoryUser): SafeUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export function mockFindUserByEmail(email: string): SafeUser | null {
  const u = users.find((x) => x.email === email);
  return u ? toSafeUser(u) : null;
}

export function mockFindUserByPhone(phone: string): SafeUser | null {
  const u = users.find((x) => x.phone === phone);
  return u ? toSafeUser(u) : null;
}

export function mockAuthenticateUser(
  login: string,
  password: string
): SafeUser | null {
  const isEmail = login.includes("@");
  const u = isEmail
    ? users.find((x) => x.email === login)
    : users.find((x) => x.phone === login);

  if (!u) return null;
  if (u.password !== password) return null;

  return toSafeUser(u);
}

export function mockCreateUser(data: {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: "client" | "admin" | "courier";
}): SafeUser {
  const now = new Date().toISOString();
  const user: InMemoryUser = {
    id: crypto.randomUUID(),
    name: data.name,
    email: data.email,
    phone: data.phone,
    password: data.password,
    role: data.role,
    createdAt: now,
    updatedAt: now,
  };
  users.push(user);
  return toSafeUser(user);
}
