import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

/**
 * CAPA DE INFRAESTRUCTURA - LISTENER
 * Envía notificaciones detalladas a Telegram cuando ocurre un registro.
 */
@Injectable()
export class ClientEventsListener {
  private readonly logger = new Logger(ClientEventsListener.name);
  
  /**
   * Maneja el evento de registro.
   * Recibe el payload completo desde el Use Case.
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
    dependentsCount: number; 
    healthInsurance: string;
  }) {
    this.logger.log(`🔔 Evento recibido: ${payload.name}. Preparando notificación extendida...`);

    // Formateamos el ingreso a moneda CLP
    const formattedIncome = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(payload.income || 0);

    // Construcción del mensaje con formato HTML enriquecido
    const message = `🚀 <b>NUEVO LEAD REGISTRADO</b>\n\n` +
                    `👤 <b>Nombre:</b> ${payload.name}\n` +
                    `📧 <b>Email:</b> ${payload.email}\n` +
                    `🆔 <b>RUT:</b> ${payload.rut}\n` +
                    `📞 <b>Teléfono:</b> ${payload.phone}\n` +
                    `🎂 <b>Edad:</b> ${payload.age} años\n` +
                    `💰 <b>Ingreso mensual:</b> ${formattedIncome}\n` +
                    `👨‍👩‍👧‍👦 <b>Cargas registradas:</b> ${payload.dependentsCount}\n` +
                    `🏥 <b>Previsión actual:</b> ${payload.healthInsurance}\n\n` +
                    `🆔 <b>ID Interno:</b> <code>${payload.clientId.substring(0, 8)}...</code>\n\n` +
                    `<i>Favor revisar el panel de administración.</i>`;

    await this.sendTelegramMessage(message);
  }

  private async sendTelegramMessage(message: string) {
    /**
     * ⚠️ REVISIÓN DE VARIABLES
     * Mantenemos la lógica de detección dual para evitar errores 
     * entre la configuración de Google Cloud y el .env local.
     */
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; 
    const CHAT_ID = process.env.CHAT_ID || process.env.TELEGRAM_CHAT_ID; 

    if (!BOT_TOKEN || !CHAT_ID) {
      this.logger.error('❌ Error: TELEGRAM_BOT_TOKEN o CHAT_ID no detectados en las variables de entorno.');
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
        this.logger.log('✅ Notificación de Telegram enviada con éxito.');
      } else {
        this.logger.error(`⛔ Telegram API respondió con error: ${result.description}`);
      }
    } catch (err) {
      this.logger.error(`🛑 Fallo de red al conectar con Telegram: ${err.message}`);
    }
  }
}