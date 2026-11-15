interface Env {
  DB: any;
  BREVO_API_KEY: string;
  CSP_SENDER_EMAIL: string;
  CSP_SENDER_NAME?: string;
}

async function sendReminder(env: Env, email: string, plan: string, expiry: string, days: number): Promise<boolean> {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'accept': 'application/json', 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { email: env.CSP_SENDER_EMAIL, name: env.CSP_SENDER_NAME || 'TANSHU ONLINE' },
      to: [{ email }],
      subject: 'TANSHU ONLINE membership expires in ' + days + ' days',
      textContent: 'Your ' + plan.toUpperCase() + ' membership expires on ' + expiry + '. Please contact TANSHU ONLINE if you want to renew. No automatic payment will be taken.',
      htmlContent: '<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#172033"><h2>TANSHU ONLINE</h2><p>Your <b>' + plan.toUpperCase() + '</b> membership expires in <b>' + days + ' days</b>.</p><p>Expiry date: <b>' + expiry + '</b></p><p>Please contact TANSHU ONLINE if you wish to renew. No automatic payment will be taken.</p></div>'
    })
  });
  return response.ok;
}

export default {
  async scheduled(_controller: ScheduledController, env: Env, _ctx: ExecutionContext): Promise<void> {
    if (!env.DB || !env.BREVO_API_KEY || !env.CSP_SENDER_EMAIL) throw new Error('CSP reminder worker is missing its D1 or Brevo configuration.');
    const istToday = new Date(Date.now() + 330 * 60 * 1000).toISOString().slice(0, 10);
    for (const days of [7, 3, 1]) {
      const target = new Date(istToday + 'T00:00:00.000Z');
      target.setUTCDate(target.getUTCDate() + days);
      const targetDate = target.toISOString().slice(0, 10);
      const { results } = await env.DB.prepare(
        "SELECT s.id AS subscription_id, s.customer_id, s.plan_code, s.expires_at, c.email FROM csp_subscriptions s JOIN csp_customers c ON c.id = s.customer_id WHERE s.status = 'active' AND c.status = 'active' AND date(s.expires_at) = ?"
      ).bind(targetDate).all();
      for (const row of results || []) {
        const claim = await env.DB.prepare(
          'INSERT OR IGNORE INTO csp_reminder_log (id, subscription_id, customer_id, reminder_days) VALUES (?, ?, ?, ?)'
        ).bind(crypto.randomUUID(), row.subscription_id, row.customer_id, days).run();
        if (!claim?.meta?.changes) continue;
        const sent = await sendReminder(env, row.email, row.plan_code, String(row.expires_at).slice(0, 10), days).catch(() => false);
        if (!sent) await env.DB.prepare('DELETE FROM csp_reminder_log WHERE subscription_id = ? AND reminder_days = ?').bind(row.subscription_id, days).run();
      }
    }
  }
};
