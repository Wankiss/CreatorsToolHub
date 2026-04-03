import { Router } from "express";
import { db, contactMessagesTable } from "@workspace/db";

const router = Router();

router.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "validation_error", message: "Name, email, and message are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "validation_error", message: "Please provide a valid email address." });
    }

    await db.insert(contactMessagesTable).values({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || "",
      message: message.trim(),
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return res.status(500).json({ error: "server_error", message: "Failed to save message. Please try again." });
  }
});

export default router;
