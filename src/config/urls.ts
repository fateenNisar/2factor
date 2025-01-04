export const BASE_URL = 'https://2factor.in/API/V1/';
export const gen4DigitOTPUrl = (data: {
  phoneNumber: string;
  apiKey: string;
  templateName?: string;
}) => {
  const { phoneNumber, templateName, apiKey } = data;
  return `${apiKey}/SMS/${phoneNumber}/AUTOGEN3/${templateName}`;
};

export const gen6DigitOTPUrl = (data: {
  phoneNumber: string;
  apiKey: string;
  templateName?: string;
}) => {
  const { phoneNumber, templateName, apiKey } = data;
  return `${apiKey}/SMS/${phoneNumber}/AUTOGEN/${templateName}`;
};

export const genAndReturnOTPUrl = (data: {
  phoneNumber: string;
  apiKey: string;
  templateName?: string;
}) => {
  const { phoneNumber, templateName, apiKey } = data;
  return `${apiKey}/SMS/${phoneNumber}/AUTOGEN2/${templateName}`;
};

export const genCustomOTPUrl = (data: {
  phoneNumber: string;
  apiKey: string;
  templateName?: string;
  otp: string;
}) => {
  const { phoneNumber, templateName, apiKey, otp } = data;
  return `${apiKey}/SMS/${phoneNumber}/${otp}/${templateName}`;
};
export const genVerifybyUIDUrl = (data: {
  apiKey: string;
  otp: string;
  UID: string;
}) => {
  const { apiKey, otp, UID } = data;
  return `${apiKey}/SMS/VERIFY/${UID}/${otp}`;
};

export const genVerifybyPhoneUrl = (data: {
  apiKey: string;
  otp: string;
  phone: string;
}) => {
  const { apiKey, otp, phone } = data;
  return `${apiKey}/SMS/VERIFY3/${phone}/${otp}`;
};
