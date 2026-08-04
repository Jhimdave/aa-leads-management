function saveResponse(data) {

  PropertiesService.getScriptProperties().setProperty(
      "LAST_RESPONSE",
      JSON.stringify(data, null, 2)
    );

}

function saveRequest(data) {

  PropertiesService.getScriptProperties().setProperty(
      "LAST_REQUEST",
      JSON.stringify(data, null, 2)
    );

}

function saveError(error) {

  PropertiesService.getScriptProperties().setProperty(
      "LAST_ERROR",
      error.stack || error.toString()
    );

}

function saveExecution() {

  PropertiesService.getScriptProperties().setProperty(
      "LAST_EXECUTION",
      new Date().toISOString()
    );

}


function jsonResponse(data) {

  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

}
function saveNotification(type) {

  PropertiesService.getScriptProperties().setProperty("LAST_NOTIFICATION", String(type));

}
function saveSlackResponse(data) {
  PropertiesService.getScriptProperties().setProperty(
    "LAST_SLACK_RESPONSE",
    JSON.stringify(data, null, 2)
  );
}

function clearLogs() {

  const props = PropertiesService.getScriptProperties();

  props.deleteProperty("LAST_REQUEST");
  props.deleteProperty("LAST_RESPONSE");
  props.deleteProperty("LAST_SLACK_RESPONSE");
  props.deleteProperty("LAST_NOTIFICATION");
  props.deleteProperty("LAST_EXECUTION");
  props.deleteProperty("LAST_ERROR");

}

function deleteAllBotMessages() {
  const channelId = CONFIG.SLACK.CHANNEL_ID;
  const token = CONFIG.SLACK.BOT_TOKEN;
  let cursor = "";
  let deleted = 0;

  do {
    const result = getSlackChannelHistory(channelId, token, cursor);
    if (!result.ok) throw new Error(`Failed to get channel history: ${JSON.stringify(result)}`);

    const botMessages = result.messages.filter(message => message.bot_id);

    botMessages.forEach(message => {
      const result = deleteSlackMessage(channelId, message.ts, token);

      if (result.ok) deleted++;
      else console.error(`Failed to delete ${message.ts}: ${JSON.stringify(result)}`);

      Utilities.sleep(500);
    });

    cursor = result.response_metadata?.next_cursor || "";
  } while (cursor);

  console.log(`Deleted ${deleted} bot messages.`);
  return deleted;
}

function getSlackChannelHistory(channelId, token, cursor = "") {
  let url = `https://slack.com/api/conversations.history?channel=${encodeURIComponent(channelId)}&limit=100`;

  if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;

  const options = {
    method: "get",
    headers: {
      Authorization: "Bearer " + token
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}

function deleteSlackMessage(channelId, messageTs, token) {
  const payload = {
    channel: channelId,
    ts: messageTs
  };

  return slackApiRequest(
    "https://slack.com/api/chat.delete",
    payload,
    token
  );
}