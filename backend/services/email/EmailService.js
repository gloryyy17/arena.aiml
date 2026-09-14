const nodemailer = require('nodemailer');

/**
 * Modular Email Service
 * Handles email delivery, templating, rate limiting, and transport fallbacks.
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this._initTransporter();
  }

  _initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      console.log(`[EmailService] Configured SMTP transporter with ${host}:${port}`);
    } else {
      // Mock / Dev transport
      this.transporter = null;
      console.log('[EmailService] SMTP credentials not set. Running in development/mock email mode.');
    }
  }

  /**
   * Sanitize HTML to prevent malicious script injection in email templates
   */
  sanitizeHTML(html) {
    if (!html) return '';
    // Basic server-side sanitization removing script tags and javascript: urls
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
    const fromAddress = from || process.env.EMAIL_FROM || 'Arena AIML Events <events@arena.aiml>';
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

    if (this.transporter && process.env.NODE_ENV !== 'test') {
      try {
        const info = await this.transporter.sendMail({
          from: fromAddress,
          to: emailList.join(', '),
          subject,
          html: sanitizedHtml,
          text: text || '',
        });

        return {
          success: true,
          messageId: info.messageId,
          acceptedCount: info.accepted?.length || emailList.length,
          rejectedCount: info.rejected?.length || 0,
          previewUrl: nodemailer.getTestMessageUrl(info) || null,
        };
      } catch (err) {
        console.error(`[EmailService] SMTP Dispatch Failed: ${err.message}`);
        throw new Error(`Email dispatch failed: ${err.message}`);
      }
    } else {
      // Mock / Offline delivery result
      console.log(`[EmailService - MOCK] Sent "${subject}" to ${emailList.length} recipient(s): ${emailList.slice(0, 3).join(', ')}`);
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
}

// Singleton export
const emailService = new EmailService();

module.exports = emailService;
