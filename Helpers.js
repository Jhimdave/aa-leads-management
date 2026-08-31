/**
 * ============================================================================
 * Builds the Slack message based on notification type.
 * ============================================================================
 */
function buildSlackMessage(type, data, priorityUserId = null) {
  switch (type) {
    case 1: return newAppointment(data);
    case 2: return oneDayReminder(data, priorityUserId);
    case 3: return oneHourReminder(data, priorityUserId);
    case 4: return fiveMinuteReminder(data, priorityUserId);
    case 5: return newSubscription(data, priorityUserId);
    case 6: return newAuditAppointment(data);
    case 7: return newSABAppointment(data);
    case 8: return rescheduledAppointment(data);
    case 9: return cancelledAppointmentDM(data);
    case 10: return approvalReminder(data)
    default: throw new Error(`Unknown notification type: ${type}`);
  }
}

/**
 * ============================================================================
 * Notification #1 - New Appointment
 * ============================================================================
 */
function newAppointment(data) {
  const appointment = formatAppointmentMountainTime(data.appointment.date);

  return `Hi <@${data.owner.slack_user}>, <@${CONFIG.SLACK.ALEX_ID}>, <@${CONFIG.SLACK.DANIEL_ID}> 👋

\`\`\`
📅 NEW APPOINTMENT BOOKED

Appointment : ${appointment.date} (MDT)
Time        : ${appointment.time}
Name        : ${data.contact.name}
Email       : ${data.contact.email}
Phone       : ${data.contact.phone}
Service     : ${data.service.name}
Source      : ${data.service.source}
Meeting Link: ${data.appointment.meeting_id}
Location    : ${data.appointment.location}
\`\`\``;
}

/**
 * ============================================================================
 * Notification #6 - New Audit Appointment
 * ============================================================================
 */
function newAuditAppointment(data) {
  const appointment = formatAppointmentMountainTime(data.appointment.date);

  return `Hi <@${data.owner.slack_user}>, <@${CONFIG.SLACK.ALEX_ID}>, <@${CONFIG.SLACK.DANIEL_ID}> 👋

\`\`\`
📅 NEW AUDIT APPOINTMENT BOOKED

Appointment : ${appointment.date} (MDT)
Time        : ${appointment.time}
Name        : ${data.contact.name}
Email       : ${data.contact.email}
Phone       : ${data.contact.phone}
Source      : ${data.service.source}
Meeting Link: ${data.appointment.meeting_id}
Location    : ${data.appointment.location}
\`\`\``;
}

/**
 * ============================================================================
 * Notification #7 - New SAB Appointment
 * ============================================================================
 */
function newSABAppointment(data) {
  const appointment = formatAppointmentMountainTime(data.appointment.date);

  return `Hi <@${data.owner.slack_user}>, <@${CONFIG.SLACK.ALEX_ID}>, <@${CONFIG.SLACK.DANIEL_ID}>

\`\`\`
📅 NEW SAB APPOINTMENT BOOKED

Appointment : ${appointment.date} (MDT)
Time        : ${appointment.time}
Name        : ${data.contact.name}
Email       : ${data.contact.email}
Phone       : ${data.contact.phone}
Source      : ${data.service.source}
Meeting Link: ${data.appointment.meeting_id}
Location    : ${data.appointment.location}
\`\`\``;
}

/**
 * ============================================================================
 * Notification - 1 Day Reminder
 * ============================================================================
 */
function oneDayReminder(data, priorityUserId = null) {
  const userId = priorityUserId || data.owner.slack_user;
  const appointment = formatAppointmentMountainTime(data.appointment.date);
  const serviceLine = data.service?.name ? `\n\t• Service: ${data.service.name}` : "";

  return `Hi <@${userId}> 👋

Just a reminder that tomorrow you have a meeting with *${data.contact.name}* at *${appointment.time} MDT*.${serviceLine}`;
}

/**
 * ============================================================================
 * Notification #2 - 1 Hour Reminder
 * ============================================================================
 */
function oneHourReminder(data, priorityUserId = null) {
  const userId = priorityUserId || data.owner.slack_user;
  const appointment = formatAppointmentMountainTime(data.appointment.date);
  const serviceLine = data.service?.name ? `Service     : ${data.service.name}\n` : "";

  return `Hi <@${userId}> 👋

🚨 *APPOINTMENT STARTING SOON*

Your appointment starts in *1 hour*. Good luck!

\`\`\`
Time        : ${appointment.time}
Name        : ${data.contact.name}
Email       : ${data.contact.email}
${serviceLine}Meeting     : ${data.appointment.meeting_id}
Location    : ${data.appointment.location}
\`\`\`

Please join the meeting now.`;
}

/**
 * ============================================================================
 * Notification #3 - 5 Minute Reminder
 * ============================================================================
 */
function fiveMinuteReminder(data, priorityUserId = null) {
  const userId = priorityUserId || data.owner.slack_user;
  const appointment = formatAppointmentMountainTime(data.appointment.date);
  const serviceLine = data.service?.name ? `Service     : ${data.service.name}\n` : "";

  return `Hi <@${userId}> 👋

🚨 *APPOINTMENT STARTING SOON*

Your appointment starts in *5 minutes*. Good luck!

\`\`\`
Time        : ${appointment.time}
Name        : ${data.contact.name}
Email       : ${data.contact.email}
${serviceLine}Meeting     : ${data.appointment.meeting_id}
Location    : ${data.appointment.location}
\`\`\`

Please join the meeting now.`;
}

/**
 * ============================================================================
 * Notification #4 - New Lead
 * ============================================================================
 */
function newSubscription(data, priorityUserId = null) {
  const userId = priorityUserId || CONFIG.SLACK.DANIEL_ID;

  return `Hi <@${userId}> :wave:

:rotating_light: *New Lead!*

\t• Name: ${data.name}
\t• Email: ${data.email}
\t• Source: ${data.source}`;
}

/**
 * ============================================================================
 * Notification #8 - Appointment Rescheduled
 * ============================================================================
 */
function rescheduledAppointment(data) {
  const appointment = formatAppointmentMountainTime(data.appointment.date);

  return `Hi <@${data.owner.slack_user}>, <@${CONFIG.SLACK.ALEX_ID}>, <@${CONFIG.SLACK.DANIEL_ID}> 👋

\`\`\`
🔄 APPOINTMENT RESCHEDULED

New Date    : ${appointment.date} (MDT)
New Time    : ${appointment.time}
Name        : ${data.contact.name}
Email       : ${data.contact.email}
Phone       : ${data.contact.phone}
Service     : ${data.service.name}
Source      : ${data.service.source}
Meeting Link: ${data.appointment.meeting_id}
Location    : ${data.appointment.location}
\`\`\``;
}

function rescheduledAppointmentDM(data) {
  const appointment = formatAppointmentMountainTime(data.appointment.date);

  return `Hi <@${CONFIG.SLACK.MELISSA_ID}> 👋

\`\`\`
RESCHEDULE ALERT

Name : ${data.contact.name}
Email: ${data.contact.email}
New  : ${appointment.date} @ ${appointment.time} (MDT)
\`\`\``;
}

/**
 * ============================================================================
 * Notification #9 - Appointment Cancelled (Not Confirmed)
 * ============================================================================
 */
function cancelledAppointmentDM(data) {
  return `Hi <@${CONFIG.SLACK.MELISSA_ID}> 👋
 
\`\`\`
APPOINTMENT CANCELLED - NOT CONFIRMED

Name : ${data.contact.name}
Email: ${data.contact.email}
Note : Client hasn't confirmed attendance, appointment cancelled.
       Follow up for rescheduling is already sent
\`\`\``;
}

/**
 * ============================================================================
 * Notification #2 - Appointment Approval Reminder
 * ============================================================================
 */
function approvalReminder(data) {
  const appointment = formatAppointmentMountainTime(data.appointment.date);

  return `🔔 Appointment Approval

The client ${data.contact.name} has approved the appointment scheduled for today at ${appointment.time} MDT.`;
}

/**
 * ============================================================================
 * Short Lead DM (Newsletter / Audit) - sent to Melissa alongside channel post
 * ============================================================================
 */
function newLeadShortDM(data) {
  const name = data.name || data.contact?.name || "N/A";

  return `Hi <@${CONFIG.SLACK.MELISSA_ID}> 👋

\`\`\`
 New Lead: ${name}
 Source: ${data.contact.source}
\`\`\``;
}

function appointmentDetailsThread(data) {
  const appointment = data.appointment ? formatAppointmentMountainTime(data.appointment.date) : null;

  const contactInfo = [
    clean(data.contact?.name || data.name) && `Name        : ${clean(data.contact?.name || data.name)}`,
    clean(data.contact?.email || data.email) && `Email       : ${clean(data.contact?.email || data.email)}`,
    data.contact?.phone && `Phone       : ${phoneCell(data.contact.phone)}`
  ].filter(Boolean);

  const appointmentInfo = appointment ? [
    `Date        : ${appointment.date}`,
    `Time        : ${appointment.time}`,
    clean(data.appointment.meeting_id) && `Meeting ID  : ${clean(data.appointment.meeting_id)}`,
    clean(data.appointment.location) && `Location    : ${clean(data.appointment.location)}`
  ].filter(Boolean) : [];

  const publishingInfo = [
    clean(data.contact?.book_progress) && `Book Progress      : ${clean(data.contact.book_progress)}`,
    clean(data.contact?.service_interested) && `Service Interested : ${clean(data.contact.service_interested)}`
  ].filter(Boolean);

  const businessInfo = [
    clean(data.contact?.monthly_budget) && `Monthly Budget: ${clean(data.contact.monthly_budget)}`,
    clean(data.contact?.annual_revenue) && `Annual Revenue: ${clean(data.contact.annual_revenue)}`,
    clean(data.contact?.source || data.source) && `Source        : ${clean(data.contact?.source || data.source)}`
  ].filter(Boolean);

  const sections = [
    contactInfo.length ? contactInfo.join("\n") : null,
    appointmentInfo.length ? appointmentInfo.join("\n") : null,
    publishingInfo.length ? publishingInfo.join("\n") : null,
    businessInfo.length ? businessInfo.join("\n") : null
  ].filter(Boolean);

  return `Details

\`\`\`
${sections.join("\n\n")}
\`\`\``;
}


function shortMelissaDM(type, data) {
  const LABELS = {
    1: "New Appointment",
    5: "New Lead",
    6: "New Audit Appointment",
    7: "New SAB Appointment"
  };

  const label = LABELS[type] || "New Notification";
  const name = data.contact?.name || data.name || "N/A";
  const source = data.contact?.source || data.source || data.service?.source || "N/A";

  return `Hi <@${CONFIG.SLACK.MELISSA_ID}> 👋

\`\`\`
${label}
Name  : ${name}
Source: ${source}
\`\`\``;
}

/**
 * ============================================================================
 * Sends Slack Message
 * ============================================================================
 */
function sendSlackMessage(data, type, channelId = null, userIds = []) {
  if (!data) throw new Error("Slack message data is required.");

  // Channel notifications use one shared message.
  if (type === 1 || type === 5 || type === 6 || type === 7 || type === 8) {
    if (!channelId) throw new Error("Slack channel ID is required for type 1, 5, 6, 7, or 8.");

    const message = buildSlackMessage(type, data);
    logToSheet(type, data);
    logOverallRow(data)

    const result = sendSlackApiMessage(channelId, message, CONFIG.SLACK.BOT_TOKEN);

    // For new appointment / new audit / SAB / reschedule, follow up with full details in-thread.
    if (type === 1 || type === 6 || type === 7 || type === 8) {
      const threadMessage = appointmentDetailsThread(data);
      sendSlackThreadMessage(channelId, result.ts, threadMessage);
    }

    // Every channel broadcast also gets a short heads-up DM to Melissa,
    // followed by the full details threaded underneath.
    const dmChannelId = openSlackDM(CONFIG.SLACK.MELISSA_ID, CONFIG.SLACK.USER_TOKEN);
    const dmMessage = type === 8 ? rescheduledAppointmentDM(data) : shortMelissaDM(type, data);
    const dmResult = sendSlackApiMessage(dmChannelId, dmMessage, CONFIG.SLACK.USER_TOKEN);
    sendSlackThreadMessage(dmChannelId, dmResult.ts, appointmentDetailsThread(data));

    return result;
  }

  // DM notifications build a personalized message for each user.
  if (!Array.isArray(userIds) || !userIds.length) throw new Error("Slack user ID list is required for DM reminders.");

  return userIds.map(userId => {
    const message = buildSlackMessage(type, data, userId);
    const dmChannelId = openSlackDM(userId, CONFIG.SLACK.USER_TOKEN);

    const result = sendSlackApiMessage(dmChannelId, message, CONFIG.SLACK.USER_TOKEN);

    // For 1-day and 1-hour reminders, follow up with the full appointment details in the DM thread.
    if (type === 2 || type === 3) {
      const threadMessage = appointmentDetailsThread(data);
      sendSlackThreadMessage(dmChannelId, result.ts, threadMessage);
    }

    return result;
  });
}

/**
 * ============================================================================
 * Opens an individual Slack DM.
 * ============================================================================
 */
function openSlackDM(userId, token) {
  const payload = { users: userId };
  const result = slackApiRequest("https://slack.com/api/conversations.open", payload, token);

  if (!result.ok) throw new Error(`Failed to open Slack DM for ${userId}: ${JSON.stringify(result)}`);

  return result.channel.id;
}

/**
 * Send the Appointment Thread Message Thread
 */
function sendSlackThreadMessage(channelId, parentTs, message) {
  return sendSlackApiMessage(
    channelId,
    message,
    CONFIG.SLACK.BOT_TOKEN,
    parentTs
  );
}

/**
 * ============================================================================
 * Sends a message to a Slack channel or DM.
 * ============================================================================
 */
function sendSlackApiMessage(channelId, message, token, threadTs = null) {
  const payload = {
    channel: channelId,
    text: message
  };

  if (threadTs) payload.thread_ts = threadTs;

  const result = slackApiRequest(CONFIG.SLACK.API_URL, payload, token);

  if (!result.ok) throw new Error(`Failed to send Slack message: ${JSON.stringify(result)}`);

  return result;
}

/**
 * ============================================================================
 * Makes a Slack API request.
 * ============================================================================
 */
function slackApiRequest(url, payload, token) {
  const options = {
    method: "post",
    contentType: "application/json; charset=utf-8",
    headers: {
      Authorization: "Bearer " + token
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}

function formatAppointmentMountainTime(dateTime) {
    const date = new Date(dateTime);

    if (isNaN(date.getTime())) throw new Error(`Invalid appointment date: ${dateTime}`);

    // Add 1 day and 1 hour before formatting.
    date.setTime(date.getTime() + (25 * 60 * 60 * 1000));

    return {
        date: Utilities.formatDate(date, "America/Denver", "MMM dd, yyyy"),
        time: Utilities.formatDate(date, "America/Denver", "h:mm a z")
    };
}