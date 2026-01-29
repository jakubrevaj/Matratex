import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Customer } from '../customers/customer.entity';
import { emailConfig } from '../config/email.config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: emailConfig.auth,
      });

      this.logger.log('📧 Email transporter inicializovaný');
    } catch (error) {
      this.logger.error('Chyba pri inicializácii email transporter:', error);
    }
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
    }>;
  }): Promise<{ sent: boolean; message: string }> {
    try {
      await this.transporter.sendMail({
        from: emailConfig.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      });

      this.logger.log(`📧 Email odoslaný na ${options.to}`);
      return { sent: true, message: 'Email odoslaný' };
    } catch (error) {
      this.logger.error(`Chyba pri odosielaní emailu na ${options.to}:`, error);
      return { sent: false, message: error.message || 'Neznáma chyba' };
    }
  }

  async sendInvoice(
    invoice: Invoice,
  ): Promise<{ sent: boolean; message: string }> {
    try {
      // Nájdeme zákazníka podľa customer_name
      const customer = await this.customerRepo.findOne({
        where: { podnik: invoice.customer_name },
      });

      if (!customer) {
        this.logger.warn(`Zákazník ${invoice.customer_name} sa nenašiel`);
        return { sent: false, message: 'Zákazník sa nenašiel' };
      }

      if (!customer.email) {
        this.logger.warn(`Zákazník ${invoice.customer_name} nemá email adresu`);
        return { sent: false, message: 'Zákazník nemá email adresu' };
      }

      // Validácia email adresy
      if (!this.isValidEmail(customer.email)) {
        this.logger.warn(`Neplatná email adresa: ${customer.email}`);
        return { sent: false, message: 'Neplatná email adresa' };
      }

      // Pripravíme email template
      const template = emailConfig.templates.invoice;
      const html = template.html
        .replace('{invoiceNumber}', invoice.invoice_number)
        .replace('{totalPrice}', invoice.total_price.toFixed(2))
        .replace(
          '{dueDate}',
          invoice.due_date
            ? new Date(invoice.due_date).toLocaleDateString('sk-SK')
            : 'N/A',
        )
        .replace('{companyAddress}', 'Adresa firmy, Mesto, PSČ');

      // Odoslanie emailu
      const info = await this.transporter.sendMail({
        from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
        to: customer.email,
        subject: template.subject.replace(
          '{invoiceNumber}',
          invoice.invoice_number,
        ),
        html: html,
        // attachments: [
        //   {
        //     filename: `faktura_${invoice.invoice_number}.pdf`,
        //     path: `./pdfs/faktura_${invoice.invoice_number}.pdf`,
        //   },
        // ],
      });

      this.logger.log(
        `📧 Email odoslaný pre faktúru ${invoice.invoice_number} na ${customer.email}`,
      );
      return { sent: true, message: 'Email úspešne odoslaný' };
    } catch (error) {
      this.logger.error('Chyba pri odosielaní emailu:', error);
      return { sent: false, message: 'Chyba pri odosielaní emailu' };
    }
  }

  async sendPaymentReminder(
    invoice: Invoice,
    daysOverdue: number,
  ): Promise<{ sent: boolean; message: string }> {
    try {
      // Nájdeme zákazníka podľa customer_name
      const customer = await this.customerRepo.findOne({
        where: { podnik: invoice.customer_name },
      });

      if (!customer) {
        this.logger.warn(`Zákazník ${invoice.customer_name} sa nenašiel`);
        return { sent: false, message: 'Zákazník sa nenašiel' };
      }

      if (!customer.email) {
        this.logger.warn(`Zákazník ${invoice.customer_name} nemá email adresu`);
        return { sent: false, message: 'Zákazník nemá email adresu' };
      }

      // Validácia email adresy
      if (!this.isValidEmail(customer.email)) {
        this.logger.warn(`Neplatná email adresa: ${customer.email}`);
        return { sent: false, message: 'Neplatná email adresa' };
      }

      // Pripravíme email template
      const template = emailConfig.templates.reminder;
      const html = template.html
        .replace('{invoiceNumber}', invoice.invoice_number)
        .replace('{daysOverdue}', daysOverdue.toString())
        .replace('{totalPrice}', invoice.total_price.toFixed(2))
        .replace(
          '{dueDate}',
          invoice.due_date
            ? new Date(invoice.due_date).toLocaleDateString('sk-SK')
            : 'N/A',
        )
        .replace('{companyAddress}', 'Adresa firmy, Mesto, PSČ');

      // Odoslanie emailu
      const info = await this.transporter.sendMail({
        from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
        to: customer.email,
        subject: template.subject.replace(
          '{invoiceNumber}',
          invoice.invoice_number,
        ),
        html: html,
      });

      this.logger.log(
        `📧 Upomienka odoslaná pre faktúru ${invoice.invoice_number} na ${customer.email} (${daysOverdue} dní po splatnosti)`,
      );
      return { sent: true, message: 'Upomienka úspešne odoslaná' };
    } catch (error) {
      this.logger.error('Chyba pri odosielaní upomienky:', error);
      return { sent: false, message: 'Chyba pri odosielaní upomienky' };
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Testovanie email pripojenia
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Email pripojenie funguje');
      return true;
    } catch (error) {
      this.logger.error('❌ Email pripojenie nefunguje:', error);
      return false;
    }
  }
}
