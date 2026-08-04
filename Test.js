function testNotif1() {
  const data = getSampleData();
  sendSlackMessage(buildSlackMessage(1, data), 1, CONFIG.SLACK.CHANNEL_ID);
}

function testNotif2() {
  const data = getSampleData();
  sendSlackMessage(buildSlackMessage(2, data), 2, null, [CONFIG.SLACK.ALEX_ID, CONFIG.SLACK.MELISSA_ID, CONFIG.SLACK.DANIEL_ID]);
}

function testNotif3() {
  const data = getSampleData();
  sendSlackMessage(buildSlackMessage(3, data), 3, null, [CONFIG.SLACK.MELISSA_ID]);
}

function testNotif4() {
  const data = getSampleData();
  sendSlackMessage(buildSlackMessage(4, data), 4, null, [CONFIG.SLACK.ALEX_ID, CONFIG.SLACK.MELISSA_ID]);
}

function getSampleData() {
  return {
    appointment: {
      id: "18gJBIPPnPlJpfAN5BPe",
      title: "Jimwell Test",
      date: "July 29, 2026",
      time: "1:00 AM",
      meeting_id: "https://meet.google.com/snf-wnej-pvs",
      location: "A&A Publishing and Marketing"
    },
    contact: {
      name: "Jimwell Test",
      email: "jimwelldavebucad@gmail.com",
      phone: "+63 932 423 4234"
    },
    service: {
      name: "Publishing",
      source: "Website"
    },
    owner: {
      slack_user: "U06SXSA4NCQ",
      name: "Melissa"
    }
  };
}

function testGetSheets(){
  const workbookId = CONFIG.SHEETS.SPREADSHEET_ID
  const sheets = getSheetsList(workbookId);

  console.log(JSON.stringify(sheets, null, 2));
}

function testEnsureHeaders() {
  const id = CONFIG.SHEETS.SPREADSHEET_ID;

  ensureHeaderExists(id, CONFIG.SHEETS.OVERALL_TAB, CONFIG.SHEETS.OVERALL_HEADERS);

  ensureHeaderExists(id, CONFIG.SHEETS.APPOINTMENTS_TAB, CONFIG.SHEETS.APPOINTMENT_HEADERS);

  ensureHeaderExists(id, CONFIG.SHEETS.CONSULTATION_TAB, CONFIG.SHEETS.CONSULTATION_HEADERS);

  ensureHeaderExists(id, CONFIG.SHEETS.NEWSLETTER_TAB, CONFIG.SHEETS.NEWSLETTER_HEADERS);

  ensureHeaderExists(id, CONFIG.SHEETS.AUDIT_TAB, CONFIG.SHEETS.AUDIT_HEADERS);

  Logger.log("✅ All headers checked.");
}