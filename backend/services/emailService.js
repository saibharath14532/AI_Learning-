import nodemailer from 'nodemailer';

let etherealTransporter = null;

/**
 * Creates and returns a Nodemailer transporter.
 * Supports:
 * 1. Standard SMTP / Gmail (if EMAIL_USER and EMAIL_PASS are set in .env)
 * 2. Ethereal Mail auto-generated test account (if SMTP credentials are not set)
 */
const getTransporter = async () => {
  const service = process.env.EMAIL_SERVICE;
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // 1. If explicit user & pass provided in .env, use them (Gmail or Custom SMTP)
  if (user && pass && user !== 'YOUR_EMAIL_HERE') {
    if (service) {
      return {
        transporter: nodemailer.createTransport({
          service,
          auth: { user, pass },
        }),
        isTest: false,
      };
    }
    return {
      transporter: nodemailer.createTransport({
        host: host || 'smtp.gmail.com',
        port,
        secure: port === 465,
        auth: { user, pass },
      }),
      isTest: false,
    };
  }

  // 2. Otherwise create / reuse Ethereal Test Account
  if (!etherealTransporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      etherealTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('----------------------------------------------------');
      console.log('📧 Ethereal Test Email Transporter initialized:');
      console.log(`User: ${testAccount.user}`);
      console.log('To send real emails to your Gmail inbox, configure EMAIL_USER & EMAIL_PASS in backend/.env');
      console.log('----------------------------------------------------');
    } catch (err) {
      console.warn('Could not create Ethereal test account, using console logger fallback:', err.message);
      return {
        transporter: {
          sendMail: async (options) => {
            console.log('====================================================');
            console.log(`📧 [EMAIL DISPATCH LOG] To: ${options.to}`);
            console.log(`Subject: ${options.subject}`);
            console.log(`OTP Code: ${options.subject.match(/\[(\d{6})\]/)?.[1] || 'N/A'}`);
            console.log('====================================================');
            return { messageId: `log_${Date.now()}` };
          },
        },
        isTest: true,
      };
    }
  }

  return { transporter: etherealTransporter, isTest: true };
};

/**
 * Send a 6-digit OTP verification code email to a user.
 * @param {string} toEmail - Recipient email address
 * @param {string} code - 6-digit OTP code
 * @param {string} [name='Learner'] - Recipient name
 */
export const sendVerificationEmail = async (toEmail, code, name = 'Learner') => {
  const { transporter, isTest } = await getTransporter();
  const sender = process.env.EMAIL_FROM || '"AI Learning Platform" <no-reply@learnai.com>';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #1e293b; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #818cf8; margin: 0; font-size: 24px; font-weight: 800; tracking: -0.5px;">AI Learning Platform</h1>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Account Email Verification</p>
      </div>
      
      <div style="background-color: #1e293b; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px; border: 1px solid #334155;">
        <p style="color: #f8fafc; font-size: 15px; margin-bottom: 8px;">Hello ${name},</p>
        <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">Thank you for registering with our AI Learning Platform. Use the verification code below to verify your email address:</p>
        
        <div style="font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #6366f1; background-color: #0f172a; padding: 18px 24px; border-radius: 12px; display: inline-block; border: 1px solid #4f46e5; margin: 8px 0;">
          ${code}
        </div>
        
        <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">This verification code will expire in <strong>5 minutes</strong>.</p>
      </div>
      
      <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">
        For security, do not share this code with anyone.<br/>
        If you did not request this verification code, you can safely ignore this email.
      </p>
      
      <div style="border-t: 1px solid #1e293b; margin-top: 24px; pt: 16px; text-align: center;">
        <p style="color: #475569; font-size: 11px;">Regards,<br/><strong>AI Learning Platform Team</strong></p>
      </div>
    </div>
  `;

  const textContent = `Hello ${name},\n\nThank you for registering with our AI Learning Platform.\n\nYour verification code is: ${code}\n\nThis code will expire in 5 minutes.\n\nFor security, do not share this code with anyone.\n\nRegards,\nAI Learning Platform Team`;

  try {
    const info = await transporter.sendMail({
      from: sender,
      to: toEmail,
      subject: `Verify Your Email — AI Learning Platform`,
      text: textContent,
      html: htmlContent,
    });


    let previewUrl = null;
    if (isTest && nodemailer.getTestMessageUrl) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('====================================================');
      console.log(`📧 [VERIFICATION CODE SENT] OTP: ${code}`);
      console.log(`Target Email: ${toEmail}`);
      if (previewUrl) {
        console.log(`🔗 Ethereal Email Preview URL: ${previewUrl}`);
      }
      console.log('====================================================');
    } else {
      console.log(`📧 Email sent successfully to ${toEmail}. Message ID: ${info.messageId}`);
    }

    return { success: true, messageId: info.messageId, previewUrl, isTest, code };
  } catch (error) {
    console.error(`Failed to send verification email to ${toEmail}:`, error.message);
    return { success: false, error: error.message, code };
  }
};
