const nodemailer = require("nodemailer");

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
const SMTP_SECURE = process.env.SMTP_SECURE ? String(process.env.SMTP_SECURE).toLowerCase() === 'true' : true;

const EMAIL_USER = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : undefined;
const EMAIL_PASS = process.env.EMAIL_PASS ? String(process.env.EMAIL_PASS).replace(/\s+/g, '') : undefined;
const SMTP_USER = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : EMAIL_USER;
const SMTP_PASS = process.env.SMTP_PASS ? String(process.env.SMTP_PASS).replace(/\s+/g, '') : EMAIL_PASS;

const getTransporter = async () => {
  if (!SMTP_USER || !SMTP_PASS) {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const sendEmail = async (options) => {
  const mailOptions = {
    from: `"Refershelf" <${SMTP_USER || 'no-reply@example.com'}>`,
    to: options.to,
    subject: options.subject,
    html: options.html || options.text,
  };

  let transporter = await getTransporter();

  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[sendEmail] SMTP send failed for user', SMTP_USER, 'host', SMTP_HOST, 'port', SMTP_PORT, 'secure', SMTP_SECURE, 'falling back to Ethereal test account:', err.message);
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await transporter.sendMail(mailOptions);
      return {
        previewUrl: nodemailer.getTestMessageUrl(info),
      };
    }

    throw err;
  }
};

module.exports = { sendEmail };
