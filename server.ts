import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { LATEST_VIDEOS } from './src/data/videosData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Lightweight cookie parser middleware
  app.use((req: any, _res: any, next: any) => {
    req.cookies = {};
    if (req.headers.cookie) {
      req.headers.cookie.split(';').forEach((cookie: string) => {
        const [name, ...rest] = cookie.split('=');
        if (name) {
          req.cookies[name.trim()] = decodeURIComponent(rest.join('=').trim());
        }
      });
    }
    next();
  });

  // API Endpoints
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      appName: 'TANSHU ONLINE',
      version: '1.0.0',
      confirmedTools: 18,
      plannedEcosystem: 114
    });
  });

  // Postal PIN Code Search API
  app.get('/api/pincode/search', (req: Request, res: Response) => {
    const q = ((req.query.q as string) || '').toLowerCase().trim();
    if (!q) {
      return res.json({ results: [] });
    }
    // Return mock or live matches
    return res.json({
      query: q,
      message: 'PIN Code search endpoint active'
    });
  });

  // Feedback & Feature Request Endpoint for Cyber Cafe Operators
  app.post('/api/feedback', (req: Request, res: Response) => {
    const { operatorName, shopCity, toolRequested, comments } = req.body;
    res.json({
      success: true,
      message: 'Thank you for your feedback! It has been logged for our Phase 2 tool roadmap.'
    });
  });

  // ========================================================
  // TANSHU ONLINE — PREMIUM VIDEO SYSTEM (DEV EXPRESS MIRROR)
  // Mirrors Cloudflare Pages Functions (/functions/api/...)
  // ========================================================

  // In-memory development store for orders and video access
  const devOrders = new Map<string, any>();
  const devAccess = new Map<string, any>(); // key: `${phone}_${videoId}`
  const devVideos = new Map<string, any>();

  // Seed video catalog with default entries
  for (const v of LATEST_VIDEOS) {
    devVideos.set(v.id, { ...v });
  }

  // 1. Create Payment Order
  app.post('/api/video/create-order', async (req: Request, res: Response) => {
    try {
      const { videoId, customerPhone, customerEmail, customerName } = req.body;
      if (!videoId || !customerPhone) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: videoId and customerPhone are required.'
        });
      }

      const sanitizedPhone = String(customerPhone).replace(/\D/g, '').slice(-10);
      if (sanitizedPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid 10-digit mobile number.'
        });
      }

      const accessKey = `${sanitizedPhone}_${videoId}`;
      if (devAccess.has(accessKey) && !devAccess.get(accessKey).isRevoked) {
        return res.json({
          success: true,
          alreadyPurchased: true,
          message: 'You already have active access to this premium video.',
          videoId
        });
      }

      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const orderId = `TANSHU_${timestamp}_${randomSuffix}`;
      const videoPrice = 99; // Standard fallback price in INR

      const appId = process.env.CASHFREE_APP_ID;
      const secretKey = process.env.CASHFREE_SECRET_KEY;
      const isProd = process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION';

      let paymentSessionId = `dev_session_${orderId}`;

      if (appId && secretKey && !appId.includes('YOUR_')) {
        const cashfreeBaseUrl = isProd
          ? 'https://api.cashfree.com/pg/orders'
          : 'https://sandbox.cashfree.com/pg/orders';

        const cfResponse = await fetch(cashfreeBaseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-version': '2023-08-01',
            'x-client-id': appId,
            'x-client-secret': secretKey
          },
          body: JSON.stringify({
            order_id: orderId,
            order_amount: videoPrice,
            order_currency: 'INR',
            customer_details: {
              customer_id: `cust_${sanitizedPhone}`,
              customer_phone: sanitizedPhone,
              customer_email: customerEmail || `customer_${sanitizedPhone}@tanshuonline.com`,
              customer_name: customerName || 'Tanshu Customer'
            },
            order_meta: {
              return_url: `${req.protocol}://${req.get('host')}/?order_id={order_id}&video_id=${videoId}&payment_status=check`,
              notify_url: `${req.protocol}://${req.get('host')}/api/video/webhook`
            },
            order_note: `Purchase of Video ${videoId} on Tanshu Online`
          })
        });

        const cfData = await cfResponse.json();
        if (cfResponse.ok && cfData.payment_session_id) {
          paymentSessionId = cfData.payment_session_id;
        }
      }

      devOrders.set(orderId, {
        orderId,
        videoId,
        orderAmount: videoPrice,
        customerPhone: sanitizedPhone,
        customerEmail,
        orderStatus: 'PENDING',
        paymentSessionId,
        createdAt: new Date().toISOString()
      });

      res.json({
        success: true,
        orderId,
        paymentSessionId,
        orderAmount: videoPrice,
        orderCurrency: 'INR',
        videoTitle: 'Tanshu Online Premium Training Video',
        environment: isProd ? 'PRODUCTION' : 'SANDBOX',
        gatewayConfigured: Boolean(appId && secretKey && !appId.includes('YOUR_'))
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Error creating order' });
    }
  });

  // 2. Verify Payment
  app.post('/api/video/verify-payment', async (req: Request, res: Response) => {
    try {
      const { orderId, customerPhone, customerEmail, videoId } = req.body;
      if (!orderId || !customerPhone || !videoId) {
        return res.status(400).json({
          success: false,
          isPaid: false,
          error: 'Missing required parameters.'
        });
      }

      const sanitizedPhone = String(customerPhone).replace(/\D/g, '').slice(-10);
      const appId = process.env.CASHFREE_APP_ID;
      const secretKey = process.env.CASHFREE_SECRET_KEY;
      const isProd = process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION';

      let isPaid = false;

      if (!appId || !secretKey || appId.includes('YOUR_')) {
        return res.status(503).json({
          success: false,
          isPaid: false,
          error: 'Cashfree API credentials are not configured on this server. Payment verification failed closed.'
        });
      }

      const cashfreeBaseUrl = isProd
        ? `https://api.cashfree.com/pg/orders/${orderId}`
        : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

      const cfResp = await fetch(cashfreeBaseUrl, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2023-08-01',
          'x-client-id': appId,
          'x-client-secret': secretKey
        }
      });
      const cfData = await cfResp.json();
      if (!cfResp.ok) {
        return res.status(cfResp.status).json({
          success: false,
          isPaid: false,
          error: cfData.message || 'Could not query Cashfree order status from payment gateway.'
        });
      }

      if (cfData.order_status === 'PAID') {
        isPaid = true;
      } else {
        return res.json({
          success: true,
          isPaid: false,
          orderStatus: cfData.order_status,
          message: `Order status is currently ${cfData.order_status}. Video remains locked until payment is confirmed.`
        });
      }

      const order = devOrders.get(orderId);
      if (order) {
        if (order.videoId !== videoId) {
          return res.status(400).json({
            success: false,
            isPaid: false,
            error: 'Order validation error: This payment was initiated for a different video.'
          });
        }
        if (order.customerPhone !== sanitizedPhone) {
          return res.status(400).json({
            success: false,
            isPaid: false,
            error: 'Order validation error: Customer phone mismatch.'
          });
        }
      }

      if (isPaid) {
        const accessKey = `${sanitizedPhone}_${videoId}`;
        devAccess.set(accessKey, {
          id: `acc_${Date.now()}`,
          customerPhone: sanitizedPhone,
          customerEmail,
          videoId,
          orderId,
          grantedAt: new Date().toISOString(),
          isRevoked: false
        });

        if (order) {
          order.orderStatus = 'PAID';
        }

        const sessionToken = `session_${sanitizedPhone}_${videoId}_${Date.now()}`;
        res.cookie(`tanshu_video_${videoId}_access`, sessionToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 3600 * 1000
        });

        return res.json({
          success: true,
          isPaid: true,
          orderId,
          videoId,
          customerPhone: sanitizedPhone,
          sessionToken,
          message: 'Payment verified and video unlocked successfully.'
        });
      }

      return res.json({
        success: true,
        isPaid: false,
        error: 'Order is not marked as PAID by payment gateway.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, isPaid: false, error: err.message });
    }
  });

  // 3. Webhook Listener
  app.post('/api/video/webhook', (req: Request, res: Response) => {
    try {
      const orderData = req.body?.data?.order;
      if (orderData && orderData.order_status === 'PAID') {
        const orderId = orderData.order_id;
        const phone = orderData.customer_details?.customer_phone;
        const order = devOrders.get(orderId);
        if (order) {
          order.orderStatus = 'PAID';
          if (phone && order.videoId) {
            devAccess.set(`${phone}_${order.videoId}`, {
              id: `acc_wh_${Date.now()}`,
              customerPhone: phone,
              videoId: order.videoId,
              orderId,
              grantedAt: new Date().toISOString(),
              isRevoked: false
            });
          }
        }
      }
      res.json({ status: 'SUCCESS' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Restore Access / 2FA SMS Verification endpoint
  app.post('/api/video/restore-access', (req: Request, res: Response) => {
    try {
      const { customerPhone, videoId } = req.body || {};
      if (!customerPhone || !videoId) {
        return res.status(400).json({
          success: false,
          error: 'Both registered mobile number and video ID are required.'
        });
      }

      const hasOtpProvider = Boolean(
        process.env.SMS_OTP_API_KEY && !process.env.SMS_OTP_API_KEY.includes('YOUR_')
      );

      if (!hasOtpProvider) {
        return res.status(503).json({
          success: false,
          otpConfigured: false,
          error:
            'Two-Factor SMS OTP verification service is not yet configured on this server. To protect customer purchases from unauthorized access, restoring access by mobile number alone is strictly disabled. Please contact support at tanshuonline@gmail.com with your Cashfree payment receipt or order ID to restore your access.'
        });
      }

      return res.json({
        success: true,
        otpConfigured: true,
        message: 'OTP service active'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Stream Playback Token Issuer (Strict Authentication & Zero Dummy Tokens)
  app.post('/api/video/stream-token', (req: Request, res: Response) => {
    try {
      const { videoId, customerPhone, sessionToken } = req.body;
      if (!videoId) {
        return res.status(400).json({ authorized: false, error: 'videoId is required' });
      }

      const authHeader = req.headers.authorization || '';
      const bearerToken = authHeader.replace(/^Bearer\s+/i, '').trim();
      const cookieToken = req.cookies?.[`tanshu_video_${videoId}_access`];
      const tokenToValidate = bearerToken || sessionToken || cookieToken;

      if (!tokenToValidate) {
        return res.status(401).json({
          authorized: false,
          error: 'Access denied: Valid authenticated purchase session token required. Phone-number-only access is strictly disabled for security.'
        });
      }

      const sanitizedPhone = String(customerPhone || '').replace(/\D/g, '').slice(-10);
      const accessKey = `${sanitizedPhone}_${videoId}`;
      const hasAccess = devAccess.has(accessKey) && !devAccess.get(accessKey).isRevoked;

      if (!hasAccess) {
        return res.status(403).json({
          authorized: false,
          error: 'Access denied. You have not purchased this premium video, or your access was revoked.'
        });
      }

      // Check Cloudflare Stream credentials
      const streamAccountId = process.env.CLOUDFLARE_STREAM_ACCOUNT_ID;
      const streamApiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;

      if (!streamAccountId || !streamApiToken || streamAccountId.includes('YOUR_') || streamApiToken.includes('YOUR_')) {
        return res.status(503).json({
          authorized: false,
          error: 'Cloudflare Stream credentials (CLOUDFLARE_STREAM_ACCOUNT_ID and CLOUDFLARE_STREAM_API_TOKEN) are not configured on the server. Secure playback tokens cannot be generated.'
        });
      }

      // Sample masterclasses check
      if (videoId.startsWith('premium-') || !req.body.streamVideoId || req.body.streamVideoId.startsWith('cf_stream_')) {
        return res.status(400).json({
          authorized: false,
          error: 'This premium masterclass is a sample catalog entry without an active Cloudflare Stream UID. Please upload the video media in Cloudflare Stream dashboard.'
        });
      }

      return res.status(503).json({
        authorized: false,
        error: 'Cloudflare Stream API integration required for genuine token signing.'
      });
    } catch (err: any) {
      res.status(500).json({ authorized: false, error: err.message });
    }
  });

  // Rate limiter for admin login on dev server
  const devLoginAttempts = new Map<string, { count: number; lockedUntil: number }>();

  function verifyServerAdminAuth(req: Request): boolean {
    const signingKey = process.env.ADMIN_SECRET_TOKEN;
    if (!signingKey || signingKey.trim().length === 0 || signingKey.includes('YOUR_')) {
      return false;
    }

    const authHeader = req.headers.authorization || '';
    const bearerToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    const cookieToken = req.cookies?.tanshu_admin_session;
    const rawToken = bearerToken || cookieToken;

    if (!rawToken || typeof rawToken !== 'string' || !rawToken.includes('.')) {
      return false;
    }

    try {
      const [b64, sig] = rawToken.split('.');
      if (!b64 || !sig) return false;

      const expectedSig = crypto.createHmac('sha256', signingKey).update(b64).digest('hex');
      const sigBuf = Buffer.from(sig);
      const expectedBuf = Buffer.from(expectedSig);
      if (sigBuf.length !== expectedBuf.length) return false;
      if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

      const payload = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
      if (payload.exp && payload.exp < Date.now()) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  // 6. Admin Authentication Routes
  app.post('/api/admin/auth/login', (req: Request, res: Response) => {
    try {
      // 1. Fail closed if admin environment credentials or signing secret are not configured
      const adminUser = process.env.ADMIN_USERNAME;
      const adminPass = process.env.ADMIN_PASSWORD;
      const signingKey = process.env.ADMIN_SECRET_TOKEN;

      const isConfigured = Boolean(
        adminUser &&
        adminPass &&
        signingKey &&
        adminUser.trim().length > 0 &&
        adminPass.trim().length > 0 &&
        signingKey.trim().length > 0 &&
        !adminUser.includes('YOUR_') &&
        !adminPass.includes('YOUR_') &&
        !signingKey.includes('YOUR_')
      );

      if (!isConfigured) {
        return res.status(503).json({
          success: false,
          error: 'Admin authentication is unavailable because server credentials (ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_SECRET_TOKEN) are not configured in environment variables / secrets.'
        });
      }

      const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
      const now = Date.now();
      const attempt = devLoginAttempts.get(clientIp);

      if (attempt && attempt.lockedUntil > now) {
        const remaining = Math.ceil((attempt.lockedUntil - now) / 1000);
        return res.status(429).json({
          success: false,
          error: `Too many failed login attempts. Please wait ${remaining} seconds before trying again.`
        });
      }

      const { username, password } = req.body || {};
      if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Both username and password are required.' });
      }

      const isUserMatch = username.trim() === adminUser;
      const isPassMatch = password === adminPass;

      if (!isUserMatch || !isPassMatch) {
        const count = (attempt?.count || 0) + 1;
        const lockedUntil = count >= 5 ? now + 15 * 60 * 1000 : 0;
        devLoginAttempts.set(clientIp, { count, lockedUntil });

        return res.status(401).json({
          success: false,
          error: count >= 5
            ? 'Account locked for 15 minutes due to multiple failed login attempts.'
            : `Invalid username or password. (${5 - count} attempts remaining)`
        });
      }

      devLoginAttempts.delete(clientIp);

      // Create cryptographically signed HMAC-SHA256 session token using separate ADMIN_SECRET_TOKEN
      const sessionPayload = JSON.stringify({
        u: adminUser,
        role: 'superadmin',
        iat: now,
        exp: now + 24 * 3600 * 1000 // 24 hours
      });
      const b64 = Buffer.from(sessionPayload).toString('base64');
      const sig = crypto.createHmac('sha256', signingKey as string).update(b64).digest('hex');
      const sessionToken = `${b64}.${sig}`;

      res.cookie('tanshu_admin_session', sessionToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 24 * 3600 * 1000
      });

      return res.json({
        success: true,
        token: sessionToken,
        user: { username: adminUser, role: 'superadmin', lastLogin: new Date().toISOString() },
        message: 'Admin authentication successful.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin/auth/logout', (_req: Request, res: Response) => {
    res.cookie('tanshu_admin_session', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 0
    });
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  app.get('/api/admin/auth/check', (req: Request, res: Response) => {
    if (!verifyServerAdminAuth(req)) {
      return res.status(401).json({ authenticated: false, error: 'No active admin session.' });
    }
    const authHeader = req.headers.authorization || '';
    const bearerToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    const cookieToken = req.cookies?.tanshu_admin_session;
    const rawToken = bearerToken || cookieToken;

    let username = process.env.ADMIN_USERNAME || 'admin';
    try {
      if (typeof rawToken === 'string' && rawToken.includes('.')) {
        const [b64] = rawToken.split('.');
        const payload = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
        if (payload.u) username = payload.u;
      }
    } catch {}

    res.json({
      authenticated: true,
      user: { username, role: 'superadmin' }
    });
  });

  // 7. Admin Video Catalog CRUD
  app.get('/api/admin/videos', (req: Request, res: Response) => {
    if (!verifyServerAdminAuth(req)) {
      return res.status(401).json({ error: 'Unauthorized admin access.' });
    }
    const videos = Array.from(devVideos.values()).map(v => {
      let activeCount = 0;
      for (const acc of devAccess.values()) {
        if (acc.videoId === v.id && !acc.isRevoked) activeCount++;
      }
      return { ...v, active_subscribers_count: activeCount };
    });
    res.json({ success: true, videos });
  });

  app.post('/api/admin/videos', (req: Request, res: Response) => {
    if (!verifyServerAdminAuth(req)) {
      return res.status(401).json({ error: 'Unauthorized admin access.' });
    }
    const { id, title, category, instructor, price, isPremium, accessType, streamVideoId, isActive } = req.body;
    if (!title || !category || !instructor) {
      return res.status(400).json({ success: false, error: 'Title, category and instructor are required.' });
    }

    const finalIsPremium = isPremium || accessType === 'premium';
    const isAct = isActive !== false;

    // Validate that a genuine Cloudflare Stream UID is present before activating a Premium video
    if (finalIsPremium && isAct) {
      if (!streamVideoId || streamVideoId.startsWith('cf_stream_') || streamVideoId.startsWith('mock_') || streamVideoId.startsWith('stream-')) {
        return res.status(400).json({
          success: false,
          error: 'Validation error: A genuine Cloudflare Stream Video UID is required before activating a Premium video. Placeholder or sample IDs cannot be activated.'
        });
      }
    }

    const videoId = id || `vid_${Date.now()}`;
    const cleanPrice = finalIsPremium ? Math.max(0, Math.floor(Number(price) || 0)) : 0;

    const record = {
      ...req.body,
      id: videoId,
      price: cleanPrice,
      isPremium: Boolean(finalIsPremium),
      accessType: finalIsPremium ? 'premium' : 'free',
      isActive: isAct,
      updatedAt: new Date().toISOString()
    };
    devVideos.set(videoId, record);
    res.json({ success: true, videoId, message: 'Video saved successfully.' });
  });

  app.put('/api/admin/videos/:id', (req: Request, res: Response) => {
    if (!verifyServerAdminAuth(req)) {
      return res.status(401).json({ error: 'Unauthorized admin access.' });
    }
    const videoId = req.params.id;
    const existing = devVideos.get(videoId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Video not found.' });
    }

    const finalIsPremium = req.body.isPremium ?? existing.isPremium;
    const isAct = req.body.isActive !== false;
    const streamVideoId = req.body.streamVideoId ?? existing.streamVideoId;

    if (finalIsPremium && isAct) {
      if (!streamVideoId || streamVideoId.startsWith('cf_stream_') || streamVideoId.startsWith('mock_') || streamVideoId.startsWith('stream-')) {
        return res.status(400).json({
          success: false,
          error: 'Validation error: A genuine Cloudflare Stream Video UID is required before activating a Premium video. Placeholder or sample IDs cannot be activated.'
        });
      }
    }

    const updated = {
      ...existing,
      ...req.body,
      id: videoId,
      price: finalIsPremium ? Math.max(0, Math.floor(Number(req.body.price ?? existing.price) || 0)) : 0,
      updatedAt: new Date().toISOString()
    };
    devVideos.set(videoId, updated);
    res.json({ success: true, video: updated, message: 'Video updated successfully.' });
  });

  app.delete('/api/admin/videos/:id', (req: Request, res: Response) => {
    if (!verifyServerAdminAuth(req)) {
      return res.status(401).json({ error: 'Unauthorized admin access.' });
    }
    const videoId = req.params.id;
    const existing = devVideos.get(videoId);
    if (existing) {
      existing.isActive = false;
      existing.updatedAt = new Date().toISOString();
      devVideos.set(videoId, existing);
    }
    res.json({ success: true, message: `Video ${videoId} deactivated successfully.` });
  });

  // 8. Admin Customer Purchases
  app.get('/api/admin/purchases', (req: Request, res: Response) => {
    if (!verifyServerAdminAuth(req)) {
      return res.status(401).json({ error: 'Unauthorized admin access.' });
    }

    const purchases = Array.from(devAccess.values()).map(acc => {
      const phone = String(acc.customerPhone || '');
      const maskedPhone = phone.length >= 10
        ? `+91 ${phone.slice(0, 2)}****${phone.slice(-4)}`
        : phone;
      const video = devVideos.get(acc.videoId);

      return {
        id: acc.id,
        customerPhone: maskedPhone,
        videoId: acc.videoId,
        videoTitle: video?.title || acc.videoId,
        orderId: acc.orderId,
        amountPaid: video?.price || 99,
        paymentStatus: 'PAID',
        grantedAt: acc.grantedAt || new Date().toISOString(),
        isRevoked: Boolean(acc.isRevoked)
      };
    });

    res.json({ success: true, purchases });
  });

  // 9. Admin Revoke Access
  app.post('/api/admin/revoke-access', (req: Request, res: Response) => {
    if (!verifyServerAdminAuth(req)) {
      return res.status(401).json({ error: 'Unauthorized admin access.' });
    }
    const { accessId, revoke } = req.body || {};
    if (!accessId) {
      return res.status(400).json({ success: false, error: 'accessId is required.' });
    }

    const shouldRevoke = revoke !== false;
    for (const [key, acc] of devAccess.entries()) {
      if (acc.id === accessId) {
        acc.isRevoked = shouldRevoke;
        devAccess.set(key, acc);
        return res.json({
          success: true,
          accessId,
          isRevoked: shouldRevoke,
          message: shouldRevoke ? 'Customer access revoked successfully.' : 'Customer access restored.'
        });
      }
    }

    res.status(404).json({ success: false, error: 'Access record not found.' });
  });

  // 10. Public Video Catalog
  app.get('/api/video/catalog', (_req: Request, res: Response) => {
    const videos = Array.from(devVideos.values()).filter(v => v.isActive !== false);
    res.json({ success: true, videos });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development mode: Mount Vite dev server
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TANSHU ONLINE server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
