# Dynamic Filter Schema Generator

## Goal

Create a `createFiltersFromSchema` function in [`src/scripts/singleinhritance/zodSchema.ts`](src/scripts/singleinhritance/zodSchema.ts) that takes a Zod schema shape and generates appropriate filter schemas by introspecting each field's type.

## Implementation Steps

### 1. Create Schema Unwrapping Utility

Create a helper function `unwrapZodSchema` to strip away Zod wrappers (nullable, optional, default) and get the base schema type:

```typescript
function unwrapZodSchema(schema: z.ZodTypeAny): z.ZodTypeAny {
  if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional) {
    return unwrapZodSchema(schema.unwrap());
  }
  if (schema instanceof z.ZodDefault) {
    return unwrapZodSchema(schema._def.innerType);
  }
  return schema;
}
```



### 2. Create Type Detection Function

Create `inferFieldType` to map Zod schema instances to the existing `FieldType`:

```typescript
function inferFieldType(schema: z.ZodTypeAny): FieldType | "enum" | null {
  const base = unwrapZodSchema(schema);
  if (base instanceof z.ZodString) return "string";
  if (base instanceof z.ZodNumber) return "number";
  if (base instanceof z.ZodBoolean) return "boolean";
  if (base instanceof z.ZodDate) return "date";
  if (base instanceof z.ZodEnum) return "enum";
  // UUID detection via refinement check
  if (base._def.typeName === "ZodString" && base._def.checks?.some(c => c.kind === "uuid")) 
    return "uuid";
  return null;
}
```



### 3. Modify `getFilterSchema` to Accept Schema Overrides

Update `getFilterSchema` to optionally accept a base Zod schema for value inference (critical for enum support):

```typescript
const getFilterSchema = <T extends z.ZodTypeAny>(
  fieldType: FieldType | "enum",
  baseSchema?: T
) => {
  // For enums, use the actual enum schema for value validation
  const fieldSchema = fieldType === "enum" && baseSchema 
    ? baseSchema 
    : fieldSchemaByType[fieldType as FieldType];
  
  const possibleOperators = fieldType === "enum"
    ? z.enum(["eq", "ne"])  // Enums only support eq/ne
    : possibleOperatorsByFieldType[fieldType as FieldType];
  // ... rest of existing logic
};
```



### 4. Create `createFiltersFromSchema` Function

The main utility function:

```typescript
function createFiltersFromSchema<T extends z.ZodRawShape>(shape: T) {
  const filters: Record<string, z.ZodTypeAny> = {};
  
  for (const [key, schema] of Object.entries(shape)) {
    const fieldType = inferFieldType(schema);
    if (fieldType) {
      const baseSchema = unwrapZodSchema(schema);
      filters[key] = getFilterSchema(fieldType, baseSchema);
    }
  }
  
  return filters;
}

```