import { Order } from "../drizzle/schema";

// WhatsApp notification service using CallMeBot API (free)
// Setup instructions:
// 1. Add +34 644 71 83 99 to your phone contacts
// 2. Send "I allow callmebot to send me messages" to this number via WhatsApp
// 3. You'll receive an API key - add it to your .env file as CALLMEBOT_API_KEY
// 4. Add your phone number (with country code, no +) as WHATSAPP_ADMIN_NUMBER

export class WhatsAppService {
  static async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const apiKey = process.env.CALLMEBOT_API_KEY;
      
      if (!apiKey) {
        console.log("⚠️ CALLMEBOT_API_KEY not configured. Message logged only:");
        console.log(`📱 To: ${phoneNumber}\n${message}`);
        return false;
      }

      // CallMeBot API endpoint
      const encodedMessage = encodeURIComponent(message);
      const url = `https://api.callmebot.com/whatsapp.php?phone=${phoneNumber}&text=${encodedMessage}&apikey=${apiKey}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        console.log(`✅ WhatsApp message sent successfully to ${phoneNumber}`);
        return true;
      } else {
        console.error(`❌ Failed to send WhatsApp message: ${response.statusText}`);
        return false;
      }
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
      return false;
    }
  }

  static async sendOrderNotification(order: Order, orderItems: any[], customerInfo?: { name: string; city: string; phone: string }): Promise<boolean> {
    try {
      const phoneNumber = process.env.WHATSAPP_ADMIN_NUMBER || "";
      
      if (!phoneNumber) {
        console.log("⚠️ WHATSAPP_ADMIN_NUMBER not configured");
        return false;
      }

      // Create the order summary message
      let message = `🛒 *NOUVELLE COMMANDE!*\n\n`;
      message += `📦 *N°:* ${order.orderNumber || order.id}\n`;
      message += `💰 *Total:* ${order.totalAmount} DH\n\n`;
      
      if (customerInfo) {
        message += `👤 *Client:* ${customerInfo.name}\n`;
        message += `🏙️ *Ville:* ${customerInfo.city}\n`;
        message += `📞 *Tél:* ${customerInfo.phone}\n\n`;
      }
      
      message += `*Articles:*\n`;
      orderItems.forEach((item: any, i: number) => {
        message += `${i + 1}. ${item.product?.name || 'Produit'} x${item.quantity}\n`;
      });
      
      // Parse shipping address
      let addressText = "";
      try {
        const addr = typeof order.shippingAddress === 'string' 
          ? JSON.parse(order.shippingAddress) 
          : order.shippingAddress;
        if (addr.address) addressText = addr.address;
        if (addr.city) addressText += `, ${addr.city}`;
      } catch {
        addressText = String(order.shippingAddress);
      }
      
      if (addressText) {
        message += `\n📍 *Adresse:* ${addressText}`;
      }

      return await this.sendMessage(phoneNumber, message);
    } catch (error) {
      console.error('Error sending WhatsApp order notification:', error);
      return false;
    }
  }
}