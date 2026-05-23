const nodemailer = require('nodemailer');
const { sendEmail } = require('../utils/sendEmail');

const handleContactForm = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Send email to admin/support
    await sendEmail({
      to: 'referself08@gmail.com', // Admin email for contact form submissions
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // Optional: Send confirmation email to user
    await sendEmail({
      to: email,
      subject: 'Thank you for contacting ReferShelf',
      html: `
        <h2>Thank you for reaching out!</h2>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>Best regards,<br>The ReferShelf Team</p>
      `,
    });

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

module.exports = { handleContactForm };
