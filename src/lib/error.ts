import { ZodError } from 'zod';
import { ERROR_CODES } from '../config/errors';

export class TFError extends Error {
  name: string;
  constructor(message: string) {
    super(message);
    this.name = 'TFError';
  }
}

export const handleTFError = (error: unknown) => {
  if (error instanceof TFError) {
    if (
      error.message === 'INVALID_PHONE_NUMBER' ||
      error.message === 'INVALID_OTP_LENGTH' ||
      error.message === 'OTP_MISMATCHED' ||
      error.message === 'OTP_EXPIRED' ||
      error.message === 'OTP limit reached'
    ) {
      return { error: error.message, name: error.name };
    }
  }
  if (error instanceof ZodError)
  {
     const allErrors = error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");
    return { error: allErrors, name: error.name };
  }

  
};
