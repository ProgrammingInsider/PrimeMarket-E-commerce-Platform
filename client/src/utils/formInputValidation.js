import { z } from "zod";

export const signinValidation = z.object({
  email: z
    .string()
    .nonempty({ message: "Email is required" })
    .max(320, { message: "Email cannot exceed 320 characters" })
    .email({ message: "Email must be a valid email address" })
    .transform((value) => value.trim().toLowerCase()),

  password: z.string().nonempty({ message: "Password is required" }),
});

export const signupValidation = z
  .object({
    firstname: z
      .string()
      .nonempty({ message: "First Name is required" })
      .max(50, { message: "First Name cannot exceed 50 characters" }),

    lastname: z
      .string()
      .nonempty({ message: "Last Name is required" })
      .max(50, { message: "Last Name cannot exceed 50 characters" }),

    email: z
      .string()
      .nonempty({ message: "Email is required" })
      .max(320, { message: "Email cannot exceed 320 characters" })
      .email({ message: "Email must be a valid email address" })
      .transform((value) => value.trim().toLowerCase()),

    phone: z
      .string()
      .nonempty({ message: "Phone number is required" })
      .max(20, { message: "Phone number cannot exceed 20 characters" })
      .regex(/^\+?[0-9\s\-()]*$/, { message: "Phone number must be valid" }),

    password: z
      .string()
      .nonempty({ message: "Password is required" })
      .min(6, { message: "Password must be at least 6 characters long" })
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/,
        {
          message:
            "Password must contain one uppercase letter, one lowercase letter, one digit, and one special character",
        },
      ),

    confirmpassword: z
      .string()
      .nonempty({ message: "Confirm Password is required" })
      .min(6, {
        message: "Confirm Password must be at least 6 characters long",
      }),

    street: z
      .string()
      .nonempty({ message: "Street is required" })
      .max(150, { message: "Street cannot exceed 150 characters" }),

    city: z
      .string()
      .nonempty({ message: "City is required" })
      .max(100, { message: "City cannot exceed 100 characters" }),

    state: z
      .string()
      .nonempty({ message: "State is required" })
      .max(50, { message: "State cannot exceed 50 characters" }),

    country: z
      .string()
      .nonempty({ message: "Country is required" })
      .max(50, { message: "Country cannot exceed 50 characters" }),

    acceptTerms: z.boolean().refine((value) => value === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmpassword, {
    message: "Passwords do not match",
    path: ["confirmpassword"], // path of error
  });

export const updateUserValidation = z.object({
  firstname: z
    .string()
    .nonempty({ message: "First Name is required" })
    .max(50, { message: "First Name cannot exceed 50 characters" }),

  lastname: z
    .string()
    .nonempty({ message: "Last Name is required" })
    .max(50, { message: "Last Name cannot exceed 50 characters" }),

  email: z
    .string()
    .nonempty({ message: "Email is required" })
    .max(320, { message: "Email cannot exceed 320 characters" })
    .email({ message: "Email must be a valid email address" })
    .transform((value) => value.trim().toLowerCase()),

  phone: z
    .string()
    .nonempty({ message: "Phone number is required" })
    .max(20, { message: "Phone number cannot exceed 20 characters" })
    .regex(/^\+?[0-9\s\-()]*$/, { message: "Phone number must be valid" }),

  street: z
    .string()
    .nonempty({ message: "Street is required" })
    .max(150, { message: "Street cannot exceed 150 characters" }),

  city: z
    .string()
    .nonempty({ message: "City is required" })
    .max(100, { message: "City cannot exceed 100 characters" }),

  state: z
    .string()
    .nonempty({ message: "State is required" })
    .max(50, { message: "State cannot exceed 50 characters" }),

  postalCode: z
    .string()
    .optional()
    .refine((val) => !val || val.length <= 20, {
      message: "Postal Code cannot exceed 20 characters",
    })
    .refine((val) => !val || /^[A-Za-z0-9\s-]{3,10}$/.test(val), {
      message: "Postal Code must be valid",
    }),    

  country: z
    .string()
    .nonempty({ message: "Country is required" })
    .max(50, { message: "Country cannot exceed 50 characters" }),
});
