
-- 4.1.1 blinks Table
CREATE TABLE blinks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core Info
  url TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'nft', 'defi', 'gaming', 'social', 'utilities', 'other'
  
  -- Creator Info
  creator_name TEXT,
  creator_twitter TEXT,
  creator_email TEXT,
  
  -- Media
  screenshot_url TEXT, -- Auto-generated or uploaded
  icon_url TEXT, -- From actions.json
  
  -- Metadata
  verified BOOLEAN DEFAULT false, -- dial.to verified
  featured BOOLEAN DEFAULT false,
  featured_until TIMESTAMP, -- When featured expires
  featured_tier TEXT, -- 'basic' ($50), 'premium' ($200), null
  
  -- Source Tracking
  source TEXT DEFAULT 'submission', -- 'submission', 'dial.to', 'manual', 'scrape'
  
  -- Analytics
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  rejection_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- SEO
  tags TEXT[], -- Array of tags for better search
  
  -- Validation
  is_valid_blink BOOLEAN DEFAULT true, -- If actions.json validates
  last_checked TIMESTAMP WITH TIME ZONE -- Last time URL was validated
);

-- Indexes for performance
CREATE INDEX idx_category ON blinks(category);
CREATE INDEX idx_status ON blinks(status);
CREATE INDEX idx_featured ON blinks(featured, featured_until);
CREATE INDEX idx_created_at ON blinks(created_at DESC);
CREATE INDEX idx_views ON blinks(views DESC);
CREATE INDEX idx_clicks ON blinks(clicks DESC);
CREATE INDEX idx_url ON blinks(url);

-- Full-text search index
CREATE INDEX idx_search ON blinks USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- 4.1.2 admin_users Table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, -- Use bcrypt
  name TEXT,
  role TEXT DEFAULT 'admin', -- 'admin', 'moderator'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- 4.1.3 analytics Table (Optional - for detailed tracking)
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blink_id UUID REFERENCES blinks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'view', 'click', 'search'
  user_agent TEXT,
  referrer TEXT,
  ip_hash TEXT, -- Hashed IP for privacy
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_blink ON analytics(blink_id, created_at DESC);
CREATE INDEX idx_analytics_event ON analytics(event_type, created_at DESC);

-- 4.1.4 featured_payments Table (Optional - for payment tracking)
CREATE TABLE featured_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blink_id UUID REFERENCES blinks(id) ON DELETE CASCADE,
  tier TEXT NOT NULL, -- 'basic', 'premium'
  amount INTEGER NOT NULL, -- In cents (e.g., 5000 = $50)
  payment_method TEXT, -- 'stripe', 'solana'
  transaction_id TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_featured_blink ON featured_payments(blink_id);
CREATE INDEX idx_featured_status ON featured_payments(status);
