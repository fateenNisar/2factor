import { z } from 'zod';

const otpSchema = z.string().refine(
  (val) => {
    // Check if it's only numbers
    const isNumeric = /^\d+$/.test(val)
    // Check if length is 4 or 6
    const validLength = val.length === 4 || val.length === 6
    return isNumeric && validLength
  },
  {
    message: "OTP must be either 4 or 6 digits and contain only numbers"
  }
)
export const constructorSchema = z
  .object({
    apiKey: z.string(),
    upstashUrl: z.string().url({ message: 'Invalid Redis URL' }).optional(),
    upstashToken: z
      .string()
      .min(58, { message: 'Invalid token length' })
      .max(58, { message: 'Invalid token length' })
      .optional(),
  })
  .refine((data) => {
    return (
      (data.upstashUrl && data.upstashToken) || (!data.upstashUrl && !data.upstashToken)
    );
  });
export const phoneSchema = z
  .string()
  .regex(/^[6-9]{1}[0-9]{9}$/, { message: 'Invalid phone number' });

export const sendOTPSchema = z.object({
  phoneNumber: phoneSchema,
  templateName: z.string().optional(),
  otpLength: z
    .number()
    .refine((value) => value === 4 || value === 6, {
      message: 'Invalid OTP length. Must be either 4 or 6.',
    })
    .optional(),
  interval: z
    .string()
    .regex(/^\d+\s[smhd]$/, {
      message:
        "Invalid format. Must be in the format '<number> <unit>' where unit is one of s, m, h, or d.",
    })
    .optional(),
  limit: z.number().optional(),
}).refine((data) => {
  return data.interval && data.limit || !data.interval && !data.limit;
})
export const sendAndReturnOTPSchema = z.object({
  phoneNumber: phoneSchema,
  templateName: z.string().optional(),
  interval: z
    .string()
    .regex(/^\d+\s[smhd]$/, {
      message:
        "Invalid format. Must be in the format '<number> <unit>' where unit is one of s, m, h, or d.",
    })
    .optional(),
  limit: z.number().optional(),
}).refine((data) => {
  return data.interval && data.limit || !data.interval && !data.limit;
})

export const sendCustomOTPSchema = z.object({
  phoneNumber: phoneSchema,
  templateName: z.string().optional(),
  otp:otpSchema,
  interval: z
    .string()
    .regex(/^\d+\s[smhd]$/, {
      message:
        "Invalid format. Must be in the format '<number> <unit>' where unit is one of s, m, h, or d.",
    })
    .optional(),
  limit: z.number().optional(),
}).refine((data) => {
  return data.interval && data.limit || !data.interval && !data.limit;
})

export const verifyByUIDSchema = z.object({
  otp:otpSchema,
  UID: z
    .string()
    .min(36, { message: 'Invalid UID length' })
    .max(36, { message: 'Invalid UID length' }),
});
export const verifyByPhoneSchema = z.object({
  otp:otpSchema,
  phoneNumber: phoneSchema,
});

export const rateLimitSchema = z.object({
  url: z.string().url({ message: 'Invalid Redis URL' }),
  token: z
    .string()
    .min(58, { message: 'Invalid token length' })
    .max(58, { message: 'Invalid token length' }),
  interval: z.string().regex(/^\d+\s[smhd]$/, {
    message:
      "Invalid format. Must be in the format '<number> <unit>' where unit is one of s, m, h, or d.",
  }),
  limit: z.number(),
  phoneNumber: phoneSchema,
});
