export const emailConfig = {
  // Matratex SMTP konfigurácia
  host: process.env.EMAIL_HOST || 'mail.matratex.sk', // Váš SMTP server
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true pre 465, false pre 587
  auth: {
    user: process.env.EMAIL_USER || 'matratex@matratex.sk',
    pass: process.env.EMAIL_PASS || 'your-email-password',
  },

  // Alternatívne: SendGrid
  // sendgrid: {
  //   apiKey: process.env.SENDGRID_API_KEY,
  // },

  // Alternatívne: Mailgun
  // mailgun: {
  //   apiKey: process.env.MAILGUN_API_KEY,
  //   domain: process.env.MAILGUN_DOMAIN,
  // },

  // Odosielateľ
  from: {
    name: 'Matratex s.r.o.',
    address: process.env.EMAIL_USER || 'matratex@matratex.sk',
  },

  // Templates
  templates: {
    invoice: {
      subject: 'Faktúra č. {invoiceNumber}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #1976d2, #42a5f5); color: white; border-radius: 8px;">
            <h1 style="margin: 0; font-size: 28px;">MATRATEX s.r.o.</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">Výroba matracov a postelí</p>
          </div>
          
          <h2 style="color: #1976d2; border-bottom: 2px solid #1976d2; padding-bottom: 10px;">Faktúra č. {invoiceNumber}</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Dobrý deň,</strong></p>
            <p style="margin: 0 0 15px 0;">posielame Vám faktúru v prílohe.</p>
            
            <div style="display: flex; justify-content: space-between; margin: 15px 0;">
              <span><strong>Suma:</strong></span>
              <span style="font-size: 18px; color: #1976d2; font-weight: bold;">{totalPrice} €</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin: 15px 0;">
              <span><strong>Splatnosť:</strong></span>
              <span style="font-weight: bold;">{dueDate}</span>
            </div>
          </div>
          
          <p style="text-align: center; font-size: 16px; color: #1976d2; margin: 30px 0;">
            <strong>Ďakujeme za Vašu objednávku!</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <div style="text-align: center; color: #666; font-size: 12px; line-height: 1.6;">
            <p style="margin: 0; font-weight: bold; color: #1976d2;">MATRATEX s.r.o.</p>
            <p style="margin: 5px 0;">Výroba matracov a postelí</p>
            <p style="margin: 5px 0;">Email: matratex@matratex.sk</p>
            <p style="margin: 5px 0;">Web: www.matratex.sk</p>
          </div>
        </div>
      `,
    },
    reminder: {
      subject: 'Upomienka - Faktúra č. {invoiceNumber}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #d32f2f, #f44336); color: white; border-radius: 8px;">
            <h1 style="margin: 0; font-size: 28px;">MATRATEX s.r.o.</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">Výroba matracov a postelí</p>
          </div>
          
          <h2 style="color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;">⚠️ Upomienka - Faktúra č. {invoiceNumber}</h2>
          
          <div style="background: #ffebee; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #d32f2f;">
            <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Dobrý deň,</strong></p>
            <p style="margin: 0 0 15px 0;">upozorňujeme Vás, že faktúra č. <strong>{invoiceNumber}</strong> je <strong style="color: #d32f2f;">{daysOverdue} dní po splatnosti</strong>.</p>
            
            <div style="display: flex; justify-content: space-between; margin: 15px 0;">
              <span><strong>Suma:</strong></span>
              <span style="font-size: 18px; color: #d32f2f; font-weight: bold;">{totalPrice} €</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin: 15px 0;">
              <span><strong>Pôvodná splatnosť:</strong></span>
              <span style="font-weight: bold;">{dueDate}</span>
            </div>
            
            <p style="margin: 15px 0 0 0; font-weight: bold; color: #d32f2f;">Prosíme o urychlené zaplatenie.</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <div style="text-align: center; color: #666; font-size: 12px; line-height: 1.6;">
            <p style="margin: 0; font-weight: bold; color: #1976d2;">MATRATEX s.r.o.</p>
            <p style="margin: 5px 0;">Výroba matracov a postelí</p>
            <p style="margin: 5px 0;">Email: matratex@matratex.sk</p>
            <p style="margin: 5px 0;">Web: www.matratex.sk</p>
          </div>
        </div>
      `,
    },
  },
};
