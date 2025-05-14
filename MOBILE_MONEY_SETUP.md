# Mobile Money Integration Setup

We've successfully tested the Mobile Money API integration and have confirmed the API connection is working. Here's what we've learned and implemented:

## API Configuration

- **Domains**: The API uses `pay.eirmondserv.com` rather than `payment.eirmondserv.com` mentioned in some documentation
- **Test API**: During testing, we use the `/test-api/` prefix for endpoints
- **Production API**: For production, we'll use the `/api/` prefix

## Callback URL Configuration

The API integration requires a callback URL to be configured on the Mobile Money provider side.

1. Log in to the Mobile Money provider dashboard at https://pay.eirmondserv.com
2. Navigate to the API Credentials section
3. Configure the following callback URL:
   - Callback URL: `https://studiosix.ai/api/payments/mobilemoney/callback`
   - Callback Secret: `tmLnzdWRfUbY6YLAAHfp2On4/DCj5vSzoBkWYhN8tGs=`

The callback URL and secret have been configured and the CALLBACK_SECRET constant in the code has been updated.

## API Requirements

### Phone Number Format

The API requires phone numbers to be in local Uganda format starting with 0, for example: `0772123456`.
This differs from the international E.164 format that is often used in APIs.

### Amount Requirements

The minimum amount accepted by the API is 1,000 UGX. Attempting to process smaller amounts will result in an error.

## Testing the Integration

We've successfully tested initiating a payment with the following process:

1. Made a payment request through the API for 1,000 UGX to a real phone number
2. Received a `pending` status with a payment_id and reference_id
3. The recipient should receive a prompt on their phone to authorize the payment

### Payment Status Updates

The primary method for receiving payment status updates is through the callback endpoint. Direct status checking through the API is not reliable based on our testing. Our implementation relies on:

1. Capturing initial payment details when initiating payment
2. Waiting for callback notifications to update the payment status
3. Implementing fallback status checks that handle API endpoint inconsistencies

### Test Payments

We successfully initiated a test payment with these details:
- Payment ID: `f83fb826-550a-448f-ad83-829d947bd803`
- Reference ID: `1746c476-2436-4279-ab99-956ceec811aa`
- Amount: 1,000 UGX
- Status: `pending`

## Moving to Production

Once testing is complete and working as expected, update the `BASE_URL` in `src/lib/mobilemoney.ts` to use the production endpoint:

```typescript
const BASE_URL = 'https://pay.eirmondserv.com/api'; // Production endpoint
```

## Common Issues

1. **Missing Callback Error**: If you see an error about missing callback URL, make sure you've configured it in the dashboard as described above.

2. **Invalid Signature**: If callbacks are failing with signature validation errors, ensure the callback secret in your code matches exactly what's configured in the dashboard.

3. **Connection Issues**: If you have trouble connecting to the API, verify that the domains are accessible from your server.

4. **Invalid Phone Number**: Make sure the phone number is in the format `0XXXXXXXXX` and not in the international format.

5. **Amount Too Low**: Ensure that the payment amount is at least 1,000 UGX.

6. **Parallel Payment Error**: If you receive a "parallel_payment" error, it means there's already a pending payment for that phone number. Wait a short time before trying again.

## API Error Responses

Here are some common error responses you might see during testing:

- `testing_environment_required`: Your account is in testing mode, use the test-api endpoints
- `missing_callback`: Configure the callback URL in the dashboard
- `invalid_signature`: The signature in the callback doesn't match what's expected
- `invalid_contact`: The phone number format is incorrect, use local format (0XXXXXXXXX)
- `invalid_amount`: The amount is too low, minimum is 1,000 UGX
- `parallel_payment`: A payment is already in process for this contact number

## API Test Commands

You can verify the API is working by running the following curl commands:

```bash
# Get OAuth token
TOKEN=$(curl -s -X POST "https://pay.eirmondserv.com/oauth/token" \
  -H "Authorization: Basic NzNlYzY5ZGMtYzgyMS00YzlhLWE3MjUtZDcxMTZlNjk5YWI4OmYwM2Y2NjUxLTc1MGItNDE2OC04ZDk2LTA5YzEzYWQ4M2QzYw==" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# Test payment request
curl -X POST "https://pay.eirmondserv.com/test-api/request-payment" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contact":"0700000000","amount":1000,"message":"Test Payment"}'
```

This confirms that your API credentials are working correctly. 