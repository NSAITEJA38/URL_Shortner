import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"URL Shortener" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[EMAIL SENT] Successfully sent email to ${options.email}. Message ID: ${info.messageId}`);
      return info;
    } catch (gmailErr) {
      console.error("[EMAIL ERROR] Failed to send via Gmail SMTP:", gmailErr.message);
      // Don't crash the reset flow; allow fallback logging
    }
  }

  // Fallback mode (No SMTP configured or network issue)
  console.log(`\n========================================`);
  console.log(`[PASSWORD RESET EMAIL SIMULATION]`);
  console.log(`To: ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`========================================\n`);

  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"URL Shortener" <test@urlshortener.com>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    });

    console.log("Ethereal Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return info;
  } catch (etherealErr) {
    console.log("[EMAIL NOTICE] Ethereal test account unavailable. Token is active and logged.");
    return { delivered: false, mock: true };
  }
};
