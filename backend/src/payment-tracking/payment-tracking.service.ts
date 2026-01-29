import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../invoices/entities/invoice.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentTrackingService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    private readonly emailService: EmailService,
  ) {}

  async trackInvoice(invoice: Invoice): Promise<void> {
    try {
      // Nastav sledovanie platby pre faktúru
      console.log(
        `📊 Sledovanie platby nastavené pre faktúru ${invoice.invoice_number}`,
      );

      // Tu by bol reálny payment tracking (bank API, atď.)
    } catch (error) {
      console.error('Chyba pri nastavení sledovania platby:', error);
    }
  }

  async checkOverdueInvoices(): Promise<void> {
    try {
      const today = new Date();
      const overdueInvoices = await this.invoiceRepo.find({
        where: {
          due_date: today,
          // status: 'unpaid', // Odstránim toto, kým nemáme status field
        },
      });

      for (const invoice of overdueInvoices) {
        const daysOverdue = Math.floor(
          (today.getTime() - invoice.due_date.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        if (daysOverdue > 0) {
          const result = await this.emailService.sendPaymentReminder(
            invoice,
            daysOverdue,
          );
          if (result.sent) {
            console.log(
              `📧 Upomienka odoslaná pre faktúru ${invoice.invoice_number} (${daysOverdue} dní po splatnosti)`,
            );
          } else {
            console.log(
              `⚠️ Upomienka sa nepodarila odoslať pre faktúru ${invoice.invoice_number}: ${result.message}`,
            );
          }
        }
      }
    } catch (error) {
      console.error('Chyba pri kontrole po splatnosti:', error);
    }
  }

  async getPaymentStatus(invoiceId: number): Promise<{
    status: 'paid' | 'unpaid' | 'overdue';
    daysOverdue?: number;
    lastPaymentCheck?: Date;
  }> {
    try {
      const invoice = await this.invoiceRepo.findOne({
        where: { id: invoiceId },
      });
      if (!invoice) {
        throw new Error('Faktúra neexistuje');
      }

      const today = new Date();
      // Kontrola či due_date existuje
      if (!invoice.due_date) {
        return {
          status: 'unpaid',
          lastPaymentCheck: today,
        };
      }

      const daysOverdue = Math.floor(
        (today.getTime() - invoice.due_date.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysOverdue > 0) {
        return {
          status: 'overdue',
          daysOverdue,
          lastPaymentCheck: today,
        };
      }

      // Tu by bol reálny check platby
      return {
        status: 'unpaid',
        lastPaymentCheck: today,
      };
    } catch (error) {
      console.error('Chyba pri kontrole stavu platby:', error);
      throw error;
    }
  }
}
