const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend-ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
    const subject = 'Welcome to Backend Ledger - Registration Successful';
    
    const text = `Hello ${name},\n\nWelcome to Backend Ledger! Your registration was successful.\n\nYou can now log in to your account to manage your finances, make transfers, and track your transactions securely.\n\nSecurity Tip: We will never ask for your password. Please keep your account details secure.\n\nBest Regards,\nThe Backend Ledger Team`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #2c3e50; text-align: center;">Welcome to Backend Ledger!</h2>
        <p style="font-size: 16px; color: #333;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Thank you for registering with us. We are thrilled to have you on board.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; font-size: 15px; color: #555;">With your new account, you can:</p>
          <ul style="font-size: 15px; color: #555; padding-left: 20px;">
            <li>Manage your finances easily</li>
            <li>Transfer funds securely</li>
            <li>Track all your transactions in real-time</li>
          </ul>
        </div>
        <p style="font-size: 14px; color: #d9534f; background-color: #f2dede; padding: 10px; border-radius: 5px;">
          <strong>Security Tip:</strong> We will never ask for your password or PIN. Please keep your account details secure.
        </p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          Best Regards,<br>
          <strong>The Backend Ledger Team</strong>
        </p>
      </div>
    `;
  
    await sendEmail(userEmail, subject, text, html);

}

async function sendAccountAlertEmail(userEmail, name, alertMessage) {
    const subject = 'Security Alert - Backend Ledger';
    const text = `Hello ${name},\n\nWe noticed some activity on your account: ${alertMessage}\n\nIf this was you, no further action is needed. If you did not authorize this, please contact support immediately.`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f5c6cb; border-radius: 8px; background-color: #fdf7f7;">
        <h2 style="color: #c9302c; text-align: center;">Security Alert</h2>
        <p style="font-size: 16px; color: #333;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #333;">We noticed the following activity on your Backend Ledger account:</p>
        <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #c9302c;">
          <p style="margin: 0; font-size: 15px; color: #555;"><strong>${alertMessage}</strong></p>
        </div>
        <p style="font-size: 15px; color: #333;">If this was you, no further action is needed.</p>
        <p style="font-size: 15px; color: #c9302c; font-weight: bold;">If you did not authorize this activity, please contact support immediately and change your password.</p>
        <hr style="border: none; border-top: 1px solid #f5c6cb; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          Stay secure,<br><strong>The Backend Ledger Team</strong>
        </p>
      </div>
    `;
    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount){

  const subject = 'Transaction Notification - Backend Ledger';
  const text = `Hello ${name},\n\nYour transaction of INR ${amount} to account ${toAccount} has been processed successfully.\n\nThank you for using Backend Ledger.`;
  const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d4edda; border-radius: 8px; background-color: #f0f9f4;">
        <h2 style="color: #3c763d; text-align: center;">Transaction Successful</h2>
        <p style="font-size: 16px; color: #333;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Your recent transaction has been processed successfully.</p>
        <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3c763d;">
          <p style="margin: 5px 0; font-size: 15px; color: #555;"><strong>Amount:</strong> INR ${amount}</p>
          <p style="margin: 5px 0; font-size: 15px; color: #555;"><strong>To Account:</strong> ${toAccount}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #d4edda; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          Thank you for using Backend Ledger.<br><strong>The Backend Ledger Team</strong>
        </p>
      </div>
  `;
  await sendEmail(userEmail, subject, text, html);

}

async function sendTransactionFailedEmail(userEmail, name, amount, toAccount){

  const subject = 'Transaction Notification - Backend Ledger';
  const text = `Hello ${name},\n\nYour transaction of INR ${amount} to account ${toAccount} has failed.\n\nPlease check your account balance or contact support if the issue persists.\n\nThank you for using Backend Ledger.`;
  const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f5c6cb; border-radius: 8px; background-color: #fdf7f7;">
        <h2 style="color: #c9302c; text-align: center;">Transaction Failed</h2>
        <p style="font-size: 16px; color: #333;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Unfortunately, your recent transaction has failed.</p>
        <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #c9302c;">
          <p style="margin: 5px 0; font-size: 15px; color: #555;"><strong>Amount:</strong> INR ${amount}</p>
          <p style="margin: 5px 0; font-size: 15px; color: #555;"><strong>To Account:</strong> ${toAccount}</p>
        </div>
        <p style="font-size: 15px; color: #333;">Please check your account balance or contact support if the issue persists.</p>
        <hr style="border: none; border-top: 1px solid #f5c6cb; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          Thank you for using Backend Ledger.<br><strong>The Backend Ledger Team</strong>
        </p>
      </div>
  `;
  await sendEmail(userEmail, subject, text, html);

}

module.exports = { sendRegistrationEmail, sendAccountAlertEmail, sendTransactionEmail, sendTransactionFailedEmail };