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

function deleteBotMessagesForSpecificDates() {
  const channelId = CONFIG.SLACK.CHANNEL_ID;
  const token = CONFIG.SLACK.BOT_TOKEN;

  const targetDates = new Set([
    "2026-09-04",
    "2026-09-03"

  ]);

  let cursor = "";
  let deleted = 0;

  do {
    const history = getSlackChannelHistory(channelId, token, cursor);

    if (!history.ok)
      throw new Error(`Failed to get channel history: ${JSON.stringify(history)}`);

    const botMessages = history.messages.filter(message => {
      if (!message.bot_id) return false;

      const date = Utilities.formatDate(
        new Date(parseFloat(message.ts) * 1000),
        Session.getScriptTimeZone(),
        "yyyy-MM-dd"
      );

      return targetDates.has(date);
    });

    botMessages.forEach(message => {
      try {
        // Delete thread replies first
        if (message.reply_count > 0) {
          const replies = getSlackThreadReplies(channelId, message.ts, token);

          if (replies.ok) {
            replies.messages
              .filter(reply => reply.ts !== message.ts)
              .forEach(reply => {
                const result = deleteSlackMessage(channelId, reply.ts, token);

                if (result.ok) deleted++;
                else console.error(`Failed deleting reply ${reply.ts}`);

                Utilities.sleep(500);
              });
          }
        }

        // Delete parent message
        const result = deleteSlackMessage(channelId, message.ts, token);

        if (result.ok) deleted++;
        else console.error(`Failed deleting parent ${message.ts}`);

        Utilities.sleep(500);

      } catch (error) {
        console.error(`Error deleting ${message.ts}: ${error}`);
      }
    });

    cursor = history.response_metadata?.next_cursor || "";

  } while (cursor);

  console.log(`Deleted ${deleted} messages from specified dates.`);
  return deleted;
}

function findBotMessagesForSpecificDates() {
  const targetDates = new Set([
    "2026-08-17",
    "2026-08-05",
    "2026-08-04",
    "2026-07-26"
  ]);

  let cursor = "";
  let count = 0;

  do {
    const history = getSlackChannelHistory(
      CONFIG.SLACK.CHANNEL_ID,
      CONFIG.SLACK.BOT_TOKEN,
      cursor
    );

    history.messages.forEach(message => {
      if (!message.bot_id) return;

      const date = Utilities.formatDate(
        new Date(parseFloat(message.ts) * 1000),
        Session.getScriptTimeZone(),
        "yyyy-MM-dd"
      );

      if (targetDates.has(date)) {
        count++;
        console.log(`${date} | ${message.ts} | ${message.text}`);
      }
    });

    cursor = history.response_metadata?.next_cursor || "";

  } while (cursor);

  console.log(`Found ${count} messages.`);
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

function deleteOrphanedThreadRepliesForAug17() {
  const channelId = CONFIG.SLACK.CHANNEL_ID;
  const token = CONFIG.SLACK.BOT_TOKEN;

  let cursor = "";
  let deleted = 0;

  do {
    const history = getSlackChannelHistory(channelId, token, cursor);

    if (!history.ok)
      throw new Error(`Failed to get history: ${JSON.stringify(history)}`);

    const threadReplies = history.messages.filter(message => {
      if (!message.bot_id) return false;

      const date = Utilities.formatDate(
        new Date(parseFloat(message.ts) * 1000),
        Session.getScriptTimeZone(),
        "yyyy-MM-dd"
      );

      return (
        date === "2026-08-17" &&
        message.thread_ts &&
        message.thread_ts !== message.ts
      );
    });

    threadReplies.forEach(message => {
      const result = deleteSlackMessage(channelId, message.ts, token);

      if (result.ok) {
        deleted++;
        console.log(`Deleted thread reply: ${message.ts}`);
      } else {
        console.error(`Failed: ${message.ts} ${JSON.stringify(result)}`);
      }

      Utilities.sleep(500);
    });

    cursor = history.response_metadata?.next_cursor || "";

  } while (cursor);

  console.log(`Deleted ${deleted} orphaned thread replies from Aug 17.`);
}

function listAllBotMessages() {
  const channelId = CONFIG.SLACK.CHANNEL_ID;
  const token = CONFIG.SLACK.BOT_TOKEN;

  let cursor = "";
  let count = 0;

  do {
    const result = getSlackChannelHistory(channelId, token, cursor);

    if (!result.ok)
      throw new Error(`Failed to get channel history: ${JSON.stringify(result)}`);

    result.messages
      .filter(message => message.bot_id)
      .forEach(message => {
        count++;

        const date = Utilities.formatDate(
          new Date(parseFloat(message.ts) * 1000),
          Session.getScriptTimeZone(),
          "yyyy-MM-dd HH:mm:ss"
        );

        console.log(`
#${count}
Date: ${date}
TS: ${message.ts}
Thread TS: ${message.thread_ts || "N/A"}
Replies: ${message.reply_count || 0}
Text:
${message.text}
--------------------------------------------------
`);
      });

    cursor = result.response_metadata?.next_cursor || "";

  } while (cursor);

  console.log(`Total Bot Messages: ${count}`);
}

function convertToCodeBlock(text) {
  // Remove existing code blocks
  text = text.replace(/```/g, "");

  const lines = text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const topLines = [];
  const details = [];

  const emojiMap = {
    ":calendar:": "📅",
    ":date:": "📅",
    ":rotating_light:": "🚨",
    ":wave:": "👋",
    ":white_check_mark:": "✅",
    ":warning:": "⚠️",
    ":x:": "❌"
  };

  lines.forEach(line => {
    Object.entries(emojiMap).forEach(([code, emoji]) => {
      line = line.replaceAll(code, emoji);
    });

    line = line.replace(/\*/g, "");

    const isMentionLine = line.includes("<@");

    const isHeaderLine =
      line.includes("New Appointment Booked") ||
      line.includes("New Audit Appointment Booked") ||
      line.includes("New SAB Appointment Booked") ||
      line.includes("Appointment Starting Soon") ||
      line.includes("New Lead") ||
      line.includes("Appointment Details");

    if (isMentionLine || isHeaderLine)
      topLines.push(line);
    else
      details.push(line);
  });

  return `${topLines.join("\n")}

\`\`\`
${details.join("\n")}
\`\`\``;
}

function convertAllBotMessagesToCodeBlocks() {
  const channelId = CONFIG.SLACK.CHANNEL_ID;
  const token = CONFIG.SLACK.BOT_TOKEN;

  let cursor = "";
  let updated = 0;

  do {
    const result = getSlackChannelHistory(channelId, token, cursor);

    if (!result.ok)
      throw new Error(JSON.stringify(result));

    result.messages
      .filter(message => message.bot_id)
      .forEach(message => {
        const newText = convertToCodeBlock(message.text);

        const updateResult = updateSlackMessage(
          channelId,
          message.ts,
          newText,
          token
        );

        if (updateResult.ok) {
          updated++;
          console.log(`Updated ${message.ts}`);
        } else {
          console.error(
            `Failed ${message.ts}: ${JSON.stringify(updateResult)}`
          );
        }

        Utilities.sleep(1000);
      });

    cursor = result.response_metadata?.next_cursor || "";

  } while (cursor);

  console.log(`Updated ${updated} messages.`);
}

function updateSlackMessage(channelId, ts, text, token) {
  const response = UrlFetchApp.fetch(
    "https://slack.com/api/chat.update",
    {
      method: "post",
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${token}`
      },
      payload: JSON.stringify({
        channel: channelId,
        ts,
        text
      }),
      muteHttpExceptions: true
    }
  );

  return JSON.parse(response.getContentText());
}

/**
 * ============================================================================
 * Delete today's bot messages
 *
 * Deletes:
 * 1. Bot parent messages posted today
 * 2. Bot thread replies belonging to those messages
 *
 * Does NOT delete:
 * - Human messages
 * - Bot messages from previous days
 * - Messages in other channels
 * ============================================================================
 */
function deleteTodaysBotMessages() {
  const channelId = CONFIG.SLACK.CHANNEL_ID;
  const token = CONFIG.SLACK.BOT_TOKEN;

  const today = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
  );

  let cursor = "";
  let deleted = 0;

  do {
    const history = getSlackChannelHistory(channelId, token, cursor);

    if (!history.ok) {
      throw new Error(
        `Failed to get channel history: ${JSON.stringify(history)}`
      );
    }

    const botMessages = history.messages.filter(message => {
      if (!message.bot_id) return false;

      const messageDate = Utilities.formatDate(
        new Date(parseFloat(message.ts) * 1000),
        Session.getScriptTimeZone(),
        "yyyy-MM-dd"
      );

      return messageDate === today;
    });

    botMessages.forEach(message => {
      try {

        // ------------------------------------------------------------
        // 1. Delete thread replies first
        // ------------------------------------------------------------
        if (message.reply_count > 0) {
          const replies = getSlackThreadReplies(
            channelId,
            message.ts,
            token
          );

          if (replies.ok && Array.isArray(replies.messages)) {
            replies.messages
              .filter(reply => reply.ts !== message.ts)
              .forEach(reply => {

                const result = deleteSlackMessage(
                  channelId,
                  reply.ts,
                  token
                );

                if (result.ok) {
                  deleted++;
                  console.log(
                    `Deleted thread reply: ${reply.ts}`
                  );
                } else {
                  console.error(
                    `Failed to delete thread reply ${reply.ts}: ` +
                    JSON.stringify(result)
                  );
                }

                Utilities.sleep(500);
              });
          }
        }

        // ------------------------------------------------------------
        // 2. Delete parent bot message
        // ------------------------------------------------------------
        const result = deleteSlackMessage(
          channelId,
          message.ts,
          token
        );

        if (result.ok) {
          deleted++;
          console.log(
            `Deleted parent message: ${message.ts}`
          );
        } else {
          console.error(
            `Failed to delete parent ${message.ts}: ` +
            JSON.stringify(result)
          );
        }

        Utilities.sleep(500);

      } catch (error) {
        console.error(
          `Error deleting ${message.ts}: ${error.message}`
        );
      }
    });

    cursor = history.response_metadata?.next_cursor || "";

  } while (cursor);

  console.log(
    `Finished. Deleted ${deleted} bot messages/replies from ${today}.`
  );

  return deleted;
}

function getSlackThreadReplies(channelId, threadTs, token) {
  const url = "https://slack.com/api/conversations.replies";

  const options = {
    method: "get",
    headers: {
      Authorization: "Bearer " + token
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(
    url +
      "?channel=" + encodeURIComponent(channelId) +
      "&ts=" + encodeURIComponent(threadTs),
    options
  );

  return JSON.parse(response.getContentText());
}