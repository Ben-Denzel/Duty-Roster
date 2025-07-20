require('dotenv').config();
const EmailService = require('./src/services/EmailService');

async function testEmail() {
  try {
    console.log('🔧 Testing email configuration...');
    console.log('SMTP Host:', process.env.SMTP_HOST);
    console.log('SMTP User:', process.env.SMTP_USER);
    console.log('SMTP From:', process.env.SMTP_FROM);
    
    // Test configuration
    const configTest = await EmailService.testConfiguration();
    console.log('Configuration test:', configTest);
    
    if (!configTest.success) {
      console.error('❌ Email configuration failed:', configTest.message);
      return;
    }
    
    console.log('✅ Email configuration is valid');
    
    // Send test email
    console.log('📧 Sending test email to 10bendenzel@gmail.com...');
    
    const result = await EmailService.sendNotificationEmail({
      to: '10bendenzel@gmail.com',
      userName: 'Ben Denzel',
      subject: 'DutyRoster Test Email',
      htmlTemplate: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Email Test Successful!</h2>
          <p>Hello {{user_name}},</p>
          <p>This is a test email from your DutyRoster notification system.</p>
          <p>If you're reading this, email notifications are working correctly!</p>
          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <p><strong>Test Details:</strong></p>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>Sent at:</strong> {{current_time}}</li>
              <li><strong>From:</strong> {{app_name}} System</li>
            </ul>
          </div>
          <p>You can now expect to receive notifications for roster updates, shift assignments, and more!</p>
        </div>
      `,
      variables: {
        user_name: 'Ben Denzel',
        current_time: new Date().toLocaleString(),
        app_name: 'DutyRoster'
      }
    });
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('Message ID:', result.messageId);
      console.log('📬 Check your inbox at 10bendenzel@gmail.com');
    } else {
      console.error('❌ Failed to send test email:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

testEmail().then(() => {
  console.log('🏁 Email test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Email test crashed:', error);
  process.exit(1);
});
