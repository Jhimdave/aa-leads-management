/**
 * ============================================================================
 * CONFIG additions needed (merge into your existing CONFIG object):
 * ============================================================================
 *
 * CONFIG.SHEETS = {
 *   SPREADSHEET_ID: "YOUR_SPREADSHEET_ID_HERE", // the sheet these all live in
 *   APPOINTMENTS_TAB: "Appointments",
 *   LEADS_TAB: "Leads",
 *   OVERVIEW_TAB: "Overview"
 * };
 */

/**
 * ============================================================================
 * Logs a notification event to the appropriate Google Sheet(s).
 * Call this alongside sendSlackMessage — e.g. from wherever the notification
 * type is first decided, or right inside sendSlackMessage before building
 * the Slack text.
 * ============================================================================
 */

function logToSheet(type, data) {
  const workbookId = CONFIG.SHEETS.SPREADSHEET_ID;

  switch (type) {
    case 1: // New Appointment
    case 6: // New Audit Appointment — same payload shape as type 1
      logAppointmentRow(workbookId, data);
      logConsultationRow(workbookId, data);
      break;

    case 5: // Newsletter OR Audit lead — same type, different payload shape
      if (data.amazon_link) {
        logAuditRow(workbookId, data);
      } else {
        logNewsletterRow(workbookId, data);
      }
      break;

    // Reminder types (2,3,4) are not new records, so nothing to log by default.
    default:
      return;
  }
}


function sheetExists(workbook, sheetName) {
  return workbook.getSheetByName(sheetName) !== null;
}

function getSheetsList(workbookId) {
  const workbook = SpreadsheetApp.openById(workbookId);

  return workbook.getSheets().map(sheet => ({
    id: sheet.getSheetId(),
    sheetName: sheet.getName()
  }))
}

function ensureHeaderExists(workbookId, sheetId, expectedHeaders) {
  const sheet = SpreadsheetApp.openById(workbookId).getSheetById(Number(sheetId));
  if (!sheet) throw new Error(`Sheet ID ${sheetId} not found.`);

  // Ensure enough columns exist
  if (sheet.getMaxColumns() < expectedHeaders.length)
    sheet.insertColumnsAfter(sheet.getMaxColumns(), expectedHeaders.length - sheet.getMaxColumns());

  // Ensure at least one row exists
  if (sheet.getMaxRows() === 0)
    sheet.insertRowBefore(1);

  const currentHeaders = sheet.getRange(1, 1, 1, expectedHeaders.length).getValues()[0];

  const hasHeaders = expectedHeaders.every((header, i) => currentHeaders[i] === header);

  if (!hasHeaders)
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
}

/**
 * ============================================================================
 * Appointments sheet — appointment + audit appointment rows.
 * Columns: Timestamp | Type | Appt Date | Appt Time | Name | Email | Phone |
 *          Service | Source | Meeting Link | Location | Owner
 * ============================================================================
 */
function logAppointmentRow(workbookId, data) {
  const ss = SpreadsheetApp.openById(workbookId);
  const sheetId = Number(CONFIG.SHEETS.APPOINTMENTS_TAB);
  const headers = CONFIG.SHEETS.APPOINTMENT_HEADERS;

  ensureHeaderExists(workbookId, sheetId, headers);

  const sheet = ss.getSheetById(sheetId);
  if (!sheet) throw new Error(`Sheet with ID ${sheetId} not found.`);

  const appointment = formatAppointmentMountainTime(data.appointment.date);
  const currentDate = formatAppointmentMountainTime(new Date().toISOString());

  const row = [
    data.contact.name,
    data.contact.email,
    "'" + data.contact.phone,
    appointment.date,
    appointment.time,
    data.appointment.meeting_id,
    data.appointment.location,
    data.contact.book_progress,
    data.contact.service_interested,
    data.contact.monthly_budget,
    data.contact.annual_revenue,
    data.contact.source,
    currentDate.date
  ];

  sheet.appendRow(row);
}

/**
 * ============================================================================
 * Log Consultation sheet — new subscription/lead rows.
 * Columns: Timestamp | Name | Email | Source
 * ============================================================================
 */
function logConsultationRow(workbookId, data) {
  const ss = SpreadsheetApp.openById(workbookId);
  const sheetId = Number(CONFIG.SHEETS.CONSULTATION_TAB);
  const headers = CONFIG.SHEETS.CONSULTATION_HEADERS;

  ensureHeaderExists(workbookId, sheetId, headers);

  const sheet = ss.getSheetById(sheetId);
  if (!sheet) throw new Error(`Sheet with ID ${sheetId} not found.`);

  const row = [
    data.contact.name,
    data.contact.email,
    "'" + data.contact.phone,
    data.contact.book_progress,
    data.contact.service_interested,
    data.contact.monthly_budget,
    data.contact.annual_revenue,
    data.contact.source
  ];

  sheet.appendRow(row);
}

/**
 * ============================================================================
 * Log Newsletter sheet — new newsletter subscription rows.
 * Columns: Timestamp | Name | Email | Source
 * ============================================================================
 */
function logNewsletterRow(workbookId, data) {
  const ss = SpreadsheetApp.openById(workbookId);
  const sheetId = Number(CONFIG.SHEETS.NEWSLETTER_TAB);
  const headers = CONFIG.SHEETS.NEWSLETTER_HEADERS;

  ensureHeaderExists(workbookId, sheetId, headers);

  const sheet = ss.getSheetById(sheetId);
  if (!sheet) throw new Error(`Sheet with ID ${sheetId} not found.`);

  const timestamp = formatAppointmentMountainTime(new Date().toISOString());

  const row = [
    data.name,
    data.email,
    data.source,
    timestamp.date + " " + timestamp.time
  ];

  sheet.appendRow(row);
}

/**
 * ============================================================================
 * Log Audit sheet — new audit request rows.
 * Columns: Name | Email | Source | Amazon Link | Date
 * ============================================================================
 */
function logAuditRow(workbookId, data) {
  const ss = SpreadsheetApp.openById(workbookId);
  const sheetId = Number(CONFIG.SHEETS.AUDIT_TAB);
  const headers = CONFIG.SHEETS.AUDIT_HEADERS;

  ensureHeaderExists(workbookId, sheetId, headers);

  const sheet = ss.getSheetById(sheetId);
  if (!sheet) throw new Error(`Sheet with ID ${sheetId} not found.`);

  const currentDate = formatAppointmentMountainTime(new Date().toISOString());

  const row = [
    data.name,
    data.email,
    data.source,
    data.amazon_link,
    currentDate.date
  ];

  sheet.appendRow(row);
}

/**
 * ============================================================================
 * Log Overall sheet — new lead rows from any source.
 * Supports partial data from appointments, consultations, audits,
 * newsletters, and other lead sources.
 * ============================================================================
 */
function logOverallRow(data) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEETS.SPREADSHEET_ID);
  const sheetId = Number(CONFIG.SHEETS.OVERALL_TAB);
  const headers = CONFIG.SHEETS.OVERALL_HEADERS;

  ensureHeaderExists(CONFIG.SHEETS.SPREADSHEET_ID, sheetId, headers);

  const sheet = ss.getSheetById(sheetId);
  if (!sheet) throw new Error(`Sheet with ID ${sheetId} not found.`);

  const currentDate = formatAppointmentMountainTime(new Date().toISOString());

  const row = [
    data.name || data.contact?.name || "",
    data.email || data.contact?.email || "",
    data.source || data.contact?.source || "",
    "'" + data.phone || "'" + data.contact?.phone || "",
    data.book_progress || data.contact?.book_progress || "",
    data.service_interested || data.contact?.service_interested || "",
    data.monthly_budget || data.contact?.monthly_budget || "",
    data.annual_revenue || data.contact?.annual_revenue || "",
    data.amazon_link || "",
    data.status || "",
    currentDate.date,
    data.notes || ""
  ];

  sheet.appendRow(row);
}