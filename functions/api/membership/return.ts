// Cashfree posts the hosted-checkout result to this endpoint. Never trust the posted status;
// redirect to the app, which performs an authenticated server-to-server status fetch.
export async function onRequestPost({request}:{request:Request}) {
  const url=new URL(request.url);
  let sid=url.searchParams.get('subscription_id')||'';
  if(!sid){const form=await request.formData().catch(()=>null);sid=String(form?.get('subscriptionId')||form?.get('subscription_id')||'');}
  if(!/^[A-Za-z0-9_.-]{1,250}$/.test(sid))return new Response('Invalid subscription reference.',{status:400});
  const target=new URL('/membership',url.origin);target.searchParams.set('membership_subscription_id',sid);
  return Response.redirect(target.toString(),303);
}
export async function onRequestGet({request}:{request:Request}) {
  const url=new URL(request.url);const sid=url.searchParams.get('subscription_id')||'';
  if(!sid)return new Response('Missing subscription reference.',{status:400});
  const target=new URL('/',url.origin);target.searchParams.set('membership_subscription_id',sid);
  return Response.redirect(target.toString(),302);
}
