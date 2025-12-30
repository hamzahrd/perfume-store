# WhatsApp Payment Integration Setup

## Environment Variables

To configure the WhatsApp payment notification system, add the following environment variables to your `.env` file:

```env
# WhatsApp Business API Configuration
WHATSAPP_BUSINESS_PHONE=1234567890    # Your WhatsApp business phone number

# For Twilio WhatsApp API (recommended)
TWILIO_ACCOUNT_SID=your_account_sid    # Your Twilio Account SID
TWILIO_AUTH_TOKEN=your_auth_token      # Your Twilio Auth Token
TWILIO_WHATSAPP_NUMBER=whatsapp_number # Your Twilio WhatsApp-enabled number (format: +1234567890)
```

## How It Works

When a customer places an order through the e-commerce store, the system automatically sends a WhatsApp notification to the configured phone number with the following information:

- Order number
- Total amount
- Order status
- Customer email
- Order items (product names, quantities, sizes)
- Shipping address

## Setup Options

### Option 1: Twilio WhatsApp API (Recommended)

1. Sign up for a [Twilio account](https://www.twilio.com/)
2. Purchase a phone number with WhatsApp capability
3. Configure the environment variables as shown above
4. The system will automatically send order notifications via WhatsApp

### Option 2: Custom WhatsApp Business API

You can modify the `server/whatsapp.ts` file to integrate with other WhatsApp Business API providers by updating the `sendOrderNotification` method.

## Testing

For testing purposes, if no WhatsApp configuration is provided, the system will log the message to the console instead of sending actual WhatsApp messages.

## Security

- Keep your API credentials secure and never commit them to version control
- Use environment variables for all sensitive information
- Regularly rotate your API tokens for security

## Troubleshooting

If WhatsApp notifications are not being sent:

1. Verify that all required environment variables are set
2. Check that your WhatsApp Business API provider is properly configured
3. Ensure that the phone number format is correct (+ followed by country code and number)
4. Check server logs for any error messages