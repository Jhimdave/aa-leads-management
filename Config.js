/**
 * Global Configuration
 */

const CONFIG = Object.freeze({

  SLACK: {

    API_URL: "https://slack.com/api/chat.postMessage",
    BOT_TOKEN: PropertiesService.getScriptProperties().getProperty("BOT_TOKEN"),
    USER_TOKEN: PropertiesService.getScriptProperties().getProperty("USER_TOKEN"),
    CHANNEL_ID: "C0BJFE50U78",
    DANIEL_ID: "U07FYH8BWTS",
    ALEX_ID: "U06S2EM3AF8",
    MELISSA_ID: "U06SXSA4NCQ"
  },

  SHEETS : {
    SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID"),
    APPOINTMENTS_TAB: 653050749,
    CONSULTATION_TAB: 340209372,
    AUDIT_TAB: 1475914192,
    NEWSLETTER_TAB: 1116973688,
    OVERALL_TAB: 0,
    OVERALL_HEADERS: [
      "Contact Name",
      "Email",
      "Phone",
      "Book Progress",
      "Service Interested",
      "Monthly Budget",
      "Annual Revenue",
      "Amazon Link",
      "Status",
      "Source",
      "Date Created",
      "Notes"
    ],
    CONSULTATION_HEADERS: [
      "Contact Name",
      "Email",
      "Phone",
      "Book Progress",
      "Service Interested",
      "Monthly Budget",
      "Annual Revenue",
      "Source"
    ],
    NEWSLETTER_HEADERS: [
      "Name",
      "Email",
      "Source",
      "Date"
    ],
    AUDIT_HEADERS: [
      "Name",
      "Email",
      "Source",
      "Amazon Link",
      "Date"
    ],
    APPOINTMENT_HEADERS: [
      "Contact Name",
      "Email",
      "Phone",
      "Date",
      "Time",
      "Meeting ID",
      "Location",
      "Book Progress",
      "Service Interested",
      "Monthly Budget",
      "Annual Revenue",
      "Source"
    ]
  },

  DEBUG: true,
  SAVE_LOGS: true

});