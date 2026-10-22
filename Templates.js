/**
 * ============================================================================
 * NotificationTemplates
 * Primary/standalone Slack messages — one per notif type that isn't a
 * time-based reminder (types 1, 5, 6, 7, 8, 9, 10).
 * ============================================================================
 */
class NotificationTemplates {
  /** Notif #1 — New Appointment */
  static newAppointment(data) {
    const appointment = formatAppointmentMountainTime(data.appointment.date)

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

  /** Notif #6 — New Audit Appointment */
  static newAuditAppointment(data) {
    const appointment = formatAppointmentMountainTime(data.appointment.date)

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

  /** Notif #7 — New SAB Appointment */
  static newSABAppointment(data) {
    const appointment = formatAppointmentMountainTime(data.appointment.date)

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

  /** Notif #11 — New Interview Appointment */
  static newInterviewAppointment(data) {
    const appointment = formatAppointmentMountainTime(data.appointment.date)

    return `Hi <@${data.owner.slack_user}>, <@${CONFIG.SLACK.ALEX_ID}>, <@${CONFIG.SLACK.DANIEL_ID}> 👋

\`\`\`
📅 NEW INTERVIEW APPOINTMENT BOOKED

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

  /** Notif #12 — New Legacy Author Appointment */
  static newLegacyAuthorAppointment(data) {
    const appointment = formatAppointmentMountainTime(data.appointment.date)

    return `Hi <@${data.owner.slack_user}>, <@${CONFIG.SLACK.ALEX_ID}>, <@${CONFIG.SLACK.DANIEL_ID}> 👋

\`\`\`
📅 NEW LEAGACY AUTHOR APPOINTMENT BOOKED

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

  /** Notif #8 — Appointment Rescheduled */
  static rescheduledAppointment(data) {
    const appointment = formatAppointmentMountainTime(data.appointment.date)

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

  /** Notif #5 — New Lead (newsletter subscription) */
  static newSubscription(data, priorityUserId = null) {
    const userId = priorityUserId || CONFIG.SLACK.DANIEL_ID;

    return `Hi <@${userId}> :wave:

:rotating_light: *New Lead!*

\t• Name: ${data.name}
\t• Email: ${data.email}
\t• Source: ${data.source}`;
  }

  /** Notif #9 — Appointment Cancelled (client never confirmed) */
  static cancelledAppointmentDM(data) {
    return `Hi <@${CONFIG.SLACK.MELISSA_ID}> 👋
 
\`\`\`
APPOINTMENT CANCELLED - NOT CONFIRMED

Name : ${data.contact.name}
Email: ${data.contact.email}
Note : Client hasn't confirmed attendance, appointment cancelled.
       Follow up for rescheduling is already sent
\`\`\``;
  }

  /** Notif #10 — Appointment Approval Reminder */
  static approvalReminder(data) {
    const appointment = formatAppointmentMountainTime(data.appointment.date)

    return `🔔 Appointment Approval

The client ${data.contact.name} has approved the appointment scheduled for today at ${appointment.time} MDT.`;
  }
}

/**
 * ============================================================================
 * ReminderTemplates
 * Time-based DM reminders sent ahead of an appointment (types 2, 3, 4).
 * ============================================================================
 */
class ReminderTemplates {
  /** Notif #2 — 1 Day Reminder */
  static oneDay(data, priorityUserId = null) {
    const userId = priorityUserId || data.owner.slack_user;
    const appointment = formatAppointmentMountainTime(data.appointment.date)
    const serviceLine = data.service?.name
      ? `\n\t• Service: ${data.service.name}`
      : "";

    if (userId === CONFIG.SLACK.MELISSA_ID) {
      return `Hi <@${userId}> 👋

Just a reminder that tomorrow you have a meeting with *${data.contact.name}* at *${appointment.time} MDT*.${serviceLine}`;
    }

    return `Hi <@${userId}> 👋

Just a reminder that tomorrow Melissa's meeting with *${data.contact.name}* at *${appointment.time} MDT*.${serviceLine}`;
  }

  /** Notif #3 — 1 Hour Reminder */
  static oneHour(data, priorityUserId = null) {
    const userId = priorityUserId || data.owner.slack_user;
    const appointment = formatAppointmentMountainTime(data.appointment.date)
    const serviceLine = data.service?.name
      ? `Service     : ${data.service.name}\n`
      : "";

    if (userId === CONFIG.SLACK.MELISSA_ID) {
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
`;
    }

    return `Hi <@${userId}> 👋

🚨 *APPOINTMENT STARTING SOON*

Melissa's appointment starts in *1 hour*. Good luck!

\`\`\`
Time        : ${appointment.time}
Name        : ${data.contact.name}
Email       : ${data.contact.email}
${serviceLine}Meeting     : ${data.appointment.meeting_id}
Location    : ${data.appointment.location}
\`\`\`
`;
  }

  /** Notif #4 — 5 Minute Reminder */
  static fiveMinute(data, priorityUserId = null) {
    const userId = priorityUserId || data.owner.slack_user;
    const appointment = formatAppointmentMountainTime(data.appointment.date)
    const serviceLine = data.service?.name
      ? `Service     : ${data.service.name}\n`
      : "";

    if (userId === CONFIG.SLACK.MELISSA_ID) {
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

    return `Hi <@${userId}> 👋

🚨 *APPOINTMENT STARTING SOON*

Melissa's appointment starts in *5 minutes*.

\`\`\`
Time        : ${appointment.time}
Name        : ${data.contact.name}
Email       : ${data.contact.email}
${serviceLine}Meeting     : ${data.appointment.meeting_id}
Location    : ${data.appointment.location}
\`\`\``;
  }
}

/**
 * ============================================================================
 * DetailsTemplates
 * Secondary/threaded messages — the "full details" follow-ups and the short
 * heads-up DMs sent to Melissa alongside channel broadcasts.
 * ============================================================================
 */
class DetailsTemplates {
  /** Threaded full-detail dump, posted under the main channel/DM message. */
  static appointmentDetailsThread(data) {
    const appointment = data.appointment
      ? DateTimeFormatter.toMountainTime(data.appointment.date)
      : null;

    const contactInfo = [
      clean(data.contact?.name || data.name) &&
        `Name        : ${clean(data.contact?.name || data.name)}`,
      clean(data.contact?.email || data.email) &&
        `Email       : ${clean(data.contact?.email || data.email)}`,
      data.contact?.phone && `Phone       : ${phoneCell(data.contact.phone)}`,
    ].filter(Boolean);

    const appointmentInfo = appointment
      ? [
          `Date        : ${appointment.date}`,
          `Time        : ${appointment.time}`,
          clean(data.appointment.meeting_id) &&
            `Meeting ID  : ${clean(data.appointment.meeting_id)}`,
          clean(data.appointment.location) &&
            `Location    : ${clean(data.appointment.location)}`,
        ].filter(Boolean)
      : [];

    const publishingInfo = [
      clean(data.contact?.book_progress) &&
        `Book Progress      : ${clean(data.contact.book_progress)}`,
      clean(data.contact?.service_interested) &&
        `Service Interested : ${clean(data.contact.service_interested)}`,
    ].filter(Boolean);

    const businessInfo = [
      clean(data.contact?.monthly_budget) &&
        `Monthly Budget: ${clean(data.contact.monthly_budget)}`,
      clean(data.contact?.annual_revenue) &&
        `Annual Revenue: ${clean(data.contact.annual_revenue)}`,
      clean(data.contact?.source || data.source) &&
        `Source        : ${clean(data.contact?.source || data.source)}`,
    ].filter(Boolean);

    const sections = [
      contactInfo.length ? contactInfo.join("\n") : null,
      appointmentInfo.length ? appointmentInfo.join("\n") : null,
      publishingInfo.length ? publishingInfo.join("\n") : null,
      businessInfo.length ? businessInfo.join("\n") : null,
    ].filter(Boolean);

    return `Details

\`\`\`
${sections.join("\n\n")}
\`\`\``;
  }

  /** Short code-block heads-up DM to Melissa for channel broadcast types. */
  static shortMelissaDM(type, data) {
    const LABELS = {
      1: "New Appointment",
      5: "New Lead",
      6: "New Audit Appointment",
      7: "New SAB Appointment",
    };

    const label = LABELS[type] || "New Notification";
    const name = data.contact?.name || data.name || "N/A";
    const source =
      data.contact?.source || data.source || data.service?.source || "N/A";

    return `Hi <@${CONFIG.SLACK.MELISSA_ID}> 👋

\`\`\`
${label}
Name  : ${name}
Source: ${source}
\`\`\``;
  }

  /** Short heads-up DM to Melissa specifically for reschedule (type 8). */
  static rescheduledAppointmentDM(data) {
    const appointment = formatAppointmentMountainTime(data.appointment.date)

    return `Hi <@${CONFIG.SLACK.MELISSA_ID}> 👋

\`\`\`
RESCHEDULE ALERT

Name : ${data.contact.name}
Email: ${data.contact.email}
New  : ${appointment.date} @ ${appointment.time} (MDT)
\`\`\``;
  }

  /** Short lead DM (newsletter/audit) — currently unused by any live route. */
  static newLeadShortDM(data) {
    const name = data.name || data.contact?.name || "N/A";

    return `Hi <@${CONFIG.SLACK.MELISSA_ID}> 👋

\`\`\`
 New Lead: ${name}
 Source: ${data.contact.source}
\`\`\``;
  }
}
