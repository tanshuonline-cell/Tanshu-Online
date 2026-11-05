interface Env {DB:any;CASHFREE_APP_ID:string;CASHFREE_SECRET_KEY:string;CASHFREE_ENVIRONMENT:string;}
const reply=(s=200)=>new Response('ok',{status:s,headers:{'Content-Type':'text/plain','Cache-Control':'no-store'}});
const equal=(a:string,b:string)=>{if(a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0;};
async function hmac(secret:string,value:string){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const b=new Uint8Array(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(value)));let x='';b.forEach(v=>x+=String.fromCharCode(v));return btoa(x);}
async function hash(value:string){const b=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));let x='';b.forEach(v=>x+=v.toString(16).padStart(2,'0'));return x;}
export async function onRequestPost({request,env}:{request:Request;env:Env}){
 if(!env.DB||!env.CASHFREE_APP_ID||!env.CASHFREE_SECRET_KEY)return reply(503);
 const raw=await request.text(),signature=request.headers.get('x-webhook-signature')||'',timestamp=request.headers.get('x-webhook-timestamp')||'';
 if(!signature||!timestamp||!equal(await hmac(env.CASHFREE_SECRET_KEY,timestamp+raw),signature))return reply(401);
 let event:any;try{event=JSON.parse(raw)}catch{return reply(400)}
 const type=String(event.type||event.event_type||'UNKNOWN');
 const data=event.data||{};
 const sid=String(data.subscription_details?.subscription_id||data.subscription_id||event.subscription_id||'');
 const eventId=request.headers.get('x-idempotency-key')||await hash(raw);
 const payloadHash=await hash(raw);
 try{
  const inserted=await env.DB.prepare("INSERT OR IGNORE INTO membership_webhook_events (id,gateway,gateway_event_id,event_type,payload_sha256,processing_status,received_at) VALUES (?,'cashfree',?,?,?,'received',CURRENT_TIMESTAMP)").bind('wh_'+crypto.randomUUID(),eventId,type,payloadHash).run();
  if(!inserted.meta?.changes)return reply(200);
  if(!sid){await env.DB.prepare("UPDATE membership_webhook_events SET processing_status='ignored',processed_at=CURRENT_TIMESTAMP WHERE gateway='cashfree' AND gateway_event_id=?").bind(eventId).run();return reply(200);}
  const base=env.CASHFREE_ENVIRONMENT==='PRODUCTION'?'https://api.cashfree.com/pg':'https://sandbox.cashfree.com/pg';
  const r=await fetch(base+'/subscriptions/'+encodeURIComponent(sid),{headers:{'x-api-version':'2026-01-01','x-client-id':env.CASHFREE_APP_ID,'x-client-secret':env.CASHFREE_SECRET_KEY}});
  const sdata:any=await r.json().catch(()=>({}));if(!r.ok)throw new Error('Cashfree subscription lookup failed');
  const s=String(sdata.subscription_status||'').toUpperCase(),a=String(sdata.authorization_details?.authorization_status||'').toUpperCase();
  const status=s==='ACTIVE'&&a==='ACTIVE'?'active':['CUSTOMER_CANCELLED','CANCELLED','EXPIRED','COMPLETED','LINK_EXPIRED'].includes(s)?'cancelled':['ON_HOLD','PAUSED','CUSTOMER_PAUSED'].includes(s)?'suspended':s==='FAILED'?'payment_failed':'pending';
  await env.DB.prepare("UPDATE membership_subscriptions SET status=?,updated_at=CURRENT_TIMESTAMP WHERE gateway='cashfree' AND gateway_subscription_id=?").bind(status,sid).run();
  await env.DB.prepare("UPDATE membership_webhook_events SET processing_status='processed',processed_at=CURRENT_TIMESTAMP WHERE gateway='cashfree' AND gateway_event_id=?").bind(eventId).run();
  return reply(200);
 }catch(e){console.error('Cashfree membership webhook failed',e);await env.DB.prepare("UPDATE membership_webhook_events SET processing_status='failed' WHERE gateway='cashfree' AND gateway_event_id=?").bind(eventId).run().catch(()=>{});return reply(503);}
}
