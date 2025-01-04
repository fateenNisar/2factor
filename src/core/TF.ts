import { Base } from '../config/base';
import { z } from 'zod';
import {
  constructorSchema,
  sendAndReturnOTPSchema,
  sendCustomOTPSchema,
  sendOTPSchema,
  verifyByPhoneSchema,
  verifyByUIDSchema,
} from '../utils/schema';
import { api } from '../config/axios';
import {
  gen4DigitOTPUrl,
  gen6DigitOTPUrl,
  genAndReturnOTPUrl,
  genCustomOTPUrl,
  genVerifybyPhoneUrl,
  genVerifybyUIDUrl,
} from '../config/urls';
import { TFError } from '../lib/error';
import { rateLimit } from '../lib/redis';

// 2 factor api response
interface APIResponse {
  Status: 'Success' | 'Error';
  Details: string;
  OTP?: string;
}

export class TWOFactor extends Base {
  private apiKey: string;
  private upstashUrl?: string;
  private upstashToken?: string;
  private constructor(data: {
    apiKey: string;
    upstashUrl?: string;
    upstashToken?: string;
  }) {
    const { apiKey, upstashToken, upstashUrl } = data;
    super();
    this.apiKey = apiKey;
    this.upstashToken = upstashToken;
    this.upstashUrl = upstashUrl;
  }
  static init(data: z.infer<typeof constructorSchema>): TWOFactor {
    const result = constructorSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.message);
    }
    return new TWOFactor(data);
  }
  async sendOTP(data: z.infer<typeof sendOTPSchema>) {
    try {
      const {
        phoneNumber,
        templateName,
        otpLength = 4,
        interval,
        limit,
      } = data;
      sendOTPSchema.parse({
        phoneNumber: data.phoneNumber,
        templateName: data.templateName,
      });

      // check rate limit if redis url is provided
      if (this.upstashUrl && this.upstashToken) {
        await rateLimit({
          interval: interval || '30 s',
          limit: limit || 1,
          phoneNumber,
          token: this.upstashToken,
          url: this.upstashUrl,
        });
      }
      const urlOptions = { phoneNumber, templateName, apiKey: this.apiKey };
      const url =
        otpLength === 4
          ? gen4DigitOTPUrl(urlOptions)
          : gen6DigitOTPUrl(urlOptions);

      const response = await api.get(url);
      if (response && response.data) {
        const data: APIResponse = response.data;

        if (data.Status === 'Success') {
          return { UID: data.Details };
        } else if (data.Status === 'Error') {
          throw new TFError(data.Details);
        }
      }
    } catch (error) {
      throw error;
    }
  }
  async sendAndReturnOTP(data: z.infer<typeof sendAndReturnOTPSchema>) {
    try {
      const { phoneNumber, templateName, interval, limit } = data;
      sendAndReturnOTPSchema.parse({
        phoneNumber: data.phoneNumber,
        templateName: data.templateName,
      });
      // check rate limit if redis url is provided
      if (this.upstashUrl && this.upstashToken) {
        await rateLimit({
          interval: interval || '30 s',
          limit: limit || 1,
          phoneNumber,
          token: this.upstashToken,
          url: this.upstashUrl,
        });
      }
      const urlOptions = { phoneNumber, templateName, apiKey: this.apiKey };
      const url = genAndReturnOTPUrl(urlOptions);

      const response = await api.get(url);
      if (response && response.data) {
        const data: APIResponse = response.data;

        if (data.Status === 'Success') {
          return { OTP: data.OTP!, UID: data.Details };
        } else if (data.Status === 'Error') {
          throw new TFError(data.Details);
        }
      }
    } catch (error) {
      throw error;
    }
  }
  async sendCustomOTP(data: z.infer<typeof sendCustomOTPSchema>) {
    try {
      const { phoneNumber, templateName, otp, interval, limit } = data;
      sendCustomOTPSchema.parse(data);

      // check rate limit if redis url is provided
      if (this.upstashUrl && this.upstashToken) {
        await rateLimit({
          interval: interval || '30 s',
          limit: limit || 1,
          phoneNumber,
          token: this.upstashToken,
          url: this.upstashUrl,
        });
      }

      const urlOptions = {
        phoneNumber,
        templateName,
        apiKey: this.apiKey,
        otp,
      };
      const url = genCustomOTPUrl(urlOptions);

      const response = await api.get(url);
      if (response && response.data) {
        const data: APIResponse = response.data;

        if (data.Status === 'Success') {
          return { UID: data.Details };
        } else if (data.Status === 'Error') {
          throw new TFError(data.Details);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async verifyByUID(data: z.infer<typeof verifyByUIDSchema>) {
    try {
      const { otp, UID } = data;
      verifyByUIDSchema.parse(data);

      const urlOptions = { apiKey: this.apiKey, otp, UID };
      const url = genVerifybyUIDUrl(urlOptions);

      const response = await api.get(url);
      if (response && response.data) {
        const data: APIResponse = response.data;

        if (data.Status === 'Success') {
          return true;
        } else if (data.Status === 'Error') {
          return;
      }
      }
    } catch (err) {
      throw err;
    }
  }

  async verifyByPhone(data: z.infer<typeof verifyByPhoneSchema>) {
    try {
      const { otp, phoneNumber } = data;
      verifyByPhoneSchema.parse(data);
      const urlOptions = { apiKey: this.apiKey, otp, phone: phoneNumber };
      const url = genVerifybyPhoneUrl(urlOptions);

      const response = await api.get(url);
      if (response && response.data) {
        const data: APIResponse = response.data;

        if (data.Status === 'Success') {
          return true;
        } else if (data.Status === 'Error') {
          return;
        }
      }
    } catch (err) {
      throw err;
    }
  }
}
