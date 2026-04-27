import Suggestion from '../models/Suggestion.js';
import nodemailer from 'nodemailer';
import { wardenConfig, chiefWardenEmails } from '../config/wardenConfig.js';

// Submit suggestion
export const submitSuggestion = async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASS
      }
    });

    

    const { suggestionText, recipientType } = req.body;
    const { name, roomNumber, hostel } = req.auth;

    if (!suggestionText || !recipientType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Save to MongoDB (always, with full details)
    const suggestion = new Suggestion({
      name,
      roomNumber,
      hostel,
      suggestionText,
      recipientType
    });
    await suggestion.save();

    // Send email if warden or chief warden
    if (recipientType === 'hostel_warden') {
      const warden = wardenConfig[hostel];
      if (warden) {
        await transporter.sendMail({
          from: `"Smart Mess - Anonymous" <${process.env.EMAIL_USER}>`,
          to: warden.wardenEmail,
          subject: `Anonymous Suggestion - ${hostel}`,
          html: `
            <h3>Anonymous Suggestion/Complaint</h3>
            <p><strong>Hostel:</strong> ${hostel}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            <hr/>
            <p><strong>Message:</strong></p>
            <p>${suggestionText}</p>
            <hr/>
            <small style="color:gray;">Sender identity is anonymous. Contact developer if tracking is needed.</small>
          `
        }).then(() => console.log('✅ Email sent to:', warden.wardenEmail))
          .catch(err => console.log('❌ Email error:', err.message));
      }
    } else if (recipientType === 'chief_warden') {
      await transporter.sendMail({
        from: `"Smart Mess - Anonymous" <${process.env.EMAIL_USER}>`,
        to: chiefWardenEmails.join(','),
        subject: `Anonymous Suggestion - ${hostel}`,
        html: `
          <h3>Anonymous Suggestion/Complaint</h3>
          <p><strong>Hostel:</strong> ${hostel}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
          <hr/>
          <p><strong>Message:</strong></p>
          <p>${suggestionText}</p>
          <hr/>
          <small style="color:gray;">Sender identity is anonymous. Contact developer if tracking is needed.</small>
        `
      }).then(() => console.log('✅ Chief warden email sent'))
        .catch(err => console.log('❌ Email error:', err.message));
    }

    res.status(201).json({ message: 'Suggestion submitted successfully' });

  } catch (error) {
    console.error('Suggestion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get suggestions for admin portal (ONLY mess_secretary type)
export const getMessSuggestions = async (req, res) => {
  try {
    const { hostel } = req.params;
    const suggestions = await Suggestion.find({
      hostel,
      recipientType: 'mess_secretary'
    }).sort({ createdAt: -1 });

    // Return anonymized data for admin portal
    const anonymized = suggestions.map(s => ({
      _id: s._id,
      hostel: s.hostel,
      suggestionText: s.suggestionText,
      date: s.date,
      createdAt: s.createdAt
    }));

    res.json(anonymized);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};