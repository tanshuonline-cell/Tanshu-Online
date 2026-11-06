import React, { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, LoaderCircle, LockKeyhole, ShieldCheck, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    Cashfree?: (options: { mode: 'sandbox' | 'production' }) => {
      subscriptionsCheckout: (options: { subsSessionId: string; redirectTarget: string }) => Promise<any>;
    };
  }
}

type Customer = { id: string; email: string; display_name: string };
type Subscription = { id: string; gateway_subscription_id: string; status: string; current_period_end: string | null; cancel_at_period_end: number | boolean; plan_name: string; monthly_amount_paise: number };
type LatestPayment = { status: string; amount_paise: number; currency: string; paid_at: string | null; created_at: string };

export const MembershipCheckout: React.FC = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [latestPayment, setLatestPayment] = useState<LatestPayment | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState<'error' | 'success' | 'info'>('info');
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('/api/membership/account', { credentials: 'include', cache: 'no-store' })
      .then(async response => response.ok ? response.json() : null)
      .then(data => {
        if (alive) {
          setCustomer(data?.authenticated && data?.success ? data.customer : null);
          setSubscription(data?.subscription || null);
          setLatestPayment(data?.latestPayment || null);
        }
      })
      .catch(() => { if (alive) { setCustomer(null); setSubscription(null); setLatestPayment(null); } })
      .finally(() => { if (alive) setAuthChecked(true); });

    const scriptUrl = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    const existing = document.querySelector<HTMLScriptElement>('script[src="' + scriptUrl + '"]');
    if (window.Cashfree) setSdkReady(true);
    else if (existing) {
      existing.addEventListener('load', () => alive && setSdkReady(Boolean(window.Cashfree)), { once: true });
      existing.addEventListener('error', () => alive && setNotice('Cashfree checkout SDK लोड नहीं हो पाया। कृपया पेज refresh करें।'), { once: true });
    } else {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.onload = () => alive && setSdkReady(Boolean(window.Cashfree));
      script.onerror = () => alive && setNotice('Cashfree checkout SDK लोड नहीं हो पाया। कृपया पेज refresh करें।');
      document.head.appendChild(script);
    }

    const params = new URLSearchParams(window.location.search);
    const returnedSubscriptionId = params.get('membership_subscription_id');
    if (returnedSubscriptionId) {
      setNotice('भुगतान/मैंडेट की स्थिति Cashfree से सत्यापित की जा रही है।');
      setNoticeType('info');
      fetch('/api/membership/subscription-status?subscription_id=' + encodeURIComponent(returnedSubscriptionId), {
        credentials: 'include',
        cache: 'no-store',
      })
        .then(async response => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok || !data.success) throw new Error(data.error || 'स्थिति सत्यापित नहीं हो सकी।');
          if (alive) {
            setNotice(data.active
              ? 'आपकी ₹49 Basic Membership सफलतापूर्वक सक्रिय हो गई है।'
              : data.membershipStatus === 'pending'
                ? 'मैंडेट की पुष्टि हो गई है। पहली सफल recurring payment की पुष्टि होने के बाद Membership सक्रिय होगी।'
                : 'Cashfree से अभी Membership सक्रिय होने की पुष्टि नहीं मिली। कृपया कुछ देर बाद फिर स्थिति जाँचें।');
            setNoticeType(data.active ? 'success' : 'info');
          }
        })
        .catch(error => { if (alive) { setNotice(error.message || 'स्थिति जाँचने में समस्या हुई।'); setNoticeType('error'); } })
        .finally(() => {
          if (alive) {
            fetch('/api/membership/account', { credentials: 'include', cache: 'no-store' })
              .then(async response => response.ok ? response.json() : null)
              .then(data => { if (alive && data?.success) { setCustomer(data.customer); setSubscription(data.subscription || null); setLatestPayment(data.latestPayment || null); } })
              .catch(() => {});
            params.delete('membership_subscription_id');
            const next = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash;
            window.history.replaceState({}, '', next);
          }
        });
    }
    return () => { alive = false; };
  }, []);

  const startCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice('');
    if (!customer) {
      setNotice('पहले Google से सुरक्षित Login करें।');
      setNoticeType('error');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setNotice('कृपया 10 अंकों का सही भारतीय मोबाइल नंबर दर्ज करें।');
      setNoticeType('error');
      return;
    }
    if (!consent) {
      setNotice('₹49 की मासिक recurring payment की सहमति आवश्यक है।');
      setNoticeType('error');
      return;
    }
    if (!sdkReady || !window.Cashfree) {
      setNotice('Cashfree Checkout अभी लोड हो रहा है। कृपया एक बार फिर कोशिश करें।');
      setNoticeType('error');
      return;
    }

    setBusy(true);
    try {
      const response = await fetch('/api/membership/create-subscription', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, recurringConsent: true }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.subscriptionSessionId) {
        throw new Error(data.error || 'Cashfree Checkout session नहीं बन पाया।');
      }
      const cashfree = window.Cashfree({ mode: 'sandbox' });
      const checkoutResult = await cashfree.subscriptionsCheckout({
        subsSessionId: data.subscriptionSessionId,
        redirectTarget: '_self',
      });
      if (checkoutResult?.error) {
        throw new Error(checkoutResult.error.message || 'Cashfree Checkout शुरू नहीं हो पाया।');
      }
      if (!checkoutResult?.redirect && !checkoutResult?.paymentDetails) {
        setBusy(false);
        setNotice('Checkout बंद हो गया। कोई सफल भुगतान मानकर Membership सक्रिय नहीं की गई है।');
        setNoticeType('info');
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Checkout शुरू नहीं हो पाया।');
      setNoticeType('error');
      setBusy(false);
    }
  };

  const refreshMembershipStatus = async () => {
    if (!subscription?.gateway_subscription_id) return;
    setNotice('Cashfree से Membership status दोबारा जाँचा जा रहा है…');
    setNoticeType('info');
    try {
      const response = await fetch('/api/membership/subscription-status?subscription_id=' + encodeURIComponent(subscription.gateway_subscription_id), {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Status check failed.');
      setNotice(data.message || 'Membership status updated.');
      setNoticeType(data.active ? 'success' : 'info');
      const accountResponse = await fetch('/api/membership/account', { credentials: 'include', cache: 'no-store' });
      const account = await accountResponse.json().catch(() => ({}));
      if (accountResponse.ok && account.success) { setSubscription(account.subscription || null); setLatestPayment(account.latestPayment || null); }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Status check failed.');
      setNoticeType('error');
    }
  };

  const cancelAutoRenewal = async () => {
    if (cancelBusy) return;
    setCancelBusy(true);
    setNotice('');
    try {
      const response = await fetch('/api/membership/cancel-subscription', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Cancellation could not be confirmed.');
      setNotice(data.message || 'Auto-renewal cancellation confirmed.');
      setNoticeType('success');
      const accountResponse = await fetch('/api/membership/account', { credentials: 'include', cache: 'no-store' });
      const account = await accountResponse.json().catch(() => ({}));
      if (accountResponse.ok && account.success) setSubscription(account.subscription || null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Cancellation could not be confirmed.');
      setNoticeType('error');
    } finally {
      setCancelBusy(false);
    }
  };

  const noticeClass = noticeType === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
    : noticeType === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-900'
      : 'border-blue-200 bg-blue-50 text-blue-900';

  return (
    <section id="basic-checkout" className="mx-auto mt-10 max-w-3xl scroll-mt-24 rounded-3xl border border-blue-200 bg-white p-6 shadow-lg sm:p-8">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-blue-100 p-3 text-blue-800"><CreditCard className="h-5 w-5" /></span>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-blue-800">Secure Cashfree Subscription Checkout</p>
          <h3 className="mt-1 text-lg font-black text-slate-900">₹49 / month · Basic Membership</h3>
          <p className="mt-1 text-xs text-slate-500">Cashfree Sandbox Preview · UPI AutoPay / supported mandate methods</p>
        </div>
      </div>

      {!authChecked ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-slate-600"><LoaderCircle className="h-4 w-4 animate-spin" /> Google Login स्थिति जाँची जा रही है…</div>
      ) : !customer ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-950">Checkout से पहले Google Login आवश्यक है।</p>
          <a href="/api/membership/auth?action=start" className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-xs font-extrabold text-white hover:bg-blue-800">
            <ShieldCheck className="h-4 w-4" /> Google से सुरक्षित Login करें
          </a>
        </div>
      ) : (
        <form onSubmit={startCheckout} className="mt-5 space-y-4">
          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
            <span className="font-bold">{customer.display_name}</span> · {customer.email}
          </div>
          {subscription && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800">{subscription.plan_name || 'Basic Membership'} · ₹49/month</span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${subscription.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{subscription.status === 'active' ? 'Active' : subscription.status}</span>
              </div>
              {subscription.cancel_at_period_end ? (
                <p className="mt-2 text-xs leading-5 text-amber-800">Auto-renewal cancelled. Access remains until {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('en-IN') : 'the paid period ends'}.</p>
              ) : subscription.status === 'active' ? (
                <button type="button" onClick={cancelAutoRenewal} disabled={cancelBusy} className="mt-3 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-60">
                  {cancelBusy ? 'Cancelling…' : 'Cancel auto-renewal'}
                </button>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={refreshMembershipStatus} className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50">
                    Refresh payment status
                  </button>
                  {['pending', 'payment_failed', 'suspended'].includes(subscription.status) && (
                    <button type="button" onClick={cancelAutoRenewal} disabled={cancelBusy} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-60">
                      {cancelBusy ? 'Cancelling…' : 'Cancel subscription'}
                    </button>
                  )}
                </div>
              )}
              {latestPayment && (
                <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  Latest payment: <strong className={latestPayment.status === 'success' ? 'text-emerald-700' : 'text-rose-700'}>{latestPayment.status}</strong>
                  {' · '}₹{(latestPayment.amount_paise / 100).toFixed(2)}
                  {latestPayment.paid_at ? ' · ' + new Date(latestPayment.paid_at).toLocaleString('en-IN') : ''}
                </p>
              )}
            </div>
          )}
          <div>
            <label htmlFor="membership-phone" className="mb-1.5 block text-xs font-bold text-slate-700">मोबाइल नंबर (Cashfree mandate के लिए)</label>
            <div className="flex overflow-hidden rounded-xl border border-slate-300 focus-within:border-blue-600">
              <span className="bg-slate-100 px-3 py-3 text-sm font-semibold text-slate-600">+91</span>
              <input id="membership-phone" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} required value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10 अंकों का मोबाइल नंबर" className="min-w-0 flex-1 px-3 py-3 text-sm text-slate-900 outline-none" />
            </div>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 text-xs leading-5 text-slate-700">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-blue-700" />
            <span>मैं ₹49 प्रति माह की Membership और Cashfree के माध्यम से recurring payment / AutoPay mandate सेटअप करने की स्पष्ट अनुमति देता/देती हूँ। मैं Cashfree Checkout में mandate की शर्तें देखकर पुष्टि करूँगा/करूँगी। Cancellation के लिए Membership पेज से अनुरोध उपलब्ध कराया जाएगा।</span>
          </label>
          <button type="submit" disabled={busy || !sdkReady || subscription?.status === 'active'} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            {busy ? 'Cashfree Checkout खोला जा रहा है…' : subscription?.status === 'active' ? 'Membership पहले से Active है' : '₹49 / month — Cashfree से आगे बढ़ें'}
          </button>
          <p className="flex items-start gap-2 text-[11px] leading-5 text-slate-500"><LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Payment details Cashfree के सुरक्षित Checkout में दर्ज होंगे। Membership केवल server-verified successful recurring charge के बाद सक्रिय होगी।</p>
        </form>
      )}

      {notice && <div role="status" className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-xs leading-5 ${noticeClass}`}><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{notice}</span></div>}
      <div className="mt-5 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
        अभी केवल Basic ₹49 Sandbox flow तैयार किया जा रहा है। Production भुगतान तब तक बंद रहेगा जब तक Live credentials, domain whitelist और release checks की अलग पुष्टि न हो।
      </div>
    </section>
  );
};
