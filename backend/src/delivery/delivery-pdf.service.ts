import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { Delivery } from './delivery.entity';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';

@Injectable()
export class DeliveryPDFService {
  async generateDeliveryPDF(delivery: Delivery): Promise<Buffer> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      });
      const page = await browser.newPage();

      const html = this.generateHTML(delivery);
      await page.setContent(html);

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
        preferCSSPageSize: true,
        tagged: true, // Vytvára PDF s kopírovateľným textom
      });

      await browser.close();

      // Save PDF to pdfs/dodaky directory with name dodak_{delivery_number}.pdf
      const pdfsDir = path.join(process.cwd(), 'pdfs', 'dodaky');
      const fileName = `dodak_${delivery.delivery_number}.pdf`;
      const filePath = path.join(pdfsDir, fileName);

      // Ensure pdfs/dodaky directory exists
      if (!fs.existsSync(pdfsDir)) {
        fs.mkdirSync(pdfsDir, { recursive: true });
      }

      // Write PDF to file
      fs.writeFileSync(filePath, pdf);

      return Buffer.from(pdf);
    } catch (error) {
      console.error('Error generating delivery PDF:', error);
      if (browser) {
        await browser.close();
      }
      throw new Error(`Failed to generate delivery PDF: ${error.message}`);
    }
  }

  async generateDeliveryPDFWithPDFKit(delivery: Delivery): Promise<Buffer> {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        autoFirstPage: true,
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));

      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);

          // Save PDF to file
          const pdfsDir = path.join(process.cwd(), 'pdfs', 'dodaky');
          const fileName = `dodak_${delivery.delivery_number}.pdf`;
          const filePath = path.join(pdfsDir, fileName);

          if (!fs.existsSync(pdfsDir)) {
            fs.mkdirSync(pdfsDir, { recursive: true });
          }

          fs.writeFileSync(filePath, pdfBuffer);
          resolve(pdfBuffer);
        });

        doc.on('error', reject);

        // Generate PDF content
        this.generatePDFKitContent(doc, delivery);
        doc.end();
      });
    } catch (error) {
      console.error('Error generating delivery PDF with PDFKit:', error);
      throw new Error(
        `Failed to generate delivery PDF with PDFKit: ${error.message}`,
      );
    }
  }

  private generatePDFKitContent(doc: any, delivery: Delivery): void {
    const today = format(new Date(), 'dd.MM.yyyy', { locale: sk });

    // Header
    doc.fontSize(20).text(`DODACÍ LIST Č.${delivery.delivery_number}`, 50, 50, {
      align: 'center',
    });

    // Company info
    doc.fontSize(14).text('MATRATEX', 50, 100);
    doc.fontSize(10).text('VÝROBA MATRACOV', 50, 120);
    doc.text('Záhradnícka 58/A, 821 06 Bratislava', 50, 135);
    doc.text('prev. Tvrdošín', 50, 150);

    // Customer info
    doc.fontSize(12).text('Príjemca:', 300, 100);
    doc.fontSize(10).text(delivery.customer.podnik, 300, 120);

    if (delivery.customer.adresa) {
      doc.text('Adresa:', 300, 140);
      doc.text(delivery.customer.adresa, 300, 155);
    }

    if (delivery.customer.tel || delivery.customer.mobil) {
      doc.text('Telefón:', 300, 175);
      doc.text(delivery.customer.tel || delivery.customer.mobil, 300, 190);
    }

    doc.text('IČO/DIČ:', 300, 210);
    doc.text(
      `${delivery.customer.ico || '-'} / ${delivery.customer.drc || '-'}`,
      300,
      225,
    );

    // Items table
    doc.moveTo(50, 280).lineTo(550, 280).stroke();

    // Table headers
    doc.fontSize(10).text('Názov', 50, 290);
    doc.text('Informácie', 200, 290);
    doc.text('Rozmery', 350, 290);
    doc.text('Počet', 500, 290);

    doc.moveTo(50, 310).lineTo(550, 310).stroke();

    // Table rows
    let y = 320;
    delivery.items.forEach((item) => {
      doc.fontSize(9).text(item.product_name || 'Matrac', 50, y);
      doc.text(item.material_name || '-', 200, y);
      doc.text(`${item.length}×${item.width}×${item.height} cm`, 350, y);
      doc.text(`${item.quantity} ks`, 500, y);
      y += 20;
    });

    // Custom items
    if (delivery.custom_items && delivery.custom_items.length > 0) {
      delivery.custom_items.forEach((customItem) => {
        doc.fontSize(9).text(customItem.name, 50, y);
        doc.text(customItem.info || '-', 200, y);
        doc.text(customItem.dimensions || '-', 350, y);
        doc.text(`${customItem.quantity} ks`, 500, y);
        y += 20;
      });
    }

    // Signature section
    doc
      .moveTo(50, y + 20)
      .lineTo(550, y + 20)
      .stroke();
    doc
      .fontSize(12)
      .text('POTVRDZUJEM PREVZATIE TOVARU BEZ POSKODENIA.', 50, y + 40);

    doc.fontSize(10).text('Vystavil:', 50, y + 80);
    doc.text('M. Macková', 50, y + 95);

    doc.text('V Tvrdošine dňa:', 200, y + 80);
    doc.text(today, 200, y + 95);

    doc.text('Prevzal:', 350, y + 80);
    doc.text('', 350, y + 95);

    // Footer
    doc.fontSize(8).text('Telefón: 043/5323560, 043/5323901', 50, y + 150);
    doc.text('IČO: 36403687 | DIČ: SK2021634659', 50, y + 165);
    doc.text('Bankové spojenie: VUB, TVRDOSIN, 1572951551/0200', 50, y + 180);
  }

  private generateHTML(delivery: Delivery): string {
    const today = format(new Date(), 'dd.MM.yyyy', { locale: sk });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 15px;
            font-size: 10px;
            line-height: 1.3;
            color: #000;
          }
          .header { 
            text-align: center; 
            margin-bottom: 10px; 
            border-bottom: 1px solid #1976d2;
            padding-bottom: 5px;
          }
          .company-name { 
            color: #1976d2; 
            font-size: 14px; 
            font-weight: bold; 
            margin: 0 0 8px 0; 
            padding: 4px 8px;
            background: #f0f0f0;
            border-radius: 4px;
            border-left: 3px solid #1976d2;
          }
          .company-info { 
            font-size: 9px; 
            margin: 2px 0; 
            color: #666;
            padding: 2px 6px;
            background: #f8f8f8;
            border-radius: 3px;
            border-left: 2px solid #ccc;
          }
          .delivery-number { 
            text-align: center; 
            margin-bottom: 15px; 
            font-size: 18px; 
            font-weight: bold; 
            background: #1976d2;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            display: block;
            width: fit-content;
            margin-left: auto;
            margin-right: auto;
          }
          .top-section { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px; 
            gap: 8px;
          }
          .left-column, .right-column { 
            width: 48%; 
          }
          .three-columns { 
            display: flex; 
            justify-content: space-between; 
            margin-top: 15px; 
            gap: 8px;
          }
          .three-columns .column { 
            width: 32%; 
          }
          .customer-two-columns { 
            display: flex; 
            justify-content: space-between; 
            gap: 6px;
          }
          .customer-column { 
            width: 48%; 
          }
          .field { 
            margin-bottom: 4px; 
            padding: 2px 6px;
            background: #f8f8f8;
            border-radius: 3px;
            border-left: 2px solid #ccc;
          }
          .field-label { 
            font-weight: bold; 
            margin-bottom: 2px; 
            color: #1976d2;
            font-size: 8px;
          }
          .field-value { 
            padding: 2px 0; 
            min-height: 15px; 
            font-size: 9px;
            color: #333;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 8px 0; 
          }
          th, td { 
            border: 1px solid #ccc; 
            padding: 3px 5px; 
            text-align: left; 
            font-size: 9px;
          }
          th { 
            background: #1976d2;
            color: white;
            font-weight: bold;
            font-size: 10px;
          }
          th:nth-child(1) { width: 25%; } /* Názov */
          th:nth-child(2) { width: 25%; } /* Informácie */
          th:nth-child(3) { width: 30%; } /* Rozmery */
          th:nth-child(4) { width: 20%; } /* Počet */
          td {
            background: #fff;
          }
          .signature-section { 
            margin-top: 20px; 
            border-top: 1px solid #ccc;
            padding-top: 15px;
          }
          .footer { 
            margin-top: 20px; 
            font-size: 8px; 
            color: #666;
            background: #f0f0f0;
            padding: 10px;
            border-left: 3px solid #1976d2;
          }
        </style>
      </head>
      <body>
        <div class="delivery-number">DODACÍ LIST Č.${delivery.delivery_number}</div>
        
        <div class="top-section">
          <div class="left-column">
            <div class="company-name">MATRATEX</div>
            <div class="company-info">VÝROBA MATRACOV</div>
            <div class="company-info">Záhradnícka 58/A, 821 06 Bratislava</div>
            <div class="company-info">prev. Tvrdošín</div>
          </div>
          
          <div class="right-column">
            <div class="customer-two-columns">
              <div class="customer-column">
                <div class="field">
                  <div class="field-label">Dátum:</div>
                  <div class="field-value">${today}</div>
                </div>
                <div class="field">
                  <div class="field-label">Príjemca:</div>
                  <div class="field-value">${delivery.customer.podnik}</div>
                </div>
              </div>
              
              <div class="customer-column">
                <div class="field">
                  <div class="field-label">Adresa:</div>
                  <div class="field-value">${delivery.customer.adresa || '-'}</div>
                </div>
                ${
                  delivery.customer.tel || delivery.customer.mobil
                    ? `<div class="field">
                      <div class="field-label">Telefón:</div>
                      <div class="field-value">${delivery.customer.tel || delivery.customer.mobil}</div>
                    </div>`
                    : ''
                }
                <div class="field">
                  <div class="field-label">IČO/DIČ:</div>
                  <div class="field-value">${delivery.customer.ico || '-'} / ${delivery.customer.drc || '-'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Názov</th>
              <th>Informácie</th>
              <th>Rozmery</th>
              <th>Počet</th>
            </tr>
          </thead>
          <tbody>
            ${delivery.items
              .map((item) => {
                return `
              <tr>
                <td><strong>${item.product_name || 'Matrac'}</strong></td>
                <td>${item.material_name || '-'}</td>
                <td>${item.length}×${item.width}×${item.height} cm</td>
                <td>${item.quantity} ks</td>
              </tr>
            `;
              })
              .join('')}
            ${
              delivery.custom_items && delivery.custom_items.length > 0
                ? delivery.custom_items
                    .map((customItem) => {
                      return `
              <tr>
                <td><strong>${customItem.name}</strong></td>
                <td>${customItem.info || '-'}</td>
                <td>${customItem.dimensions || '-'}</td>
                <td>${customItem.quantity} ks</td>
              </tr>
            `;
                    })
                    .join('')
                : ''
            }
          </tbody>
        </table>

        <div class="signature-section">
          <div style="font-weight: bold; margin: 15px 0;">
            POTVRDZUJEM PREVZATIE TOVARU BEZ POSKODENIA.
          </div>
          
          <div class="three-columns">
            <div class="column">
              <div class="field">
                <div class="field-label">Vystavil:</div>
                <div class="field-value">M. Macková</div>
              </div>
            </div>
            
            <div class="column">
              <div class="field">
                <div class="field-label">V Tvrdošine dňa:</div>
                <div class="field-value">${today}</div>
              </div>
            </div>
            
            <div class="column">
              <div class="field">
                <div class="field-label">Prevzal:</div>
                <div class="field-value"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div>Telefón: 043/5323560, 043/5323901</div>
          <div>IČO: 36403687 | DIČ: SK2021634659</div>
          <div>Bankové spojenie: VUB, TVRDOSIN, 1572951551/0200</div>
        </div>
      </body>
      </html>
    `;
  }
}
