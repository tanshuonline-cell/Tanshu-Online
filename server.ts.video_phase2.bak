import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

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
