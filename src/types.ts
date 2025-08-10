import { z } from "zod";
import {
  CallToolRequestSchema,
  ToolSchema,
  ResourceSchema,
  TextResourceContentsSchema,
} from "@modelcontextprotocol/sdk/types.js";

// MongoDB Collection Schema
const MongoCollectionSchema = ResourceSchema.extend({
  collectionName: z.string(),
  databaseName: z.string(),
  indexes: z
    .array(
      z.object({
        name: z.string(),
        keys: z.record(z.union([z.number(), z.string()])),
        unique: z.optional(z.boolean()),
      }),
    )
    .optional(),
});

type MongoCollection = z.infer<typeof MongoCollectionSchema>;

// MongoDB Document Schema
const MongoDocumentSchema = TextResourceContentsSchema.extend({
  document: z.record(z.unknown()),
});

type MongoDocument = z.infer<typeof MongoDocumentSchema>;

// MongoDB Query Operators
const MongoQueryOperatorSchema = z.object({
  $eq: z.unknown().optional(),
  $gt: z.unknown().optional(),
  $gte: z.unknown().optional(),
  $in: z.array(z.unknown()).optional(),
  $lt: z.unknown().optional(),
  $lte: z.unknown().optional(),
  $ne: z.unknown().optional(),
  $nin: z.array(z.unknown()).optional(),
  $and: z.array(z.unknown()).optional(),
  $not: z.unknown().optional(),
  $nor: z.array(z.unknown()).optional(),
  $or: z.array(z.unknown()).optional(),
  $exists: z.boolean().optional(),
  $type: z.union([z.string(), z.number()]).optional(),
  $expr: z.unknown().optional(),
  $regex: z.string().optional(),
  $options: z.string().optional(),
});

type MongoQueryOperator = z.infer<typeof MongoQueryOperatorSchema>;

// MongoDB Sort Options
const MongoSortSchema = z.record(z.union([z.literal(1), z.literal(-1)]));

type MongoSort = z.infer<typeof MongoSortSchema>;

// MongoDB Query Tool Schema
const MongoQueryToolSchema = ToolSchema.extend({
  inputSchema: z.object({
    type: z.literal("object"),
    properties: z
      .object({
        collection: z.string(),
        filter: z.record(z.union([z.unknown(), MongoQueryOperatorSchema])),
        projection: z.record(z.union([z.literal(0), z.literal(1)])).optional(),
        sort: MongoSortSchema.optional(),
        limit: z.number().int().positive().optional(),
        skip: z.number().int().nonnegative().optional(),
      })
      .passthrough(),
    required: z.array(z.literal("collection")),
  }),
});

type MongoQueryTool = z.infer<typeof MongoQueryToolSchema>;

// MongoDB Aggregate Tool Schema
const MongoAggregateToolSchema = ToolSchema.extend({
  inputSchema: z.object({
    type: z.literal("object"),
    properties: z
      .object({
        collection: z.string(),
        pipeline: z.array(z.record(z.unknown())),
      })
      .passthrough(),
    required: z.array(z.literal("collection")),
  }),
});

type MongoAggregateTool = z.infer<typeof MongoAggregateToolSchema>;

// MongoDB Count Tool Schema
const MongoCountToolSchema = ToolSchema.extend({
  inputSchema: z.object({
    type: z.literal("object"),
    properties: z
      .object({
        collection: z.string(),
        filter: z
          .record(z.union([z.unknown(), MongoQueryOperatorSchema]))
          .optional(),
      })
      .passthrough(),
    required: z.array(z.literal("collection")),
  }),
});

type MongoCountTool = z.infer<typeof MongoCountToolSchema>;

// MongoDB Distinct Tool Schema
const MongoDistinctToolSchema = ToolSchema.extend({
  inputSchema: z.object({
    type: z.literal("object"),
    properties: z
      .object({
        collection: z.string(),
        field: z.string(),
        filter: z
          .record(z.union([z.unknown(), MongoQueryOperatorSchema]))
          .optional(),
      })
      .passthrough(),
    required: z.array(z.literal("collection")),
  }),
});

type MongoDistinctTool = z.infer<typeof MongoDistinctToolSchema>;

// MongoDB Call Tool Request Schema
const MongoCallToolRequestSchema = CallToolRequestSchema.extend({
  params: z.object({
    name: z.enum([
      "query",
      "aggregate",
      "update",
      "serverInfo",
      "insert",
      "createIndex",
      "count",
      "distinct",
      "listCollections",
    ]),
    arguments: z.union([
      MongoQueryToolSchema.shape.inputSchema,
      MongoAggregateToolSchema.shape.inputSchema,
      MongoCountToolSchema.shape.inputSchema,
      MongoDistinctToolSchema.shape.inputSchema,
    ]),
  }),
});

type MongoCallToolRequest = z.infer<typeof MongoCallToolRequestSchema>;

// MongoDB Error Types
const MongoErrorCodeSchema = z.enum([
  "INVALID_QUERY",
  "COLLECTION_NOT_FOUND",
  "DATABASE_NOT_FOUND",
  "INVALID_PIPELINE",
  "INVALID_PROJECTION",
  "INVALID_SORT",
  "CONNECTION_ERROR",
  "TIMEOUT",
  "UNAUTHORIZED",
]);

type MongoErrorCode = z.infer<typeof MongoErrorCodeSchema>;

const MongoErrorSchema = z.object({
  code: MongoErrorCodeSchema,
  message: z.string(),
  details: z.unknown().optional(),
});

type MongoError = z.infer<typeof MongoErrorSchema>;

// MongoDB Schema Inference Types
interface MongoFieldSchema {
  type: "string" | "number" | "boolean" | "date" | "objectId" | "array" | "object" | "null" | "mixed";
  required?: boolean;
  unique?: boolean;
  indexed?: boolean;
  items?: MongoFieldSchema;
  properties?: Record<string, MongoFieldSchema>;
}

const MongoFieldSchemaSchema: z.ZodSchema<MongoFieldSchema> = z.object({
  type: z.union([
    z.literal("string"),
    z.literal("number"),
    z.literal("boolean"),
    z.literal("date"),
    z.literal("objectId"),
    z.literal("array"),
    z.literal("object"),
    z.literal("null"),
    z.literal("mixed"),
  ]),
  required: z.boolean().optional(),
  unique: z.boolean().optional(),
  indexed: z.boolean().optional(),
  items: z.lazy((): z.ZodSchema<MongoFieldSchema> => MongoFieldSchemaSchema).optional(),
  properties: z.record(z.lazy((): z.ZodSchema<MongoFieldSchema> => MongoFieldSchemaSchema)).optional(),
});

const MongoCollectionMetadataSchema = z.object({
  name: z.string(),
  fields: z.record(MongoFieldSchemaSchema),
  options: z
    .object({
      timestamps: z.boolean().optional(),
      strict: z.boolean().optional(),
    })
    .optional(),
});

type MongoCollectionMetadata = z.infer<typeof MongoCollectionMetadataSchema>;

// Export all schemas and types
export {
  MongoCollectionSchema,
  MongoCollection,
  MongoDocumentSchema,
  MongoDocument,
  MongoQueryOperatorSchema,
  MongoQueryOperator,
  MongoSortSchema,
  MongoSort,
  MongoQueryToolSchema,
  MongoQueryTool,
  MongoAggregateToolSchema,
  MongoAggregateTool,
  MongoCountToolSchema,
  MongoCountTool,
  MongoDistinctToolSchema,
  MongoDistinctTool,
  MongoCallToolRequestSchema,
  MongoCallToolRequest,
  MongoErrorCodeSchema,
  MongoErrorCode,
  MongoErrorSchema,
  MongoError,
  MongoFieldSchemaSchema,
  MongoFieldSchema,
  MongoCollectionMetadataSchema,
  MongoCollectionMetadata,
};
