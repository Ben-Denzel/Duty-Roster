# Email Notifications Setup Guide

## 📧 Email System Overview

The DutyRoster application has a complete email notification system already built-in! It includes:

- ✅ **Professional email templates** with branding
- ✅ **Automatic email sending** for all notification types
- ✅ **User preferences** for email control
- ✅ **Email frequency settings** (immediate, hourly, daily, weekly)
- ✅ **HTML and plain text** email support
- ✅ **SMTP and SendGrid** compatibility

## 🔧 Quick Setup

### 1. Configure SMTP Settings

Add these settings to your `backend/.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="DutyRoster System <noreply@dutyroster.com>"
APP_URL=http://localhost:5173
```

### 2. Gmail Setup (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use the app password** (not your regular password) in `SMTP_PASS`

### 3. Alternative Email Providers

#### **SendGrid** (Production Recommended)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### **Outlook/Hotmail**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### **Yahoo Mail**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

## 🎯 What Emails Are Sent

### **Automatic Notifications**
- 📋 **Roster Published** → "New roster available for your department"
- 👤 **Shift Assigned** → "You've been assigned to a shift on [date]"
- 🔄 **Swap Request** → "New shift swap request from [colleague]"
- ✅ **Swap Approved** → "Your shift swap has been approved"
- ❌ **Swap Rejected** → "Your shift swap has been rejected"
- 📝 **Roster Needs Approval** → "Roster requires your approval"
- 🎉 **Welcome** → "Welcome to DutyRoster!"

### **Email Features**
- **Professional HTML templates** with company branding
- **Action buttons** linking directly to relevant pages
- **Mobile-responsive** design
- **Plain text fallback** for accessibility
- **Unsubscribe options** via user preferences

## ⚙️ User Control

Users can control their email notifications through:

### **Notification Preferences** (`/notifications/preferences`)
- ✅ **Enable/disable email notifications** entirely
- ✅ **Choose email frequency**: Immediate, Hourly, Daily, Weekly
- ✅ **Select notification types** to receive via email
- ✅ **Email digest mode** (summary emails instead of individual)
- ✅ **Quiet hours** (no emails during specified times)

## 🧪 Testing Email Setup

### 1. **Test Configuration**
```bash
# In backend directory
node -e "
const EmailService = require('./src/services/EmailService');
EmailService.testConfiguration().then(result => {
  console.log('Email test result:', result);
  process.exit(result.success ? 0 : 1);
});
"
```

### 2. **Send Test Email** (as system admin)
1. Login as system admin
2. Go to `/notifications`
3. Click "Create Test Notification"
4. Check your email inbox

### 3. **Trigger Real Notifications**
1. Create and publish a roster → Employees get emails
2. Assign shifts → Employees get emails
3. Create swap requests → Target users get emails

## 🚀 Production Considerations

### **For Production Use:**
1. **Use SendGrid or similar service** (more reliable than Gmail)
2. **Set up proper domain** for sender address
3. **Configure SPF/DKIM records** to avoid spam filters
4. **Monitor email delivery rates**
5. **Set up bounce handling**

### **Security:**
- ✅ **Never commit SMTP credentials** to version control
- ✅ **Use environment variables** for all email settings
- ✅ **Rotate API keys regularly**
- ✅ **Monitor for unauthorized usage**

## 🎉 Ready to Use!

Once you add the SMTP settings to your `.env` file and restart the server, email notifications will work automatically! 

### **What Happens Next:**
1. **Users receive emails** for all enabled notification types
2. **Professional templates** with your branding
3. **Action buttons** link back to your application
4. **User preferences** are respected
5. **Delivery tracking** in notification records

The email system is production-ready and will enhance user engagement significantly! 📧✨

## 🔍 Troubleshooting

### **Common Issues:**
- **"Authentication failed"** → Check username/password
- **"Connection refused"** → Check SMTP host/port
- **"Emails not sending"** → Check server logs for errors
- **"Emails in spam"** → Set up proper domain/SPF records

### **Debug Mode:**
Set `NODE_ENV=development` to see detailed email logs in the console.
