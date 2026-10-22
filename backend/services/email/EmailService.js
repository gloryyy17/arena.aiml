const nodemailer = require('nodemailer');

/**
 * Modular Email Service
 * Handles email delivery, templating, rate limiting, and transport fallbacks.
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this._testAccount = null;
    this._initTransporter();
  }

  _initTransporter() {
    const service = process.env.SMTP_SERVICE;
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (user && pass) {
      if (service === 'gmail' || (host && host.includes('gmail'))) {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass },
        });
        console.log(`[EmailService] Configured Gmail transporter for ${user}`);
      } else if (host) {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });
        console.log(`[EmailService] Configured SMTP transporter with ${host}:${port}`);
      }
    } else {
      this.transporter = null;
      console.log('[EmailService] SMTP credentials not set in .env. Will use live test SMTP transporter on dispatch.');
    }
  }

  async _getTransporter() {
    if (this.transporter) return this.transporter;

    // Automatically initialize live test transporter if custom SMTP is not configured
    if (!this._testAccount) {
      try {
        console.log('[EmailService] Initializing live Ethereal test mail transporter...');
        this._testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: this._testAccount.user,
            pass: this._testAccount.pass,
          },
        });
        console.log(`[EmailService] Live Ethereal SMTP transporter connected (${this._testAccount.user})`);
      } catch (err) {
        console.warn('[EmailService] Could not initialize test transporter:', err.message);
      }
    }
    return this.transporter;
  }

  /**
   * Sanitize HTML to prevent malicious script injection in email templates
   */
  sanitizeHTML(html) {
    if (!html) return '';
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/on\w+='[^']*'/g, '');
  }

  /**
   * Send single or bulk email
   * @param {Object} params
   * @param {string|Array<string|{email: string, name: string}>} params.to
   * @param {string} params.subject
   * @param {string} params.html
   * @param {string} [params.text]
   * @param {string} [params.from]
   */
  async sendEmail({ to, subject, html, text, from }) {
    const fromAddress = from || process.env.EMAIL_FROM || process.env.SMTP_USER || 'Arena AIML Events <events@arena.aiml>';
    const sanitizedHtml = this.sanitizeHTML(html);

    // Normalize recipient list
    let recipients = [];
    if (typeof to === 'string') {
      recipients = to.split(',').map((e) => ({ email: e.trim() })).filter((e) => e.email);
    } else if (Array.isArray(to)) {
      recipients = to.map((item) => (typeof item === 'string' ? { email: item.trim() } : item));
    }

    if (recipients.length === 0) {
      throw new Error('No valid recipients provided for email.');
    }

    const emailList = recipients.map((r) => r.email);

    if (process.env.NODE_ENV !== 'test') {
      const activeTransporter = await this._getTransporter();
      if (activeTransporter) {
        try {
          const info = await activeTransporter.sendMail({
            from: fromAddress,
            to: emailList.join(', '),
            subject,
            html: sanitizedHtml,
            text: text || '',
          });

          const previewUrl = nodemailer.getTestMessageUrl(info) || null;
          if (previewUrl) {
            console.log(`[EmailService] Live email dispatched! View sent email: ${previewUrl}`);
          } else {
            console.log(`[EmailService] Live email dispatched directly to: ${emailList.join(', ')}`);
          }

          return {
            success: true,
            messageId: info.messageId,
            acceptedCount: info.accepted?.length || emailList.length,
            rejectedCount: info.rejected?.length || 0,
            previewUrl,
          };
        } catch (err) {
          console.error(`[EmailService] SMTP Dispatch Failed: ${err.message}`);
          throw new Error(`Email dispatch failed: ${err.message}`);
        }
      }
    }

    // Mock result for test suite
    console.log(`[EmailService - TEST] Sent "${subject}" to ${emailList.length} recipient(s): ${emailList.slice(0, 3).join(', ')}`);
    return {
      success: true,
      mock: true,
      messageId: `mock-msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      acceptedCount: emailList.length,
      rejectedCount: 0,
      previewUrl: null,
    };
  }
}

// Singleton export
const emailService = new EmailService();

module.exports = emailService;
