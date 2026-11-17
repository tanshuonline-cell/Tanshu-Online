/**
 * TANSHU ONLINE - Free Gmail OTP mail relay
 *
 * Deploy as a Web App:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Store CSP_MAILER_SECRET in Project Settings > Script properties.
 * The Cloudflare Worker sends the same secret in the JSON request.
 */
function doPost(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var expectedSecret = props.getProperty('CSP_MAILER_SECRET');
    var payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    if (!expectedSecret || payload.secret !== expectedSecret) {
      return output({ success: false, error: 'Unauthorized' });
    }

    var to = String(payload.to || '').trim().toLowerCase();
    if (!/^[^\s@]+@gmail\.com$/.test(to)) {
      return output({ success: false, error: 'Only Gmail recipients are supported.' });
    }

    if (MailApp.getRemainingDailyQuota() < 1) {
      return output({ success: false, error: 'Daily Gmail sending quota reached. Try again after the quota resets.' });
    }

    var subject = String(payload.subject || 'TANSHU ONLINE verification code').slice(0, 180);
    var body = String(payload.text || 'Your TANSHU ONLINE verification code is ready.').slice(0, 8000);
    var htmlBody = String(payload.html || '').slice(0, 12000);

    MailApp.sendEmail({
      to: to,
      subject: subject,
      body: body,
      htmlBody: htmlBody || undefined,
      name: 'TANSHU ONLINE'
    });

    return output({ success: true, remainingQuota: MailApp.getRemainingDailyQuota() });
  } catch (err) {
    return output({ success: false, error: String(err && err.message || 'Email send failed.') });
  }
}

function output(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
