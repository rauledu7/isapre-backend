import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

/**
 * CAPA DE INFRAESTRUCTURA - LISTENER
 * Envía notificaciones a Telegram cuando ocurre un registro.
 */
@Injectable()
export class ClientEventsListener {
  
  @OnEvent('client.registered')
  async handleClientRegistered(payload: { 
    name: string; 
    email: string; 
    clientId: string;
    rut: string;
    phone: string;
    age: number;
    income: number;
    dependents: number;
    healthInsurance: string;
  }){
    console.log(`[Telegram] Preparando notificación para: ${payload.name}`);


    const message = `🚀 <b>NUEVO CLIENTE REGISTRADO</b>\n\n` +
                    `👤 <b>Nombre:</b> ${payload.name}\n` +
                    `📧 <b>Email:</b> ${payload.email}\n` +
                    `🆔 <b>RUT:</b> ${payload.rut}\n` +
                    `📞 <b>Teléfono:</b> ${payload.phone}\n` +
                    `🎂 <b>Edad:</b> ${payload.age} años\n` +
                    `💰 <b>Ingreso mensual:</b> ${payload.income}\n` +
                    `👥 <b>Cargas:</b> ${payload.dependents}\n` +
                    `🏥 <b>Previsión actual:</b> ${payload.healthInsurance}\n\n` +
                    `🆔 <b>ID Interno:</b> <code>${payload.clientId.substring(0, 8)}...</code>\n\n` +
                    `<i>Favor revisar el panel de administración.</i>`;

    try {
      await this.sendTelegramMessage(message);
    } catch (error) {
      console.error('❌ [Telegram Error]:', error.message);
    }
  }

  private async sendTelegramMessage(message: string) {
    const BOT_TOKEN = "8193465418:AAG4TO2sY8DKM4NSbkxP4qjndAuO7C4Qx7k"; 
    const CHAT_ID = 8204720579; // ID de Luisana configurado correctamente

    // Corregimos la validación: solo avisar si el valor es el placeholder original
    if (CHAT_ID !== 8204720579) {
      console.warn('⚠️ [Telegram] Falta configurar el CHAT_ID.');
      return;
    }

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`[Telegram] ✅ Notificación enviada con éxito.`);
      } else {
        console.error(`[Telegram] ⛔ Error: ${result.description}`);
      }
    } catch (err) {
      console.error(`[Telegram] 🛑 Error de red: ${err.message}`);
    }
  }
}