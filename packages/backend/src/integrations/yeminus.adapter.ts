import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueueService } from '../queue/queue.service';

interface YeminusAffiliationPayload {
  employeeId: string;
  identificationType: string;
  identificationNumber: string;
  firstName: string;
  lastName: string;
  entityType: 'EPS' | 'AFP' | 'ARL';
  entityCode: string;
}

@Injectable()
export class YeminusAdapter {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly maxRetries: number;

  constructor(
    private configService: ConfigService,
    private queueService: QueueService,
  ) {
    this.apiUrl = this.configService.get<string>('YEMINUS_API_URL', 'https://api.yeminus.com/v1');
    this.apiKey = this.configService.get<string>('YEMINUS_API_KEY', 'stub_api_key');
    this.maxRetries = this.configService.get<number>('YEMINUS_MAX_RETRIES', 3);
  }

  async sendAffiliation(payload: YeminusAffiliationPayload): Promise<{ transactionId: string; status: string }> {
    // STUB: implementación real haría HTTP request a Yéminus API
    console.log('📤 [STUB] Enviando afiliación a Yéminus:', payload);

    // Simular respuesta exitosa
    const transactionId = `YEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Enviar a cola para procesamiento con retry
    await this.queueService.publishToQueue('integrations', {
      type: 'yeminus.affiliation',
      transactionId,
      payload,
      attempt: 1,
      maxRetries: this.maxRetries,
      timestamp: new Date().toISOString(),
    });

    return {
      transactionId,
      status: 'PENDING',
    };
  }

  async getStatus(transactionId: string): Promise<{ status: string; details: any }> {
    // STUB: consultar estado de transacción en Yéminus
    console.log('📥 [STUB] Consultando estado de transacción:', transactionId);

    return {
      status: 'COMPLETED',
      details: {
        transactionId,
        completedAt: new Date().toISOString(),
      },
    };
  }

  async retryWithBackoff(fn: () => Promise<any>, attempt: number = 1): Promise<any> {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= this.maxRetries) {
        throw error;
      }

      const delayMs = Math.pow(2, attempt) * 1000; // Exponential backoff
      console.log(`⏳ Reintentando en ${delayMs}ms (intento ${attempt + 1}/${this.maxRetries})`);

      await new Promise(resolve => setTimeout(resolve, delayMs));
      return this.retryWithBackoff(fn, attempt + 1);
    }
  }
}
