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

  return `Hi <@${data.owner.slack_user}>, <@${CONFIG.SLACK.ALEX_ID}>, <@${CONFIG.SLACK.DANIEL_ID}> :wave:

:calendar: *New Appointment Booked!*

\t• Appointment: ${appointment.date} (MDT)
\t• Time: ${appointment.time}
\t• Name: ${data.contact.name}
\t• Email: ${data.contact.email}
\t• Phone: ${data.contact.phone}
\t• Service: ${data.service.name}
\t• Source: ${data.service.source}
\t• Meeting Link: ${data.appointment.meeting_id}
\t• Location: ${data.appointment.location}`;
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

  return `Hi <@${userId}> :wave:

:alarm_clock: *Appointment Reminder*

Your appointment starts in *24 hours*.

\t• Appointment: ${appointment.date} (MDT)
\t• Time: ${appointment.time}
\t• Name: ${data.contact.name}
\t• Email: ${data.contact.email}
\t• Phone: ${data.contact.phone}${serviceLine}
\t• Meeting Link: ${data.appointment.meeting_id}
\t• Location: ${data.appointment.location}`;
}

/**
 * ============================================================================
 * Notification #2 - 1 Hour Reminder
 * ============================================================================
 */
function oneHourReminder(data, priorityUserId = null) {
  const userId = priorityUserId || data.owner.slack_user;
  const appointment = formatAppointmentMountainTime(data.appointment.date);
  const serviceLine = data.service?.name ? `\n\t• Service: ${data.service.name}` : "";

  return `Hi <@${userId}> :wave:

:alarm_clock: *Appointment Reminder*

Your appointment starts in *1 hour*.

\t• Time: ${appointment.time}
\t• Name: ${data.contact.name}
\t• Email: ${data.contact.email}${serviceLine}
\t• Meeting: ${data.appointment.meeting_id}
\t• Location: ${data.appointment.location}`;
}

/**
 * ============================================================================
 * Notification #3 - 5 Minute Reminder
 * ============================================================================
 */
function fiveMinuteReminder(data, priorityUserId = null) {
  const userId = priorityUserId || data.owner.slack_user;
  const appointment = formatAppointmentMountainTime(data.appointment.date);
  const serviceLine = data.service?.name ? `\n\t• Service: ${data.service.name}` : "";

  return `Hi <@${userId}> :wave:

:rotating_light: *Appointment Starting Soon*

Your appointment starts in *5 minutes*. Good luck!

\t• Time: ${appointment.time}
\t• Name: ${data.contact.name}
\t• Email: ${data.contact.email}${serviceLine}
\t• Meeting: ${data.appointment.meeting_id}
\t• Location: ${data.appointment.location}

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
 * Notification #6 - New Audit Appointment
 * ============================================================================
 */
function newAuditAppointment(data) {
  const appointment = formatAppointmentMountainTime(data.appointment.date);

  return `Hi <@${data.owner.slack_user}>, <@${CONFIG.SLACK.ALEX_ID}>, <@${CONFIG.SLACK.DANIEL_ID}> :wave:

:calendar: *New Audit Appointment Booked!*

\t• Appointment: ${appointment.date} (MDT)
\t• Time: ${appointment.time}
\t• Name: ${data.contact.name}
\t• Email: ${data.contact.email}
\t• Phone: ${data.contact.phone}
\t• Source: ${data.service.source}
\t• Meeting Link: ${data.appointment.meeting_id}
\t• Location: ${data.appointment.location}`;
}

/**
 * ============================================================================
 * Sends Slack Message
 * ============================================================================
 */
function sendSlackMessage(data, type, channelId = null, userIds = []) {
  if (!data) throw new Error("Slack message data is required.");

  // Channel notifications use one shared message.
  if (type === 1 || type === 5 || type === 6) {
    if (!channelId) throw new Error("Slack channel ID is required for type 1 or 5.");

    const message = buildSlackMessage(type, data);
    logToSheet(type, data);
    logOverallRow(data)
    return sendSlackApiMessage(channelId, message, CONFIG.SLACK.BOT_TOKEN);
  }

  // DM notifications build a personalized message for each user.
  if (!Array.isArray(userIds) || !userIds.length) throw new Error("Slack user ID list is required for DM reminders.");

  return userIds.map(userId => {
    const message = buildSlackMessage(type, data, userId);
    const dmChannelId = openSlackDM(userId, CONFIG.SLACK.USER_TOKEN);

    return sendSlackApiMessage(dmChannelId, message, CONFIG.SLACK.USER_TOKEN);
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
 * ============================================================================
 * Sends a message to a Slack channel or DM.
 * ============================================================================
 */
function sendSlackApiMessage(channelId, message, token) {
  const payload = {
    channel: channelId,
    text: message
  };

  saveResponse(payload);

  const result = slackApiRequest(CONFIG.SLACK.API_URL, payload, token);
  saveSlackResponse(result);

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

  // Add 1 hour before formatting.
  date.setTime(date.getTime() + (60 * 60 * 1000));

  return {
    date: Utilities.formatDate(date, "America/Denver", "MMM dd, yyyy"),
    time: Utilities.formatDate(date, "America/Denver", "h:mm a z")
  };
}