import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// RabbitMQ es opcional - si no está disponible, solo loguea
@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private connection: any = null;
  private channel: any = null;
  private isConnected = false;

  constructor(private configService: ConfigService) {
    this.init();
  }

  private async init() {
    try {
      // Lazy load amqplib para evitar errores de compilación
      const amqp = await import('amqplib');
      const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672');
      
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      // Declarar colas principales
      await this.channel.assertQueue('notifications', { durable: true });
      await this.channel.assertQueue('exports', { durable: true });
      await this.channel.assertQueue('integrations', { durable: true });
      
      this.isConnected = true;
      this.logger.log('✅ RabbitMQ conectado');
    } catch (error: any) {
      this.logger.warn(`⚠️ RabbitMQ no disponible: ${error.message}. El sistema funcionará sin cola de mensajes.`);
    }
  }

  async publishToQueue(queue: string, message: any): Promise<void> {
    if (!this.isConnected || !this.channel) {
      this.logger.warn(`RabbitMQ no disponible - mensaje no enviado a cola ${queue}`);
      return;
    }

    try {
      await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        persistent: true,
      });
    } catch (error) {
      console.error(`Error publicando a cola ${queue}:`, error.message);
    }
  }

  async consume(queue: string, callback: (msg: any) => Promise<void>): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel no disponible');
    }

    await this.channel.consume(queue, async (msg: any) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          this.channel.ack(msg);
        } catch (error: any) {
          this.logger.error(`Error procesando mensaje de ${queue}: ${error.message}`);
          this.channel.nack(msg, false, false); // Dead letter
        }
      }
    });
  }
}
