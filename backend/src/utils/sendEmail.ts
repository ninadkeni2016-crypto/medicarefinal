import nodemailer from 'nodemailer';

// Create transporter lazily so it always uses the env vars
// that dotenv loaded, not the ones available at import time.
const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  
  if (!user || !pass) {
    console.warn('⚠️ [EMAIL] Missing EMAIL_USER or EMAIL_PASS environment variables. Email sending will be skipped.');
    return null;
  }

  // Debug log (do not log pass in production, but let's confirm user is found)
  console.log(`📡 [EMAIL] Initializing transporter for: ${user}`);

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: { user, pass },
    family: 4 // Force IPv4 to avoid ENETUNREACH issues with IPv6 on some hosts like Render
  } as any);
};

export const sendVerificationEmail = async (to: string, otp: string, name: string) => {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.log('[DEV] Skipping verification email. OTP:', otp, 'for', to);
      return;
    }

    const mailOptions = {
      from: `"Medicare" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Verify your Medicare account',
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: #0f172a; padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Medicare</h1>
            <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">Your Health, Our Priority</p>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #0f172a; margin: 0 0 8px;">Hello, ${name}! 👋</h2>
            <p style="color: #64748b; margin: 0 0 24px; line-height: 1.6;">
              Thank you for signing up. Please use the verification code below to confirm your email address and activate your account.
            </p>
            <div style="background: #f0f9ff; border: 2px dashed #0ea5e9; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <p style="color: #64748b; margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
              <p style="color: #0284c7; font-size: 42px; font-weight: 800; letter-spacing: 12px; margin: 0;">${otp}</p>
            </div>
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
              This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
            </p>
          </div>
          <div style="background: #f8fafc; padding: 16px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 Medicare. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL] Verification email sent to: ${to}`);
  } catch (error) {
    console.error('❌ [EMAIL] Error sending verification email:', error);
  }
};

export const sendAppointmentConfirmationEmail = async (
  to: string,
  details: { patientName: string; doctorName: string; specialization: string; date: string; time: string; type: string }
) => {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.log('[DEV] Skipping appointment email for', to, 'details:', details);
      return;
    }

    const mailOptions = {
      from: `"Medicare" <${process.env.EMAIL_USER}>`,
      to,
      subject: '✅ Appointment Confirmed - Medicare',
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: #0f172a; padding: 28px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Medicare</h1>
            <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">Appointment Confirmation</p>
          </div>
          <div style="padding: 28px;">
            <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; border-left: 4px solid #22c55e; margin-bottom: 20px;">
              <p style="color: #15803d; font-weight: 700; margin: 0; font-size: 15px;">✅ Your appointment is confirmed!</p>
            </div>
            <p style="color: #64748b; margin: 0 0 20px; line-height: 1.6;">Hi <strong>${details.patientName}</strong>, your appointment has been successfully booked. Here are the details:</p>
            <table style="width: 100%; border-collapse: collapse;">
              ${[
                ['👨‍⚕️ Doctor', details.doctorName],
                ['🏥 Specialization', details.specialization],
                ['📅 Date', details.date],
                ['⏰ Time', details.time],
                ['💬 Type', details.type],
              ].map(([label, value]) => `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; width: 40%">${label}</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 600; font-size: 13px;">${value}</td>
                </tr>
              `).join('')}
            </table>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">Please arrive 10 minutes early for in-person appointments.</p>
          </div>
          <div style="background: #f8fafc; padding: 14px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 Medicare. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL] Appointment confirmation email sent to: ${to}`);
  } catch (error) {
    console.error('❌ [EMAIL] Error sending appointment email:', error);
  }
};

export const sendPrescriptionEmail = async (
  to: string,
  details: { patientName: string; doctorName: string; date: string; medicines: { name: string; dosage: string; frequency: string; duration: string }[]; notes: string }
) => {
  try {
    const medicineRows = details.medicines.map((med, i) => `
      <tr style="background: ${i % 2 === 0 ? '#f8fafc' : '#fff'}">
        <td style="padding: 10px 12px; font-weight: 600; color: #0f172a; font-size: 13px;">${med.name}</td>
        <td style="padding: 10px 12px; color: #64748b; font-size: 13px;">${med.dosage}</td>
        <td style="padding: 10px 12px; color: #64748b; font-size: 13px;">${med.frequency}</td>
        <td style="padding: 10px 12px; color: #64748b; font-size: 13px;">${med.duration}</td>
      </tr>
    `).join('');

    const transporter = getTransporter();
    if (!transporter) {
      console.log('[DEV] Skipping prescription email for', to, 'details:', details);
      return;
    }

    const mailOptions = {
      from: `"Medicare" <${process.env.EMAIL_USER}>`,
      to,
      subject: '💊 New Prescription - Medicare',
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: #0f172a; padding: 28px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Medicare</h1>
            <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">Prescription Details</p>
          </div>
          <div style="padding: 28px;">
            <p style="color: #64748b; margin: 0 0 6px;">Hi <strong>${details.patientName}</strong>,</p>
            <p style="color: #64748b; margin: 0 0 20px; line-height: 1.6;"><strong>Dr. ${details.doctorName}</strong> has issued a new prescription for you on <strong>${details.date}</strong>.</p>

            <h3 style="color: #0f172a; font-size: 14px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.5px;">💊 Medicines</h3>
            <table style="width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0;">
              <thead>
                <tr style="background: #0f172a;">
                  <th style="padding: 10px 12px; color: #fff; font-size: 12px; text-align: left;">Medicine</th>
                  <th style="padding: 10px 12px; color: #fff; font-size: 12px; text-align: left;">Dosage</th>
                  <th style="padding: 10px 12px; color: #fff; font-size: 12px; text-align: left;">Frequency</th>
                  <th style="padding: 10px 12px; color: #fff; font-size: 12px; text-align: left;">Duration</th>
                </tr>
              </thead>
              <tbody>${medicineRows}</tbody>
            </table>

            ${details.notes ? `
            <div style="background: #fffbeb; border-radius: 10px; padding: 14px; margin-top: 18px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; font-size: 13px; color: #92400e;"><strong>📝 Doctor's Notes:</strong></p>
              <p style="margin: 6px 0 0; font-size: 13px; color: #78350f;">${details.notes}</p>
            </div>` : ''}

            <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">Please follow the prescription carefully. Contact your doctor if you have any questions.</p>
          </div>
          <div style="background: #f8fafc; padding: 14px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 Medicare. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL] Prescription email sent to: ${to}`);
  } catch (error) {
    console.error('❌ [EMAIL] Error sending prescription email:', error);
  }
};

export const sendCancellationEmail = async (
  to: string,
  details: { patientName: string; doctorName: string; date: string; time: string; cancelledBy: string }
) => {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.log('[DEV] Skipping cancellation email for', to, 'details:', details);
      return;
    }

    const mailOptions = {
      from: `"Medicare" <${process.env.EMAIL_USER}>`,
      to,
      subject: '❌ Appointment Cancelled - Medicare',
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: #0f172a; padding: 28px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Medicare</h1>
            <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">Appointment Update</p>
          </div>
          <div style="padding: 28px;">
            <div style="background: #fef2f2; border-radius: 12px; padding: 16px; border-left: 4px solid #ef4444; margin-bottom: 20px;">
              <p style="color: #b91c1c; font-weight: 700; margin: 0; font-size: 15px;">❌ Appointment Cancelled</p>
            </div>
            <p style="color: #64748b; margin: 0 0 20px; line-height: 1.6;">Hello, the appointment for <strong>${details.patientName}</strong> with <strong>Dr. ${details.doctorName}</strong> on <strong>${details.date} at ${details.time}</strong> has been cancelled.</p>
            <p style="color: #64748b; margin: 0 0 20px; line-height: 1.6;"><em>Cancelled by: ${details.cancelledBy}</em></p>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">If this was a mistake, please visit the app to reschedule.</p>
          </div>
          <div style="background: #f8fafc; padding: 14px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 Medicare. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL] Cancellation email sent to: ${to}`);
  } catch (error) {
    console.error('❌ [EMAIL] Error sending cancellation email:', error);
  }
};

export const sendPaymentSuccessEmail = async (
  to: string,
  details: { patientName: string; amount: number; transactionId: string; date: string }
) => {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.log('[DEV] Skipping payment email for', to, 'details:', details);
      return;
    }

    const mailOptions = {
      from: `"Medicare" <${process.env.EMAIL_USER}>`,
      to,
      subject: '💳 Payment Receipt - Medicare',
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: #0f172a; padding: 28px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Medicare</h1>
            <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">Payment Receipt</p>
          </div>
          <div style="padding: 28px;">
            <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; border-left: 4px solid #22c55e; margin-bottom: 20px;">
              <p style="color: #15803d; font-weight: 700; margin: 0; font-size: 15px;">✅ Payment Successful</p>
            </div>
            <p style="color: #64748b; margin: 0 0 20px; line-height: 1.6;">Hi <strong>${details.patientName}</strong>, we have received your payment of <strong>₹${details.amount}</strong>.</p>
            <table style="width: 100%; border-collapse: collapse;">
              ${[
                ['🧾 Transaction ID', details.transactionId],
                ['📅 Date', details.date],
                ['💰 Amount', `₹${details.amount}`],
              ].map(([label, value]) => `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; width: 40%">${label}</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 600; font-size: 13px;">${value}</td>
                </tr>
              `).join('')}
            </table>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">Thank you for using Medicare.</p>
          </div>
          <div style="background: #f8fafc; padding: 14px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 Medicare. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL] Payment success email sent to: ${to}`);
  } catch (error) {
    console.error('❌ [EMAIL] Error sending payment email:', error);
  }
};
