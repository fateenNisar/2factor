
# 2Factor.in SDK

An sdk for [2Factor]("https://2factor.in") SMS OTP service with support for rate limiting and built-in validation using Zod.

## Installation

```bash
npm install 2factor-sdk
```

## Quick Start


- Go to [2factor](https://2factor.in/) , sign up and get the api key.

```typescript
import { TWOFactor } from '2factor-sdk';

const twofactor = TWOFactor.init({ 
  apiKey: 'YOUR_API_KEY',
  // only when you want to use rate limiting.
  upstashToken: 'YOUR_UPSTASH_TOKEN', // Optional: for rate limiting
  upstashUrl: 'YOUR_UPSTASH_URL' // Optional: for rate limiting
});

// Send OTP
const result = await twofactor.sendOTP({
  phoneNumber: '9XXXXXXXXX',
  templateName: 'Template_Name', //two factor template name (optional)
  interval: '30 s', // Optional: rate limiting interval (default: '30 s')
  limit: 1 // Optional: rate limiting count (default: 1)
});
```

## Validation Rules

If any of the validation fails it will throw an error. Wrap the code in try catch to handle the errors. use handleTFError function to get errors that can be sent to clients.

### Phone Number

- Must be 10 digits
- Must start with 6, 7, 8, or 9  (Indian phone numbers only).


```typescript
const response = await twofactor.sendOTP({
  phoneNumber: '9876543210', // Valid format
  templateName: 'Template_Name', // two factor template name (optional)
});
```

### OTP

- Length: 4-6 digits
- Must be numeric


```typescript
const verify = await twofactor.verifyByUID({
  otp: '123456', // Valid 6-digit OTP
  UID: 'session-uid',
});
```

## Rate Limiting

This SDK supports rate limiting using Upstash Redis. To enable rate limiting, provide your Upstash token and URL when initializing the SDK. If these are not provided, rate limiting will not be applied.

To create an Upstash account and get your token and URL, follow these steps:

1. Go to [Upstash](https://upstash.com/) and sign up for an account.
2. Create a new Redis database.
3. In your database details, you'll find the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.


You can customize the rate limiting for each method call by providing `interval` and `limit` parameters. The default is 1 request per 30 seconds.

```typescript
const result = await twofactor.sendOTP({
  phoneNumber: '9XXXXXXXXX',
  templateName: 'Template_Name',
  interval: '1 m', // 1 minute
  limit: 5 // 5 requests allowed per minute
});
```

## Error Handling

This sdk has proper support for error handling and will return sanitized errors that we can directly sent to client without exposing other errors.

```typescript
import { handleTFError, TWOFactor } from '2factor-sdk'

try {
  const response = await client.sendOTP({
    phoneNumber: '9XXXXXXXXX',
    templateName: 'Template_Name'
  });
} catch (error) {
  const handledError = handleTFError(error);
  if (handledError) {
    // return sanitized error to client
  }
}
```



## API Methods

### sendOTP()

Generates and sends a random OTP to the specified phone number. Supports both 4-digit and 6-digit OTPs.

```typescript
const response = await twofactor.sendOTP({
  phoneNumber: "9XXXXXXXXX", // Required: 10-digit number
  // Optional fields
  templateName: "OTP1", // Optional: SMS template
  otpLength: 4, // Optional: 4 or 6 (default: 4)
  interval: "30 s", // Optional: rate limiting interval (default: '30 s')
  limit: 1 // Optional: rate limiting count (default: 1)
});
```

Returns: `{ UID: string }` - Session UID for verification

### sendAndReturnOTP()

Similar to sendOTP but also returns the generated OTP value. Useful for testing or scenarios where you need to know the OTP.

```typescript
const response = await client.sendAndReturnOTP({
  phoneNumber: "9XXXXXXXXX", // Required: 10-digit number
  // optional fields
  templateName: "OTP1", // Optional: SMS template
  interval: "30 s", // Optional: rate limiting interval (default: '30 s')
  limit: 1 // Optional: rate limiting count (default: 1)
});
```

Returns: `{ OTP: string, UID: string }` - Both OTP and session UID

### sendCustomOTP()

Sends a custom OTP value instead of generating a random one. Useful when you want to control the OTP value.

```typescript
const response = await twofactor.sendCustomOTP({
  phoneNumber: "9XXXXXXXXX", // Required: 10-digit number
  // optional fields
  templateName: "OTP1", // Optional: SMS template
  otp: "1234", // Required: 4 or 6  digit numeric OTP
  interval: "30 s", // Optional: rate limiting interval (default: '30 s')
  limit: 1 // Optional: rate limiting count (default: 1)
});
```

Returns: `{ UID: string }` - Session UID for verification

### verifyByUID()

Verifies an OTP using the session UID. Most secure method as it validates against a specific session.

```typescript
const isValid = await client.verifyByUID({
  otp: '1234', // Required: 4-6 digit OTP
  UID: '47dac35a-c9f9-11ef-8b17-0200cd936042', // Required: 36-char session ID
});
if (!isValid)
{
    // throw error
}
```

Returns: `boolean` - true if OTP is valid. Undefined if not valid.

### verifyByPhone()

Verifies an OTP using the phone number. Alternative verification method when UID is not available.

```typescript
const isValid = await client.verifyByPhone({
  otp: string, // Required: 4-6 digit OTP
  phoneNumber: string, // Required: 10-digit number
});
if (!isValid)
{
    // throw error
}
```





Returns: `boolean` - true if OTP is valid. Undefined if not valid.



### Example Usage (With rate limiting).


```js
import express from 'express';
import dotenv from 'dotenv';
import { TWOFactor, handleTFError } from '2factor-sdk';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize TWOFactor client
const tf = TWOFactor.init({
  apiKey: process.env.TWOFACTOR_API_KEY!,
  upstashToken: process.env.UPSTASH_TOKEN,
  upstashUrl: process.env.UPSTASH_URL,
});

// Middleware to parse JSON bodies
app.use(express.json());

// OTP sending endpoint
app.post('/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    // Send OTP
    const result = await tf.sendOTP({
      phoneNumber: phoneNumber,
      limit: 1,
      interval: '30 s'
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    // Handle TWOFactor specific errors including validation errors.
    // can be send to client.
    const handledError = handleTFError(error);
    
    if (handledError) {
      return res.status(400).json({
        success: false,
        error: handledError
      });
    }

    // Handle unexpected errors
    console.error('Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`OTP API server running on port ${port}`);
});


```

## License

MIT

## Support

For support, email [fateennisar121@gmail.com](mailto:fateennisar121@gmail.com) or create an issue in the GitHub repository.
