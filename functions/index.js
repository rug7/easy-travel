const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const cors = require('cors')({ origin: true });

// Configure your email service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password
  }
});

exports.sendEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const { to, subject, html, from } = req.body;

    const mailOptions = {
      from: from || 'Easy Travel <noreply@easytravel.com>',
      to: to,
      subject: subject,
      html: html
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
    }
  });
});