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
      "Source",
      "Phone",
      "Book Progress",
      "Service Interested",
      "Monthly Budget",
      "Annual Revenue",
      "Amazon Link",
      "Status",
      "Date Created (MDT)",
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
      "Source",
      "Date Created (MDT)",
    ],
    NEWSLETTER_HEADERS: [
      "Name",
      "Email",
      "Source",
      "Date (MDT)"
    ],
    AUDIT_HEADERS: [
      "Name",
      "Email",
      "Source",
      "Amazon Link",
      "Date (MDT)"
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
      "Source",
      "Date Created (MDT)"
    ]
  },

  DEBUG: true,
  SAVE_LOGS: true

});

/**
 * ============================================================================
 * SAMPLE WEBHOOK PAYLOADS
 * ============================================================================
 *
 * APPOINTMENT / CONSULTATION
 * ---------------------------------------------------------------------------
 * {
 *   "appointment": {
 *     "id": "123456",
 *     "title": "Publishing Consultation",
 *     "date": "2026-08-04",
 *     "time": "10:00 AM",
 *     "meeting_id": "https://meet.google.com/...",
 *     "location": "Zoom"
 *   },
 *   "contact": {
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "phone": "+1 555-123-4567",
 *     "book_progress": "Completed",
 *     "service_interested": "Book Marketing",
 *     "monthly_budget": "$2,000",
 *     "annual_revenue": "$100,000"
 *   },
 *   "service": {
 *     "name": "Book Marketing",
 *     "source": "Main Website"
 *   },
 *   "owner": {
 *     "slack_user": "U06SXSA4NCQ",
 *     "name": "Melissa"
 *   }
 * }
 *
 * ============================================================================
 * NEWSLETTER
 * ---------------------------------------------------------------------------
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "source": "Website"
 * }
 *
 * ============================================================================
 * AUDIT
 * ---------------------------------------------------------------------------
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "source": "Website",
 *   "amazon_link": "https://amazon.com/dp/B0XXXXXXX"
 * }
 *
 * ============================================================================
 * SHEET MAPPING
 * ============================================================================
 *
 * OVERALL LEADS
 * ---------------------------------------------------------------------------
 * Contact Name
 * Email
 * Phone
 * Book Progress
 * Service Interested
 * Monthly Budget
 * Annual Revenue
 * Amazon Link
 * Status
 * Source
 * Date Created
 * Notes
 *
 * APPOINTMENTS
 * ---------------------------------------------------------------------------
 * Contact Name
 * Email
 * Phone
 * Date
 * Time
 * Meeting ID
 * Location
 * Book Progress
 * Service Interested
 * Monthly Budget
 * Annual Revenue
 * Source
 *
 * CONSULTATIONS
 * ---------------------------------------------------------------------------
 * Contact Name
 * Email
 * Phone
 * Book Progress
 * Service Interested
 * Monthly Budget
 * Annual Revenue
 * Source
 *
 * NEWSLETTER
 * ---------------------------------------------------------------------------
 * Name
 * Email
 * Source
 * Date
 *
 * AUDIT
 * ---------------------------------------------------------------------------
 * Name
 * Email
 * Source
 * Amazon Link
 * Date
 * ============================================================================
 */