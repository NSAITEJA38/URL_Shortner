import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: emailUser,
          pass: emailPass, // Google App Password (16 characters)
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
      });

      const mailOptions = {
        from: `"URL Shortener" <${emailUser}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[EMAIL DISPATCH SUCCESS] Real email sent to ${options.email}. Message ID: ${info.messageId}`);
      return info;
    } catch (err) {
      console.error("[EMAIL DISPATCH ERROR] Failed to send email via Gmail SMTP:", err.message);
      console.warn("TIP: For Gmail, make sure 2-Step Verification is ON and you generated an 'App Password' (16-letter code), not your normal Gmail password.");
      return { success: false, error: err.message };
    }
  }

  // If no SMTP credentials are configured in .env
  console.log(`\n========================================`);
  console.log(`[RESET EMAIL DISPATCH (NO SMTP CREDENTIALS)]`);
  console.log(`To: ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Notice: To send real emails to user inboxes, add EMAIL_USER and EMAIL_PASS in your .env file.`);
  console.log(`========================================\n`);

  return { success: true, delivered: false, notice: "SMTP credentials not provided" };
};
