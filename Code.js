function doPost(e) {
  const channelId = CONFIG.SLACK.CHANNEL_ID;
  const daniel = CONFIG.SLACK.DANIEL_ID;
  const alex = CONFIG.SLACK.ALEX_ID;
  const melissa = CONFIG.SLACK.MELISSA_ID;

  try {
    saveExecution();

    const notif = Number(e.parameter.notif || 1);
    const request = JSON.parse(e.postData.contents);

    saveNotification(notif);
    saveRequest(request);

    switch (notif) {
      case 1:
        sendSlackMessage(request, notif, channelId);
        break;

      case 2:
        sendSlackMessage(request, notif, null, [alex, melissa, daniel]);
        break;

      case 3:
        sendSlackMessage(request, notif, null, [melissa]);
        break;

      case 4:
        sendSlackMessage(request, notif, null, [alex, melissa]);
        break;

      case 5:
        sendSlackMessage(request, notif, channelId);
        break;
      
      case 6:
        sendSlackMessage(request, notif, channelId);
        break;

      default:
        throw new Error(`Invalid notification type: ${notif}`);
    }

    return jsonResponse({
      success: true,
      message: "Notification sent.",
      notification_type: notif
    });

  } catch (error) {
    saveError(error);

    return jsonResponse({
      success: false,
      error: error.message
    });
  }
}