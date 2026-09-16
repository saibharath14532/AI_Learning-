import nodemailer from 'nodemailer';

/**
 * Creates and returns a Nodemailer transporter configured from environment variables.
 * Fails clearly if EMAIL_USER or EMAIL_PASS are missing.
 */
const getTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587;
  const isSecure = process.env.EMAIL_SECURE === 'true' || port === 465;
  const user = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '';
  const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim() : '';

  if (!user || !pass || user === 'YOUR_EMAIL_HERE' || user === 'OFFICIAL_EMAIL_ADDRESS') {
    const error = new Error('Email service is not configured. Please contact the administrator.');
    error.isConfigError = true;
    throw error;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Verifies SMTP connection during application startup.
 */
export const verifySMTPConnection = async () => {
  try {
    const user = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '';
    const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim() : '';

    if (!user || !pass || user === 'YOUR_EMAIL_HERE' || user === 'OFFICIAL_EMAIL_ADDRESS') {
      console.warn('⚠️  [EMAIL SERVICE] Configuration missing: EMAIL_USER or EMAIL_PASS is not set in backend/.env');
      return false;
    }

    const transporter = getTransporter();
    await transporter.verify();
    console.log('✅ [EMAIL SERVICE] SMTP Transporter connected & initialized successfully.');
    return true;
  } catch (error) {
    console.error('❌ [EMAIL SERVICE] SMTP Connection check failed:', error.message);
    return false;
  }
};

/**
 * Send a 6-digit OTP verification code email to the target user.
 * @param {string} toEmail - Target recipient email entered by user
 * @param {string} code - 6-digit OTP code
 * @param {string} [name='Learner'] - Recipient name
 */
export const sendVerificationEmail = async (toEmail, code, name = 'Learner') => {
  if (!toEmail || typeof toEmail !== 'string') {
    throw new Error('Valid recipient email address is required.');
  }

  const recipientEmail = toEmail.toLowerCase().trim();

  let transporter;
  try {
    transporter = getTransporter();
  } catch (configError) {
    console.error(`Email dispatch failed to ${recipientEmail}: ${configError.message}`);
    return {
      success: false,
      error: configError.message,
    };
  }

  const senderUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : 'no-reply@learnai.com';
  const sender = process.env.EMAIL_FROM
    ? process.env.EMAIL_FROM.trim()
    : `"AI Learning Platform" <${senderUser}>`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #1e293b; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);">
      <div style="text-align: center; margin-bottom: 28px;">
        <h1 style="color: #818cf8; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">AI Learning Platform</h1>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 6px;">Account Security & Email Verification</p>
      </div>
      
      <div style="background-color: #1e293b; padding: 28px; border-radius: 12px; text-align: center; margin-bottom: 24px; border: 1px solid #334155;">
        <p style="color: #f8fafc; font-size: 15px; margin-bottom: 10px;">Hello ${name},</p>
        <p style="color: #94a3b8; font-size: 13px; margin-bottom: 24px; line-height: 1.5;">
          Thank you for registering with our AI Learning Platform.<br/>
          Your verification code is:
        </p>
        
        <div style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #6366f1; background-color: #0f172a; padding: 18px 24px; border-radius: 12px; display: inline-block; border: 1px solid #4f46e5; margin: 8px 0; font-family: monospace;">
          ${code}
        </div>
        
        <p style="color: #cbd5e1; font-size: 13px; margin-top: 24px;">
          This code expires in <strong>5 minutes</strong>.
        </p>
      </div>
      
      <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0; line-height: 1.6;">
        For security, do not share this code with anyone.<br/>
        If you did not request this verification code, you can safely ignore this email.
      </p>
      
      <div style="border-top: 1px solid #1e293b; margin-top: 28px; padding-top: 20px; text-align: center;">
        <p style="color: #475569; font-size: 11px; margin: 0;">Regards,<br/><strong>AI Learning Platform Team</strong></p>
      </div>
    </div>
  `;

  const textContent = `AI Learning Platform\n\nHello ${name},\n\nThank you for registering with our AI Learning Platform.\n\nYour verification code is:\n${code}\n\nThis code expires in 5 minutes.\n\nIf you did not request this verification code, you can safely ignore this email.\n\nRegards,\nAI Learning Platform Team`;

  try {
    const info = await transporter.sendMail({
      from: sender,
      to: recipientEmail,
      subject: `Verify your AI Learning Platform account`,
      text: textContent,
      html: htmlContent,
    });

    console.log(`📧 Verification email dispatched successfully to ${recipientEmail}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send verification email to ${recipientEmail}:`, error.message);
    return {
      success: false,
      error: 'Unable to send verification email. Please try again later.',
    };
  }
};

