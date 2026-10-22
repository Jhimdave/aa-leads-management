/**
 * ============================================================================
 * Sanitizers — prevent literal "null"/"undefined" text or bad phone
 * concatenation from landing in sheet cells.
 * ============================================================================
 */
function clean(value) {
  if (value === null || value === undefined) return "";
  const str = String(value).trim();
  if (str === "" || str.toLowerCase() === "null" || str.toLowerCase() === "undefined") return "";
  return str;
}

// Keeps the leading apostrophe (forces text format so phone numbers/+ signs
// don't get mangled by Sheets) but only when there's an actual value.
function phoneCell(value) {
  const v = clean(value);
  return v ? "'" + v : "";
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

  if (sheet.getMaxColumns() < expectedHeaders.length)
    sheet.insertColumnsAfter(sheet.getMaxColumns(), expectedHeaders.length - sheet.getMaxColumns());

  if (sheet.getMaxRows() === 0)
    sheet.insertRowBefore(1);

  const currentHeaders = sheet.getRange(1, 1, 1, expectedHeaders.length).getValues()[0];
  const hasHeaders = expectedHeaders.every((header, i) => currentHeaders[i] === header);

  if (!hasHeaders)
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
}

/**
 * ============================================================================
 * Type routing — 6 is an appointment payload (same shape as 1), and 5
 * covers two different lead shapes (newsletter vs audit), told apart by
 * the presence of amazon_link.
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

    case 7: // New SAB Appointment
      logSABRow(workbookId, data);
      break;

    case 11: // New Interview Appointment
      logInterviewRow(workbookId, data);
      break;

    case 12: // New Legacy Author Appointment
      logLegacyAuthorRow(workbookId, data);
      break;

    default:
      return;
  }
}

/**
 * ============================================================================
 * Appointments sheet
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
    clean(data.contact.name),
    clean(data.contact.email),
    phoneCell(data.contact.phone),
    appointment.date,
    appointment.time,
    clean(data.appointment.meeting_id),
    clean(data.appointment.location),
    clean(data.contact.book_progress),
    clean(data.contact.service_interested),
    clean(data.contact.monthly_budget),
    clean(data.contact.annual_revenue),
    clean(data.contact.source),
    currentDate.date
  ];

  sheet.appendRow(row);
}


/**
 * ============================================================================
 * SAB sheet (Set Appointment Booking)
 * ============================================================================
 */
function logSABRow(workbookId, data) {
  const ss = SpreadsheetApp.openById(workbookId);
  const sheetId = Number(CONFIG.SHEETS.SAB_TAB);
  const headers = CONFIG.SHEETS.SAB_HEADERS;

  ensureHeaderExists(workbookId, sheetId, headers);

  const sheet = ss.getSheetById(sheetId);
  if (!sheet) throw new Error(`Sheet with ID ${sheetId} not found.`);

  const currentDate = formatAppointmentMountainTime(new Date().toISOString());

  const row = [
    clean(data.name || data.contact?.name),
    clean(data.email || data.contact?.email),
    phoneCell(data.phone || data.contact?.phone),
    clean(data.source || data.contact?.source),
    currentDate.date
  ];

  sheet.appendRow(row);
}

/**
 * ============================================================================
 * Consultation sheet
 * ============================================================================
 */
function logConsultationRow(workbookId, data) {
  const ss = SpreadsheetApp.openById(workbookId);
  const sheetId = Number(CONFIG.SHEETS.CONSULTATION_TAB);
  const headers = CONFIG.SHEETS.CONSULTATION_HEADERS;
  const currentDate = formatAppointmentMountainTime(new Date().toISOString());
  ensureHeaderExists(workbookId, sheetId, headers);

  const sheet = ss.getSheetById(sheetId);
  if (!sheet) throw new Error(`Sheet with ID ${sheetId} not found.`);

  const row = [
    clean(data.contact.name),
    clean(data.contact.email),
    phoneCell(data.contact.phone),
    clean(data.contact.book_progress),
    clean(data.contact.service_interested),
    clean(data.contact.monthly_budget),
    clean(data.contact.annual_revenue),
    clean(data.contact.source),
    currentDate.date
  ];

  sheet.appendRow(row);
}

/**
 * ============================================================================
 * Newsletter sheet
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
    clean(data.name),
    clean(data.email),
    clean(data.source),
    timestamp.date + " " + timestamp.time
  ];

  sheet.appendRow(row);
}

/**
 * ============================================================================
 * Audit sheet
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
    clean(data.name),
    clean(data.email),
    clean(data.source),
    clean(data.amazon_link),
    currentDate.date
  ];

  sheet.appendRow(row);
}

/**
 * ============================================================================
 * Overall sheet — the "'" + data.phone precedence bug is fixed here via
 * phoneCell(), and every field is run through clean().
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
    clean(data.name || data.contact?.name),
    clean(data.email || data.contact?.email),
    clean(data.source || data.contact?.source),
    phoneCell(data.phone || data.contact?.phone),
    clean(data.book_progress || data.contact?.book_progress),
    clean(data.service_interested || data.contact?.service_interested),
    clean(data.monthly_budget || data.contact?.monthly_budget),
    clean(data.annual_revenue || data.contact?.annual_revenue),
    clean(data.amazon_link),
    clean(data.contact.status) || "New Lead",
    currentDate.date,
    clean(data.notes)
  ];

  sheet.appendRow(row);
}

/**
 * ============================================================================
 * Interview Leads sheet
 * ============================================================================
 */
function logInterviewRow(workbookId, data) {
  const ss = SpreadsheetApp.openById(workbookId);
  const sheetId = Number(CONFIG.SHEETS.INTERVIEW_TAB);
  const headers = CONFIG.SHEETS.INTERVIEW_HEADERS;

  ensureHeaderExists(workbookId, sheetId, headers);

  const sheet = ss.getSheetById(sheetId);
  if (!sheet) throw new Error(`Sheet with ID ${sheetId} not found.`);

  const appointment = formatAppointmentMountainTime(data.appointment.date);
  const currentDate = formatAppointmentMountainTime(new Date().toISOString());

  const row = [
    clean(data.contact?.name || data.name),
    clean(data.contact?.email || data.email),
    phoneCell(data.contact?.phone || data.phone),
    appointment.date,
    appointment.time,
    clean(data.appointment?.meeting_id),
    clean(data.appointment?.location),
    clean(data.service?.source || data.source),
    currentDate.date
  ];

  sheet.appendRow(row);
}

/**
 * ============================================================================
 * Legacy Author sheet
 * ============================================================================
 */
function logLegacyAuthorRow(workbookId, data) {
  const ss = SpreadsheetApp.openById(workbookId);
  const sheetId = Number(CONFIG.SHEETS.LEGACY_AUTHOR_TAB);
  const headers = CONFIG.SHEETS.LEGACY_AUTHOR_HEADERS;

  ensureHeaderExists(workbookId, sheetId, headers);

  const sheet = ss.getSheetById(sheetId);
  if (!sheet) throw new Error(`Sheet with ID ${sheetId} not found.`);

  const appointment = formatAppointmentMountainTime(data.appointment.date);
  const currentDate = formatAppointmentMountainTime(new Date().toISOString());

  const row = [
    clean(data.contact?.name || data.name),
    clean(data.contact?.email || data.email),
    phoneCell(data.contact?.phone || data.phone),
    appointment.date,
    appointment.time,
    clean(data.appointment?.meeting_id),
    clean(data.appointment?.location),
    clean(data.service?.source || data.source),
    currentDate.date
  ];

  sheet.appendRow(row);
}