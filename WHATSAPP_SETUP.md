# WhatsApp Notification Setup (FREE)

## Quick Setup (5 minutes)

This uses **CallMeBot** - a free service to receive WhatsApp notifications.

### Step 1: Activate CallMeBot on your WhatsApp

1. **Add this number to your phone contacts:** `+34 644 71 83 99`
2. **Open WhatsApp** and send this exact message to that number:
   ```
   I allow callmebot to send me messages
   ```
3. **Wait for the response** - You'll receive an API key like: `123456`

### Step 2: Configure Environment Variables

Add these to your `.env` file:

```env
# Your phone number with country code (no + or spaces)
# Example for Morocco: 212627485020
WHATSAPP_ADMIN_NUMBER=212XXXXXXXXX

# The API key you received from CallMeBot
CALLMEBOT_API_KEY=your_api_key_here
```

### Step 3: Restart the Server

After adding the environment variables, restart your server to apply the changes.

## How It Works

When a customer places an order, you'll automatically receive a WhatsApp message with:
- Order number
- Total amount
- Customer name, city, and phone
- Ordered items
- Delivery address

## Troubleshooting

### Not receiving messages?
1. Make sure you sent the activation message to CallMeBot
2. Check that your phone number format is correct (no + or spaces)
3. Verify the API key is correct
4. Check the server logs for any errors

### Message limit
CallMeBot has a limit of ~25 messages per day on the free plan. For higher volumes, consider:
- Twilio WhatsApp API (paid)
- WhatsApp Business API (requires approval)

## Testing

To test, place a test order on your website. You should receive a WhatsApp message within a few seconds.

## Troubleshooting

If WhatsApp notifications are not being sent:

1. Verify that all required environment variables are set
2. Check that your WhatsApp Business API provider is properly configured
3. Ensure that the phone number format is correct (+ followed by country code and number)
4. Check server logs for any error messages