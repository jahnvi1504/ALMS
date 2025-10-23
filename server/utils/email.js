const nodemailer = require('nodemailer');

// Create a singleton transporter so we don't recreate it on every send
let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const { GMAIL_USER, GMAIL_PASS } = process.env;
  if (!GMAIL_USER || !GMAIL_PASS) {
    throw new Error('Missing GMAIL_USER or GMAIL_PASS environment variables');
  }

  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS,
    },
  });

  // Try verifying the transporter once
  cachedTransporter.verify().then(() => {
    console.log('[mail] SMTP transporter verified');
  }).catch((err) => {
    console.warn('[mail] SMTP transporter verification failed:', err?.message || err);
  });

  return cachedTransporter;
}

/**
 * Sends a login notification email to the specified recipient.
 * @param {string} toEmail Recipient email address
 * @param {string} recipientName Recipient name
 * @param {{ ip?: string, userAgent?: string, timestamp?: string }} meta Optional metadata
 */
async function sendLoginNotification(toEmail, recipientName, meta = {}) {
  const transporter = getTransporter();

  const loginTime = meta.timestamp || new Date().toISOString();
  const ip = meta.ip || 'Unknown IP';
  const userAgent = meta.userAgent || 'Unknown device';

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; line-height:1.5;">
      <h2 style="margin:0 0 12px;">Login Alert</h2>
      <p>Hi ${recipientName || 'there'},</p>
      <p>Your account was just signed in.</p>
      <ul>
        <li><strong>Time</strong>: ${loginTime}</li>
        <li><strong>IP</strong>: ${ip}</li>
        <li><strong>Device</strong>: ${userAgent}</li>
      </ul>
      <p>If this was you, no action is needed. If you do not recognize this activity, please reset your password immediately.</p>
      <p style="margin-top:16px;">— Online Leave Management System</p>
    </div>
  `;

  const mailOptions = {
    from: `Leave Management System <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Login Alert - Your account was just signed in',
    html,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendLoginNotification };


