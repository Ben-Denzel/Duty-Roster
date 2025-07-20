const { NotificationTemplate } = require('../models');

const defaultTemplates = [
  {
    type: 'roster_published',
    title_template: 'New Roster Published: {{roster_name}}',
    message_template: 'A new duty roster "{{roster_name}}" has been published for {{department_name}}. Please check your assigned shifts for the period {{start_date}} to {{end_date}}.',
    email_subject_template: 'New Duty Roster Published - {{roster_name}}',
    email_template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">SchedulaX - New Roster Published</h2>
        <p>Hello {{user_name}},</p>
        <p>A new duty roster "<strong>{{roster_name}}</strong>" has been published for {{department_name}}.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Period:</strong> {{start_date}} to {{end_date}}</p>
          <p><strong>Department:</strong> {{department_name}}</p>
        </div>
        <p>Please review your assigned shifts and confirm your availability.</p>
        <a href="{{action_url}}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Roster</a>
      </div>
    `,
    priority: 'normal',
    action_url_template: '/rosters/{{roster_id}}',
    expires_in_hours: 168, // 1 week
    variables: ['roster_name', 'department_name', 'user_name', 'start_date', 'end_date', 'roster_id']
  },
  {
    type: 'shift_assigned',
    title_template: 'New Shift Assignment',
    message_template: 'You have been assigned to a shift on {{shift_date}} from {{start_time}} to {{end_time}} at {{location}}.',
    email_subject_template: 'New Shift Assignment - {{shift_date}}',
    email_template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">New Shift Assignment</h2>
        <p>Hello {{user_name}},</p>
        <p>You have been assigned to a new shift:</p>
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Date:</strong> {{shift_date}}</li>
            <li><strong>Time:</strong> {{start_time}} - {{end_time}}</li>
            <li><strong>Position:</strong> {{position}}</li>
            <li><strong>Location:</strong> {{location}}</li>
          </ul>
        </div>
        <p>Please confirm your availability for this shift.</p>
        <a href="{{action_url}}" style="background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Schedule</a>
      </div>
    `,
    priority: 'high',
    action_url_template: '/my-schedule',
    expires_in_hours: 72, // 3 days
    variables: ['user_name', 'shift_date', 'start_time', 'end_time', 'position', 'location', 'shift_id']
  },
  {
    type: 'shift_unassigned',
    title_template: 'Shift Assignment Removed',
    message_template: 'You have been removed from the shift on {{shift_date}} from {{start_time}} to {{end_time}}.',
    email_subject_template: 'Shift Assignment Removed - {{shift_date}}',
    email_template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Shift Assignment Removed</h2>
        <p>Hello {{user_name}},</p>
        <p>You have been removed from the following shift:</p>
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Date:</strong> {{shift_date}}</li>
            <li><strong>Time:</strong> {{start_time}} - {{end_time}}</li>
            <li><strong>Position:</strong> {{position}}</li>
            <li><strong>Location:</strong> {{location}}</li>
          </ul>
        </div>
        <a href="{{action_url}}" style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Schedule</a>
      </div>
    `,
    priority: 'high',
    action_url_template: '/my-schedule',
    expires_in_hours: 72,
    variables: ['user_name', 'shift_date', 'start_time', 'end_time', 'position', 'location', 'shift_id']
  },
  {
    type: 'swap_request_received',
    title_template: 'Shift Swap Request',
    message_template: '{{requester_name}} has requested to {{request_type}} shifts with you on {{shift_date}}.',
    email_subject_template: 'Shift Swap Request from {{requester_name}}',
    email_template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Shift Swap Request</h2>
        <p>Hello {{user_name}},</p>
        <p><strong>{{requester_name}}</strong> has requested to {{request_type}} shifts with you.</p>
        <div style="background: #f5f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
          <p><strong>Shift Details:</strong></p>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Date:</strong> {{shift_date}}</li>
            <li><strong>Time:</strong> {{start_time}} - {{end_time}}</li>
            <li><strong>Type:</strong> {{request_type}}</li>
          </ul>
        </div>
        <p>Please review and respond to this request.</p>
        <a href="{{action_url}}" style="background: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Request</a>
      </div>
    `,
    priority: 'high',
    action_url_template: '/shift-swaps/{{swap_request_id}}',
    expires_in_hours: 48, // 2 days
    variables: ['user_name', 'requester_name', 'shift_date', 'start_time', 'end_time', 'request_type', 'swap_request_id']
  },
  {
    type: 'swap_request_approved',
    title_template: 'Shift Swap Approved',
    message_template: 'Your shift swap request has been approved by {{approved_by_name}}.',
    email_subject_template: 'Shift Swap Request Approved',
    email_template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Shift Swap Approved</h2>
        <p>Hello {{user_name}},</p>
        <p>Great news! Your shift swap request has been approved by <strong>{{approved_by_name}}</strong>.</p>
        <p>The changes will be reflected in your schedule shortly.</p>
        <a href="{{action_url}}" style="background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Schedule</a>
      </div>
    `,
    priority: 'normal',
    action_url_template: '/my-schedule',
    expires_in_hours: 24,
    variables: ['user_name', 'approved_by_name', 'swap_request_id']
  },
  {
    type: 'swap_request_rejected',
    title_template: 'Shift Swap Rejected',
    message_template: 'Your shift swap request has been rejected by {{rejected_by_name}}. {{reason}}',
    email_subject_template: 'Shift Swap Request Rejected',
    email_template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Shift Swap Rejected</h2>
        <p>Hello {{user_name}},</p>
        <p>Unfortunately, your shift swap request has been rejected by <strong>{{rejected_by_name}}</strong>.</p>
        {{#if reason}}<p><strong>Reason:</strong> {{reason}}</p>{{/if}}
        <p>You can submit a new request or contact your manager for more information.</p>
        <a href="{{action_url}}" style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Requests</a>
      </div>
    `,
    priority: 'normal',
    action_url_template: '/shift-swaps',
    expires_in_hours: 24,
    variables: ['user_name', 'rejected_by_name', 'reason', 'swap_request_id']
  },
  {
    type: 'roster_needs_approval',
    title_template: 'Roster Awaiting Approval',
    message_template: 'A new roster "{{roster_name}}" has been submitted and requires your approval.',
    email_subject_template: 'Roster Approval Required - {{roster_name}}',
    email_template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">Roster Approval Required</h2>
        <p>Hello {{user_name}},</p>
        <p>A new roster "<strong>{{roster_name}}</strong>" has been submitted by {{created_by_name}} and requires your approval.</p>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
          <p><strong>Roster Details:</strong></p>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Department:</strong> {{department_name}}</li>
            <li><strong>Period:</strong> {{start_date}} to {{end_date}}</li>
            <li><strong>Created by:</strong> {{created_by_name}}</li>
          </ul>
        </div>
        <p>Please review and approve or reject this roster.</p>
        <a href="{{action_url}}" style="background: #d97706; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Roster</a>
      </div>
    `,
    priority: 'high',
    action_url_template: '/roster-approvals/{{roster_id}}',
    expires_in_hours: 72,
    variables: ['user_name', 'roster_name', 'department_name', 'start_date', 'end_date', 'created_by_name', 'roster_id']
  },
  {
    type: 'welcome',
    title_template: 'Welcome to DutyRoster!',
    message_template: 'Welcome {{user_name}}! Your account has been created successfully. You can now access the duty roster system.',
    email_subject_template: 'Welcome to DutyRoster - Account Created',
    email_template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to DutyRoster!</h2>
        <p>Hello {{user_name}},</p>
        <p>Welcome to the DutyRoster system! Your account has been successfully created.</p>
        <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <p><strong>Account Details:</strong></p>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Email:</strong> {{user_email}}</li>
            <li><strong>Role:</strong> {{role}}</li>
          </ul>
        </div>
        <p>You can now log in and start managing your duty schedules.</p>
        <a href="{{action_url}}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Access Dashboard</a>
      </div>
    `,
    priority: 'normal',
    action_url_template: '/dashboard',
    expires_in_hours: null,
    variables: ['user_name', 'user_email', 'role']
  },
  {
    type: 'roster_approved',
    title_template: 'Roster Approved: {{roster_name}}',
    message_template: 'The roster "{{roster_name}}" for {{department_name}} has been approved by {{approved_by_name}}.',
    email_subject_template: 'Roster Approved - {{roster_name}}',
    email_template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Roster Approved</h2>
        <p>Hello {{user_name}},</p>
        <p>The roster "<strong>{{roster_name}}</strong>" for {{department_name}} has been approved by <strong>{{approved_by_name}}</strong>.</p>
        <p>The roster is now active and employees have been notified of their assignments.</p>
        <a href="{{action_url}}" style="background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Roster</a>
      </div>
    `,
    priority: 'normal',
    action_url_template: '/rosters/{{roster_id}}',
    expires_in_hours: 48,
    variables: ['user_name', 'roster_name', 'department_name', 'approved_by_name', 'roster_id']
  },
  {
    type: 'roster_rejected',
    title_template: 'Roster Rejected: {{roster_name}}',
    message_template: 'The roster "{{roster_name}}" for {{department_name}} has been rejected by {{rejected_by_name}}. {{reason}}',
    email_subject_template: 'Roster Rejected - {{roster_name}}',
    email_template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Roster Rejected</h2>
        <p>Hello {{user_name}},</p>
        <p>The roster "<strong>{{roster_name}}</strong>" for {{department_name}} has been rejected by <strong>{{rejected_by_name}}</strong>.</p>
        {{#if reason}}<p><strong>Reason:</strong> {{reason}}</p>{{/if}}
        <p>The roster creator will need to make revisions and resubmit for approval.</p>
        <a href="{{action_url}}" style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Roster</a>
      </div>
    `,
    priority: 'normal',
    action_url_template: '/rosters/{{roster_id}}',
    expires_in_hours: 48,
    variables: ['user_name', 'roster_name', 'department_name', 'rejected_by_name', 'reason', 'roster_id']
  }
];

async function seedNotificationTemplates() {
  try {
    console.log('Seeding notification templates...');
    
    for (const template of defaultTemplates) {
      const [instance, created] = await NotificationTemplate.findOrCreate({
        where: { type: template.type },
        defaults: template
      });
      
      if (created) {
        console.log(`Created template: ${template.type}`);
      } else {
        console.log(`Template already exists: ${template.type}`);
      }
    }
    
    console.log('Notification templates seeding completed!');
  } catch (error) {
    console.error('Error seeding notification templates:', error);
    throw error;
  }
}

module.exports = {
  seedNotificationTemplates,
  defaultTemplates
};
