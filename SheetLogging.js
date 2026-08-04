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

function logNotificationToSheet(type, data) {
  switch (type) {
    case 1: // New Appointment
      logAppointmentRow("Appointment", data);
      logOverviewRow("Appointment", data);
      break;
    case 6: // New Audit Appointment
      logAppointmentRow("Audit Appointment", data);
      logOverviewRow("Audit Appointment", data);
      break;
    case 5: // New Lead / Subscription
      logLeadRow(data);
      logOverviewRow("Lead", data);
      break;
    // Reminder types (2,3,4) are not new records, so nothing to log by default.
    default:
      return;
  }
}

/**
 * ============================================================================
 * Appointments sheet — appointment + audit appointment rows.
 * Columns: Timestamp | Type | Appt Date | Appt Time | Name | Email | Phone |
 *          Service | Source | Meeting Link | Location | Owner
 * ============================================================================
 */
function logAppointmentRow(typeLabel, data) {
  const sheet = getOrCreateSheet(
    CONFIG.SHEETS.APPOINTMENTS_TAB,
    ["Timestamp", "Type", "Appt Date", "Appt Time", "Name", "Email", "Phone",
     "Service", "Source", "Meeting Link", "Location", "Owner"]
  );

  const appointment = formatAppointmentMountainTime(data.appointment.date);

  sheet.appendRow([
    new Date(),
    typeLabel,
    appointment.date,
    appointment.time,
    data.contact?.name || "",
    data.contact?.email || "",
    data.contact?.phone || "",
    data.service?.name || "",
    data.service?.source || "",
    data.appointment?.meeting_id || "",
    data.appointment?.location || "",
    data.owner?.slack_user || ""
  ]);
}

/**
 * ============================================================================
 * Leads sheet — new subscription/lead rows.
 * Columns: Timestamp | Name | Email | Source
 * ============================================================================
 */
function logLeadRow(data) {
  const sheet = getOrCreateSheet(
    CONFIG.SHEETS.LEADS_TAB,
    ["Timestamp", "Name", "Email", "Source"]
  );

  sheet.appendRow([
    new Date(),
    data.name || "",
    data.email || "",
    data.source || ""
  ]);
}

/**
 * ============================================================================
 * Overview sheet — every event (appointments, audits, leads) in one place.
 * Columns: Timestamp | Type | Name | Email | Phone | Service/Source |
 *          Appt Date | Appt Time | Meeting Link | Location
 * ============================================================================
 */
function logOverviewRow(typeLabel, data) {
  const sheet = getOrCreateSheet(
    CONFIG.SHEETS.OVERVIEW_TAB,
    ["Timestamp", "Type", "Name", "Email", "Phone", "Service/Source",
     "Appt Date", "Appt Time", "Meeting Link", "Location"]
  );

  const isLead = typeLabel === "Lead";

  let apptDate = "";
  let apptTime = "";
  if (!isLead && data.appointment?.date) {
    const appointment = formatAppointmentMountainTime(data.appointment.date);
    apptDate = appointment.date;
    apptTime = appointment.time;
  }

  sheet.appendRow([
    new Date(),
    typeLabel,
    isLead ? (data.name || "") : (data.contact?.name || ""),
    isLead ? (data.email || "") : (data.contact?.email || ""),
    isLead ? "" : (data.contact?.phone || ""),
    isLead ? (data.source || "") : (data.service?.source || data.service?.name || ""),
    apptDate,
    apptTime,
    isLead ? "" : (data.appointment?.meeting_id || ""),
    isLead ? "" : (data.appointment?.location || "")
  ]);
}

/**
 * ============================================================================
 * Gets a sheet by name, creating it with a header row if it doesn't exist.
 * Adds any missing header columns to an already-existing sheet too, so this
 * is safe to call repeatedly as the schema evolves.
 * ============================================================================
 */
function getOrCreateSheet(sheetName, headers) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEETS.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    return sheet;
  }

  // Backfill header row if the sheet exists but is empty.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }

  return sheet;
}