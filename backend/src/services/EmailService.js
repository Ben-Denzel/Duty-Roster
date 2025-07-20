const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter based on environment configuration
   */
  initializeTransporter() {
    try {
      const emailConfig = {
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      };

      // If no SMTP credentials provided, use test account for development
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('No SMTP credentials provided. Email notifications will be logged only.');
        this.isConfigured = false;
        return;
      }

      this.transporter = nodemailer.createTransport(emailConfig);
      this.isConfigured = true;

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Email service configuration error:', error);
          this.isConfigured = false;
        } else {
          console.log('Email service is ready to send messages');
        }
      });

    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Send an email notification
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email address
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML content
   * @param {string} options.text - Plain text content (optional)
   * @returns {Promise<Object>} - Send result
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      if (!this.isConfigured) {
        console.log('Email service not configured. Would send email:');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`HTML: ${html.substring(0, 200)}...`);
        return { success: false, message: 'Email service not configured' };
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || '"DutyRoster System" <noreply@dutyroster.com>',
        to,
        subject,
        html,
        text: text || this.htmlToText(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`Email sent successfully to ${to}: ${result.messageId}`);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification email using template
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.userName - Recipient name
   * @param {string} options.subject - Email subject
   * @param {string} options.htmlTemplate - HTML template
   * @param {Object} options.variables - Template variables
   * @returns {Promise<Object>} - Send result
   */
  async sendNotificationEmail({ to, userName, subject, htmlTemplate, variables = {} }) {
    try {
      // Add common variables
      const templateVariables = {
        user_name: userName,
        current_year: new Date().getFullYear(),
        app_name: 'DutyRoster',
        app_url: process.env.APP_URL || 'http://localhost:3000',
        ...variables
      };

      // Render the HTML template
      let html = this.renderTemplate(htmlTemplate, templateVariables);
      
      // Wrap in base email template
      html = this.wrapInBaseTemplate(html, templateVariables);

      return await this.sendEmail({
        to,
        subject,
        html
      });

    } catch (error) {
      console.error('Failed to send notification email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Render template with variables
   * @param {string} template - Template string
   * @param {Object} variables - Variables to replace
   * @returns {string} - Rendered template
   */
  renderTemplate(template, variables = {}) {
    let rendered = template;
    
    // Replace placeholders like {{variable_name}} with actual values
    Object.keys(variables).forEach(key => {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      rendered = rendered.replace(placeholder, variables[key] || '');
    });
    
    return rendered;
  }

  /**
   * Wrap content in base email template
   * @param {string} content - Email content
   * @param {Object} variables - Template variables
   * @returns {string} - Complete HTML email
   */
  wrapInBaseTemplate(content, variables = {}) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${variables.app_name || 'DutyRoster'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #2563eb, #3b82f6);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
          }
          .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 8px 8px;
            font-size: 14px;
            color: #6b7280;
          }
          .button {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px 0;
          }
          .button:hover {
            background: #1d4ed8;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${variables.app_name || 'DutyRoster'}</h1>
          <p>Professional Duty Management System</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>This is an automated message from ${variables.app_name || 'DutyRoster'}.</p>
          <p>© ${variables.current_year || new Date().getFullYear()} ${variables.app_name || 'DutyRoster'}. All rights reserved.</p>
          ${variables.app_url ? `<p><a href="${variables.app_url}">Visit ${variables.app_name || 'DutyRoster'}</a></p>` : ''}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Convert HTML to plain text (basic implementation)
   * @param {string} html - HTML content
   * @returns {string} - Plain text
   */
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  /**
   * Send bulk emails (with rate limiting)
   * @param {Array} emails - Array of email objects
   * @param {number} batchSize - Number of emails to send per batch
   * @param {number} delay - Delay between batches in milliseconds
   * @returns {Promise<Array>} - Array of send results
   */
  async sendBulkEmails(emails, batchSize = 10, delay = 1000) {
    const results = [];
    
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      const batchPromises = batch.map(email => this.sendEmail(email));
      const batchResults = await Promise.allSettled(batchPromises);
      
      results.push(...batchResults);
      
      // Add delay between batches to avoid overwhelming the SMTP server
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return results;
  }

  /**
   * Test email configuration
   * @returns {Promise<Object>} - Test result
   */
  async testConfiguration() {
    try {
      if (!this.isConfigured) {
        return { success: false, message: 'Email service not configured' };
      }

      await this.transporter.verify();
      return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = new EmailService();
