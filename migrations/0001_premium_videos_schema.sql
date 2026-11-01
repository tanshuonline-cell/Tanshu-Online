-- Migration: 0001_premium_videos_schema.sql
-- Description: D1 SQLite Schema for Tanshu Online Premium Video System

-- 1. Videos Table
-- Stores metadata for both free (YouTube) and premium (Cloudflare Stream) videos
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  duration TEXT NOT NULL,
  category TEXT NOT NULL,
  instructor TEXT NOT NULL,
  description TEXT NOT NULL,
  topics_json TEXT NOT NULL DEFAULT '[]',
  access_type TEXT NOT NULL CHECK(access_type IN ('free', 'premium')) DEFAULT 'free',
  is_premium INTEGER NOT NULL DEFAULT 0,
  price INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  stream_video_id TEXT,
  youtube_url TEXT,
  level TEXT CHECK(level IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
  thumbnail_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_videos_access_type ON videos(access_type);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_is_active ON videos(is_active);

-- 2. Payment Orders Table
-- Tracks Cashfree payment intent orders, customer contact, and verification status
CREATE TABLE IF NOT EXISTS payment_orders (
  order_id TEXT PRIMARY KEY,
  cf_order_id TEXT,
  video_id TEXT NOT NULL,
  order_amount REAL NOT NULL,
  order_currency TEXT NOT NULL DEFAULT 'INR',
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  payment_session_id TEXT,
  order_status TEXT NOT NULL CHECK(order_status IN ('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'USER_DROPPED')) DEFAULT 'PENDING',
  cf_payment_id TEXT,
  payment_method TEXT,
  raw_verification_json TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_phone ON payment_orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_payment_orders_video ON payment_orders(video_id);

-- 3. Customer Video Access Table
-- Records verified video access entitlements for customers after successful payment
CREATE TABLE IF NOT EXISTS customer_video_access (
  id TEXT PRIMARY KEY,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  video_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  granted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  is_revoked INTEGER NOT NULL DEFAULT 0,
  revocation_reason TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(customer_phone, video_id),
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE RESTRICT,
  FOREIGN KEY (order_id) REFERENCES payment_orders(order_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_cva_lookup ON customer_video_access(customer_phone, video_id);
CREATE INDEX IF NOT EXISTS idx_cva_order ON customer_video_access(order_id);
