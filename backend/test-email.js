import 'dotenv/config';
import nodemailer from 'nodemailer';

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });

    let info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Vista Support" <onboarding@resend.dev>',
      to: 'gcdeekshith202000303@gmail.com',
      subject: "Test Email from Resend",
      text: "This is a test email to verify credentials.",
    });

    console.log("Success! Email sent. Message ID:", info.messageId);
  } catch (error) {
    console.error("Failed to send email:", error.message);
  }
}

testEmail();
