require('dotenv').config();

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


// SQLite setup
const db = new sqlite3.Database('bookings.db');
db.run(`CREATE TABLE IF NOT EXISTS bookings(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT,
  date TEXT UNIQUE,
  details TEXT
)`);

// Check availability
app.get('/availability', (req, res) => {
  const { date } = req.query;
  db.get('SELECT * FROM bookings WHERE date = ?', [date], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json({ available: !row });
  });
});

// Make a booking
app.post('/book', async (req, res) => {
  const { name, email, date, details } = req.body;

  db.run(
    'INSERT INTO bookings(name,email,date,details) VALUES(?,?,?,?)',
    [name, email, date, details],
    async (err) => {
      if (err) {
        console.error(err);
        return res.status(400).json({ message: 'Date already booked' });
      }

      try {
        // 1️⃣ CREATE TRANSPORTER
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "thapspaint8@gmail.com",
            pass: process.env.EMAIL_PASS // App password from Gmail
          }
        });

        // 2️⃣ SEND EMAIL TO THE ARTIST
        try {
          await transporter.sendMail({
            from: `"Booking Bot" <thapspaint8@gmail.com>`,
            to: "thapspaint8@gmail.com",
            subject: `New Tattoo Booking from ${name}`,
            text: `
        New booking received:

        Name: ${name}
        Email: ${email}
        Date: ${date}
        Details: ${details}
            `
          });

          console.log("✅ Email sent successfully");

        } catch (error) {
          console.error("❌ Email failed:", error);
        }

        // 3️⃣ RESPOND TO CLIENT
        res.json({ message: 'Booking confirmed and email sent to artist!' });
      } catch (emailError) {
        console.error('Email failed:', emailError);
        res.json({
          message:
            'Booking confirmed, but email failed to send. Check server logs.'
        });
      }
    }
  );
});

const PORT = process.env.PORT || 3000; // Use Render’s port, fallback to 3000 for local dev

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

