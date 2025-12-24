export function generateOTPEmailTemplate(recipientName, otp, expiryMinutes = 10) {
  const otpDigits = otp.split('');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Email Verification Code</title>
</head>
<body>
    <div>
        <h1>Email Verification</h1>
        <p>Hello ${recipientName || 'there'},</p>
        <p>Your verification code is: ${otp}</p>
        <p>This code will expire in ${expiryMinutes} minutes.</p>
        <p>Best regards,<br>The TaskMaster Team</p>
    </div>
</body>
</html>
  `;
}

export function generateOTPEmailPlainText(recipientName, otp, expiryMinutes = 10) {
  return `Hello ${recipientName || 'there'},\n\nYour verification code is: ${otp}\n\nThis code will expire in ${expiryMinutes} minutes.\n\nBest regards,\nThe TaskMaster Team`;
}

export default {
  generateOTPEmailTemplate,
  generateOTPEmailPlainText
};