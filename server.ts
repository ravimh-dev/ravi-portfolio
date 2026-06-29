import express from "express";
import path from "path";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Load local environment variables first, then default .env
dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
app.use(express.json());

// In production, serve the built frontend assets
const distPath = path.resolve(import.meta.dirname, "dist");
app.use(express.static(distPath));

// API endpoint for email sending
app.post("/api/contact", async (req: express.Request, res: express.Response): Promise<any> => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required fields." });
  }

  // Create transporter configuration from SMTP settings in environment
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const smtpSecure = process.env.SMTP_SECURE === "true";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const emailTo = process.env.EMAIL_TO || smtpUser;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.error("SMTP Configuration Missing:", { smtpHost, smtpUser, smtpPassHasValue: !!smtpPass });
    return res.status(500).json({ 
      error: "Server SMTP configuration is incomplete. Please check your environment variables." 
    });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  const mailOptions = {
    from: `"${name}" <${smtpUser}>`, // SMTP servers like Gmail often rewrite "from" to the authenticated user
    to: emailTo,
    replyTo: email, // Set Reply-To to the sender's actual email address so replying works
    subject: `Portfolio Contact from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <h3>New Message from Portfolio Contact Form</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Message:</strong></p>
      <div style="border-left: 3px solid #ccc; padding-left: 10px; white-space: pre-wrap;">${message}</div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Email successfully sent from ${email} to ${emailTo}`);
    return res.status(200).json({ success: true, message: "Your message has been sent successfully!" });
  } catch (error: any) {
    console.error("[SMTP] Error sending mail:", error);
    return res.status(500).json({ 
      error: "Failed to dispatch email. Please try again later.",
      details: error.message 
    });
  }
});

// Fallback for SPA routing in production
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`[SERVER] Express SMTP server running on port ${PORT}`);
});
