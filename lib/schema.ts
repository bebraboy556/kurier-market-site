import {
  type KeySchemaElement,
  type AttributeDefinition,
  type GlobalSecondaryIndex,
} from "@aws-sdk/client-dynamodb";

export const TableName = {
  SERVICES: "services",
  ORDERS: "orders",
  USERS: "users",
  PICKUP_POINTS: "pickup_points",
  POINT_PRODUCTS: "point_products",
  COURIERS: "couriers",
} as const;

export type TableName = (typeof TableName)[keyof typeof TableName];

export interface TableSchema {
  name: TableName;
  keySchema: KeySchemaElement[];
  attributeDefinitions: AttributeDefinition[];
  globalSecondaryIndexes?: GlobalSecondaryIndex[];
}

export const TABLE_SCHEMAS: Record<TableName, TableSchema> = {
  [TableName.SERVICES]: {
    name: TableName.SERVICES,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "status", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "status-index",
        KeySchema: [{ AttributeName: "status", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.ORDERS]: {
    name: TableName.ORDERS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "createdAt", AttributeType: "S" },
      { AttributeName: "courierId", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "createdAt-index",
        KeySchema: [{ AttributeName: "createdAt", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
      {
        IndexName: "courierId-index",
        KeySchema: [{ AttributeName: "courierId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.USERS]: {
    name: TableName.USERS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "email", AttributeType: "S" },
      { AttributeName: "phone", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "email-index",
        KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
      {
        IndexName: "phone-index",
        KeySchema: [{ AttributeName: "phone", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.PICKUP_POINTS]: {
    name: TableName.PICKUP_POINTS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
  },
  [TableName.POINT_PRODUCTS]: {
    name: TableName.POINT_PRODUCTS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "pointId", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "pointId-index",
        KeySchema: [{ AttributeName: "pointId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.COURIERS]: {
    name: TableName.COURIERS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
  },
};

export const TABLE_NAMES: TableName[] = Object.values(TableName);

export const IndexName = {
  SERVICES_STATUS: "status-index",
  ORDERS_CREATED_AT: "createdAt-index",
  ORDERS_COURIER_ID: "courierId-index",
  USERS_EMAIL: "email-index",
  USERS_PHONE: "phone-index",
  POINT_PRODUCTS_POINT_ID: "pointId-index",
} as const;

export type IndexName = (typeof IndexName)[keyof typeof IndexName];
