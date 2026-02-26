import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

/**
 * CAPA DE INFRAESTRUCTURA - LISTENER
 * Envía notificaciones a Telegram cuando ocurre un registro.
 */
@Injectable()
export class ClientEventsListener {
  
  /**
   * Maneja el evento de registro.
   * IMPORTANTE: El payload ahora usa 'dependentsCount' para el número de cargas.
   */
  @OnEvent('client.registered')
  async handleClientRegistered(payload: { 
    name: string; 
    email: string; 
    clientId: string;
    rut: string;
    phone: string;
    age: number;
    income: number;
    dependentsCount: number; // Coincide con lo que emite el Use Case
    healthInsurance: string;
  }){
    console.log(`[Telegram] Preparando notificación para: ${payload.name}`);

    // Formateamos el ingreso a moneda CLP para que se vea profesional
    const formattedIncome = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(payload.income);

    const message = `🚀 <b>NUEVO CLIENTE REGISTRADO</b>\n\n` +
                    `👤 <b>Nombre:</b> ${payload.name}\n` +
                    `📧 <b>Email:</b> ${payload.email}\n` +
                    `🆔 <b>RUT:</b> ${payload.rut}\n` +
                    `📞 <b>Teléfono:</b> ${payload.phone}\n` +
                    `🎂 <b>Edad:</b> ${payload.age} años\n` +
                    `💰 <b>Ingreso mensual:</b> ${formattedIncome}\n` +
                    `👥 <b>Cargas:</b> ${payload.dependentsCount}\n` + // Usamos dependentsCount
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
    // Usamos los nombres exactos que tienes en Google Cloud Run
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; 
    const CHAT_ID = process.env.CHAT_ID; 

    if (!BOT_TOKEN || !CHAT_ID) {
      console.warn('⚠️ [Telegram] Falta configurar TELEGRAM_BOT_TOKEN o CHAT_ID en las variables de entorno.');
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
        console.error(`[Telegram] ⛔ Error de API: ${result.description}`);
      }
    } catch (err) {
      console.error(`[Telegram] 🛑 Error de red: ${err.message}`);
    }
  }
}