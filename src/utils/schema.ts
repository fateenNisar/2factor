import { z } from 'zod';
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
  .regex(/^[7-9]{1}[0-9]{9}$/, { message: 'Invalid phone number' });

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
  otp: z.string().regex(/^\d{4}(\d{2})?$/, {
    message:
      'Invalid Otp . OTP must be 4 or 6 characters and contain only numbers',
  }),
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
  otp: z.string().regex(/^\d{4,6}$/, 'OTP must be 4 or 6 digits long'),
  UID: z
    .string()
    .min(36, { message: 'Invalid UID length' })
    .max(36, { message: 'Invalid UID length' }),
});
export const verifyByPhoneSchema = z.object({
  otp: z.string().regex(/^\d{4,6}$/, 'OTP must be 4 or 6 digits long'),
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
