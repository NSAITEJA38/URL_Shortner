import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  let transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Use real Gmail if credentials are provided
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Fallback to Ethereal Email (Fake SMTP) for testing without credentials
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const mailOptions = {
    from: `"URL Shortener" <${process.env.EMAIL_USER || "test@urlshortener.com"}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);

  if (!process.env.EMAIL_USER) {
    // Test email sent via Ethereal, URL is accessible via nodemailer.getTestMessageUrl(info)
  }
};
