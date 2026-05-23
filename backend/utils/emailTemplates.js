const warningEmailTemplate = (userName, warningCount) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Account Warning - ReferShelf</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
    .content { padding: 20px; background-color: #fff; border: 1px solid #dee2e6; border-radius: 5px; margin: 20px 0; }
    .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; font-size: 12px; color: #6c757d; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ReferShelf</h1>
      <h2>Account Warning Notice</h2>
    </div>

    <div class="content">
      <p>Dear ${userName},</p>

      <div class="warning">
        <h3>⚠️ Warning ${warningCount}</h3>
        <p>This is an official warning regarding your account activity on ReferShelf.</p>
        <p>Please review our community guidelines and ensure all future activities comply with our terms of service.</p>
      </div>

      <p>If you receive multiple warnings, your account may be subject to temporary suspension or permanent removal.</p>

      <p>If you believe this warning was issued in error, please contact our support team.</p>

      <p>Best regards,<br>The ReferShelf Team</p>
    </div>

    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
      <p>© 2024 ReferShelf. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const removalEmailTemplate = (userName) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Account Removal - ReferShelf</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f8d7da; padding: 20px; text-align: center; border-radius: 5px; }
    .content { padding: 20px; background-color: #fff; border: 1px solid #dee2e6; border-radius: 5px; margin: 20px 0; }
    .removal { background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; font-size: 12px; color: #6c757d; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ReferShelf</h1>
      <h2>Account Removal Notice</h2>
    </div>

    <div class="content">
      <p>Dear ${userName},</p>

      <div class="removal">
        <h3>🚫 Account Removal</h3>
        <p>Your ReferShelf account has been permanently removed due to repeated violations of our community guidelines and terms of service.</p>
      </div>

      <p>As a result of this removal:</p>
      <ul>
        <li>You will no longer be able to access your account</li>
        <li>All your uploaded resources have been removed</li>
        <li>Your profile and activity history are no longer visible</li>
      </ul>

      <p>If you believe this action was taken in error, you may appeal this decision by contacting our support team within 30 days of this notice.</p>

      <p>We appreciate your past contributions to our community and hope you understand the importance of maintaining a positive environment for all users.</p>

      <p>Best regards,<br>The ReferShelf Team</p>
    </div>

    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
      <p>© 2024 ReferShelf. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = {
  warningEmailTemplate,
  removalEmailTemplate
};
