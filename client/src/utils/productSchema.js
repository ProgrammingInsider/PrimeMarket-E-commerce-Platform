import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .nonempty("Product name required")
    .max(255, "Maximum of 255 characters is allowed for product name"),

  description: z
    .string()
    .nonempty("Product Description required")
    .max(1000, "Maximum of 1000 characters is allowed for product description"),

  price: z.preprocess(
    (val) => parseFloat(val),
    z
      .number()
      .nonnegative("Product Price required and must be a positive number")
      .min(0, "Price less than 0 is invalid"),
  ),

  stock: z.preprocess(
    (val) => parseInt(val, 10),
    z
      .number()
      .nonnegative("Stock amount required and must be a positive integer")
      .int("Stock amount must be an integer")
      .min(0, "Stock less than 0 is invalid"),
  ),

  category: z
    .string()
    .nonempty("Category Id required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid Category Id"),

  brand: z
    .string()
    .max(100, "Maximum of 100 characters is allowed for brand")
    .optional(),

  sku: z
    .string()
    .max(50, "Maximum of 50 characters is allowed for SKU")
    .optional(),

  weight: z
    .preprocess(
      (val) => parseFloat(val),
      z
        .number()
        .nonnegative("Weight must be a positive number")
        .min(0, "Weight less than 0 is invalid"),
    )
    .optional(),

  dimensions: z
    .string()
    .max(100, "Maximum of 100 characters is allowed for dimensions")
    .optional(),
});

export default productSchema;
