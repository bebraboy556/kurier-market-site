import { docClient } from "./db";
import {
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { TableName, IndexName } from "./schema";
import { hashPassword, verifyPassword } from "./password";

export type UserRole = "client" | "admin" | "courier";

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: UserRole;
}

export async function createUser(
  data: CreateUserData
): Promise<Omit<User, "passwordHash">> {
  const now = new Date().toISOString();
  const passwordHash = await hashPassword(data.password);
  const user: User = {
    id: crypto.randomUUID(),
    name: data.name,
    email: data.email,
    phone: data.phone,
    passwordHash,
    role: data.role,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.USERS,
      Item: user,
      ConditionExpression: "attribute_not_exists(id)",
    })
  );

  const safeUser: Omit<User, "passwordHash"> = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  return safeUser;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.USERS,
      IndexName: IndexName.USERS_EMAIL,
      KeyConditionExpression: "#email = :email",
      ExpressionAttributeNames: { "#email": "email" },
      ExpressionAttributeValues: { ":email": email },
    })
  );
  return (result.Items?.[0] as User) ?? null;
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.USERS,
      IndexName: IndexName.USERS_PHONE,
      KeyConditionExpression: "#phone = :phone",
      ExpressionAttributeNames: { "#phone": "phone" },
      ExpressionAttributeValues: { ":phone": phone },
    })
  );
  return (result.Items?.[0] as User) ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.USERS,
      Key: { id },
    })
  );
  return (result.Item as User) ?? null;
}

export interface Courier {
  id: string;
  workZone: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function createCourier(
  userId: string,
  workZone: string
): Promise<Courier> {
  const now = new Date().toISOString();
  const courier: Courier = {
    id: userId,
    workZone,
    isAvailable: true,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.COURIERS,
      Item: courier,
    })
  );

  return courier;
}

export async function getCourierByUserId(
  userId: string
): Promise<Courier | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.COURIERS,
      Key: { id: userId },
    })
  );
  return (result.Item as Courier) ?? null;
}

export async function updateCourier(
  userId: string,
  data: Partial<Pick<Courier, "workZone" | "isAvailable">>
): Promise<Courier> {
  const updateExpr: string[] = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  if (data.workZone !== undefined) {
    updateExpr.push("#workZone = :workZone");
    exprValues[":workZone"] = data.workZone;
    exprNames["#workZone"] = "workZone";
  }

  if (data.isAvailable !== undefined) {
    updateExpr.push("#isAvailable = :isAvailable");
    exprValues[":isAvailable"] = data.isAvailable;
    exprNames["#isAvailable"] = "isAvailable";
  }

  updateExpr.push("updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.COURIERS,
      Key: { id: userId },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames:
        Object.keys(exprNames).length > 0 ? exprNames : undefined,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as Courier;
}

export async function getAllCouriers(): Promise<Courier[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.COURIERS,
    })
  );
  return (result.Items as Courier[]) ?? [];
}

export async function authenticateUser(
  login: string,
  password: string
): Promise<Omit<User, "passwordHash"> | null> {
  const isEmail = login.includes("@");
  const user = isEmail
    ? await getUserByEmail(login)
    : await getUserByPhone(login);

  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  const safeUser: Omit<User, "passwordHash"> = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  return safeUser;
}

export async function getAllUsers(): Promise<User[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.USERS,
    })
  );
  return (result.Items as User[]) ?? [];
}

export async function deleteUser(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TableName.USERS,
      Key: { id },
    })
  );
}

export async function updateUserRole(
  id: string,
  role: UserRole
): Promise<Omit<User, "passwordHash">> {
  const now = new Date().toISOString();
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.USERS,
      Key: { id },
      UpdateExpression: "set #role = :role, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#role": "role" },
      ExpressionAttributeValues: {
        ":role": role,
        ":updatedAt": now,
      },
      ReturnValues: "ALL_NEW",
    })
  );

  const updated = result.Attributes as User;
  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    role: updated.role,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "deploying";
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getServiceById(id: string): Promise<Service | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.SERVICES,
      Key: { id },
    })
  );
  return (result.Item as Service) ?? null;
}

export async function getServicesByStatus(status: string): Promise<Service[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.SERVICES,
      IndexName: IndexName.SERVICES_STATUS,
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
      },
    })
  );
  return (result.Items as Service[]) ?? [];
}

export async function getAllServices(): Promise<Service[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.SERVICES,
    })
  );
  return (result.Items as Service[]) ?? [];
}

export async function createService(
  data: Omit<Service, "createdAt" | "updatedAt">
): Promise<Service> {
  const now = new Date().toISOString();
  const service: Service = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.SERVICES,
      Item: service,
    })
  );

  return service;
}

export async function updateService(
  id: string,
  data: Partial<Pick<Service, "name" | "description" | "status" | "url">>
): Promise<Service> {
  const updateExpr = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  if (data.name !== undefined) {
    updateExpr.push("#name = :name");
    exprValues[":name"] = data.name;
    exprNames["#name"] = "name";
  }

  if (data.description !== undefined) {
    updateExpr.push("#description = :description");
    exprValues[":description"] = data.description;
    exprNames["#description"] = "description";
  }

  if (data.status !== undefined) {
    updateExpr.push("#status = :status");
    exprValues[":status"] = data.status;
    exprNames["#status"] = "status";
  }

  if (data.url !== undefined) {
    updateExpr.push("#url = :url");
    exprValues[":url"] = data.url;
    exprNames["#url"] = "url";
  }

  updateExpr.push("updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.SERVICES,
      Key: { id },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames:
        Object.keys(exprNames).length > 0 ? exprNames : undefined,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as Service;
}

export async function deleteService(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TableName.SERVICES,
      Key: { id },
    })
  );
}

export type DeliveryType = "food" | "groceries" | "parcels" | "flowers";

export type OrderStatus =
  "pending" | "preparing" | "in_transit" | "delivered" | "cancelled";

export interface StatusEntry {
  status: OrderStatus;
  timestamp: string;
}

export interface Order {
  id: string;
  deliveryType: DeliveryType;
  address: string;
  name: string;
  phone: string;
  comment?: string;
  courierId?: string;
  status: OrderStatus;
  statusHistory: StatusEntry[];
  createdAt: string;
  updatedAt: string;
}

export async function createOrder(
  data: Omit<
    Order,
    "createdAt" | "updatedAt" | "id" | "statusHistory" | "courierId"
  >
): Promise<Order> {
  const now = new Date().toISOString();
  const order: Order = {
    id: crypto.randomUUID(),
    ...data,
    statusHistory: [{ status: data.status, timestamp: now }],
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.ORDERS,
      Item: order,
    })
  );

  return order;
}

export async function getAllOrders(): Promise<Order[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.ORDERS,
    })
  );
  return (result.Items as Order[]) ?? [];
}

export async function updateOrderCourier(
  orderId: string,
  courierId: string | null
): Promise<Order> {
  const now = new Date().toISOString();
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.ORDERS,
      Key: { id: orderId },
      UpdateExpression: "set courierId = :courierId, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":courierId": courierId,
        ":updatedAt": now,
      },
      ReturnValues: "ALL_NEW",
    })
  );
  return result.Attributes as Order;
}

export async function getOrdersByCourierId(
  courierId: string
): Promise<Order[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.ORDERS,
      IndexName: IndexName.ORDERS_COURIER_ID,
      KeyConditionExpression: "#courierId = :courierId",
      ExpressionAttributeNames: { "#courierId": "courierId" },
      ExpressionAttributeValues: { ":courierId": courierId },
    })
  );
  return (result.Items as Order[]) ?? [];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.ORDERS,
      Key: { id },
    })
  );
  return (result.Item as Order) ?? null;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
  const now = new Date().toISOString();
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.ORDERS,
      Key: { id },
      UpdateExpression:
        "set #status = :status, updatedAt = :updatedAt, statusHistory = list_append(if_not_exists(statusHistory, :empty), :entry)",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":status": status,
        ":updatedAt": now,
        ":entry": [{ status, timestamp: now }],
        ":empty": [],
      },
      ReturnValues: "ALL_NEW",
    })
  );
  return result.Attributes as Order;
}

export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePickupPointData {
  name: string;
  address: string;
  city: string;
}

export async function getAllPickupPoints(): Promise<PickupPoint[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.PICKUP_POINTS,
    })
  );
  return (result.Items as PickupPoint[]) ?? [];
}

export async function getPickupPointById(
  id: string
): Promise<PickupPoint | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.PICKUP_POINTS,
      Key: { id },
    })
  );
  return (result.Item as PickupPoint) ?? null;
}

export async function createPickupPoint(
  data: CreatePickupPointData
): Promise<PickupPoint> {
  const now = new Date().toISOString();
  const point: PickupPoint = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.PICKUP_POINTS,
      Item: point,
    })
  );

  return point;
}

export async function updatePickupPoint(
  id: string,
  data: Partial<Pick<PickupPoint, "name" | "address" | "city">>
): Promise<PickupPoint> {
  const updateExpr: string[] = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  if (data.name !== undefined) {
    updateExpr.push("#name = :name");
    exprValues[":name"] = data.name;
    exprNames["#name"] = "name";
  }

  if (data.address !== undefined) {
    updateExpr.push("#address = :address");
    exprValues[":address"] = data.address;
    exprNames["#address"] = "address";
  }

  if (data.city !== undefined) {
    updateExpr.push("#city = :city");
    exprValues[":city"] = data.city;
    exprNames["#city"] = "city";
  }

  updateExpr.push("updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.PICKUP_POINTS,
      Key: { id },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames:
        Object.keys(exprNames).length > 0 ? exprNames : undefined,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as PickupPoint;
}

export async function deletePickupPoint(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TableName.PICKUP_POINTS,
      Key: { id },
    })
  );
}

export interface PointProduct {
  id: string;
  pointId: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePointProductData {
  pointId: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  categoryId: string;
}

export async function getPointProductsByPoint(
  pointId: string
): Promise<PointProduct[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.POINT_PRODUCTS,
      IndexName: IndexName.POINT_PRODUCTS_POINT_ID,
      KeyConditionExpression: "#pointId = :pointId",
      ExpressionAttributeNames: { "#pointId": "pointId" },
      ExpressionAttributeValues: { ":pointId": pointId },
    })
  );
  return (result.Items as PointProduct[]) ?? [];
}

export async function getAllPointProducts(): Promise<PointProduct[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.POINT_PRODUCTS,
    })
  );
  return (result.Items as PointProduct[]) ?? [];
}

export async function getPointProductById(
  id: string
): Promise<PointProduct | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.POINT_PRODUCTS,
      Key: { id },
    })
  );
  return (result.Item as PointProduct) ?? null;
}

export async function createPointProduct(
  data: CreatePointProductData
): Promise<PointProduct> {
  const now = new Date().toISOString();
  const product: PointProduct = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.POINT_PRODUCTS,
      Item: product,
    })
  );

  return product;
}

export async function updatePointProduct(
  id: string,
  data: Partial<
    Pick<
      PointProduct,
      "name" | "price" | "description" | "image" | "categoryId"
    >
  >
): Promise<PointProduct> {
  const updateExpr: string[] = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  if (data.name !== undefined) {
    updateExpr.push("#name = :name");
    exprValues[":name"] = data.name;
    exprNames["#name"] = "name";
  }

  if (data.price !== undefined) {
    updateExpr.push("#price = :price");
    exprValues[":price"] = data.price;
    exprNames["#price"] = "price";
  }

  if (data.description !== undefined) {
    updateExpr.push("#description = :description");
    exprValues[":description"] = data.description;
    exprNames["#description"] = "description";
  }

  if (data.image !== undefined) {
    updateExpr.push("#image = :image");
    exprValues[":image"] = data.image;
    exprNames["#image"] = "image";
  }

  if (data.categoryId !== undefined) {
    updateExpr.push("#categoryId = :categoryId");
    exprValues[":categoryId"] = data.categoryId;
    exprNames["#categoryId"] = "categoryId";
  }

  updateExpr.push("updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.POINT_PRODUCTS,
      Key: { id },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames:
        Object.keys(exprNames).length > 0 ? exprNames : undefined,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as PointProduct;
}

export async function deletePointProduct(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TableName.POINT_PRODUCTS,
      Key: { id },
    })
  );
}
