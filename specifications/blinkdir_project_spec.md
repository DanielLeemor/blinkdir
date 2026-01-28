# BlinkDir - Solana Blinks Directory
## Project Specification Document

**Version:** 1.0  
**Target Build Time:** 5-7 days  
**Platform:** Web Application (Next.js)  
**Purpose:** Community directory for discovering Solana Actions/Blinks

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Core Features](#core-features)
3. [Technical Architecture](#technical-architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Integration Requirements](#integration-requirements)
8. [User Flows](#user-flows)
9. [Monetization Features](#monetization-features)
10. [Development Milestones](#development-milestones)
11. [Deployment Strategy](#deployment-strategy)
12. [Success Criteria](#success-criteria)

---

## 1. Project Overview

### 1.1 Problem Statement
- Solana Blinks (blockchain links) are scattered across the internet
- No centralized discovery platform exists
- Developers don't know what Blinks already exist
- Users can't easily find useful Blinks
- Current solutions (GitHub awesome-lists, dial.to registry) are not user-friendly

### 1.2 Solution
Build **BlinkDir** - a searchable, browsable directory of all Solana Blinks with:
- Community-driven submissions
- Category-based organization
- Search and filter functionality
- Featured/premium listings (monetization)
- Analytics for developers

### 1.3 Target Users
- **Primary:** Solana developers looking for inspiration/existing Blinks
- **Secondary:** End users discovering useful Blinks
- **Tertiary:** Blink creators wanting visibility

### 1.4 Market Opportunity
- **Competition:** ZERO dedicated Blink directories
- **Timing:** Blinks launched mid-2024, growing rapidly
- **First-mover advantage:** Be THE directory
- **Exit potential:** Acquisition by dial.to, Solana Foundation, or major wallet

---

## 2. Core Features

### 2.1 MVP Features (Phase 1 - Days 1-5)

#### 2.1.1 Public-Facing
- ✅ Homepage with grid of Blinks (cards)
- ✅ Search functionality (by name, description, category)
- ✅ Category filtering (NFT, DeFi, Gaming, Social, Utilities, Other)
- ✅ Blink detail pages
- ✅ Submit Blink form (public)
- ✅ "Try This Blink" button (opens URL in new tab)
- ✅ View/click tracking

#### 2.1.2 Admin-Facing
- ✅ Admin authentication
- ✅ Pending submissions queue
- ✅ Approve/reject functionality
- ✅ Edit Blink details
- ✅ Manually add Blinks
- ✅ Basic analytics dashboard

### 2.2 Post-MVP Features (Phase 2 - Week 2+)

#### 2.2.1 Enhanced Discovery
- Featured Blinks carousel
- "Trending" section (most viewed/clicked)
- "New" section (recently added)
- Tag system (in addition to categories)
- Sort by: newest, most popular, alphabetical

#### 2.2.2 Monetization
- Featured listings ($50/month)
- Premium placement ($200/month)
- Developer analytics dashboard ($20/month)
- Payment integration (Stripe or Solana Pay)

#### 2.2.3 Community Features
- Upvote/downvote Blinks (optional)
- User comments/reviews (optional)
- "Report" button for broken/malicious Blinks
- Email notifications for creators when listed

---

## 3. Technical Architecture

### 3.1 Tech Stack

#### 3.1.1 Frontend
```
Framework: Next.js 15 (App Router)
Language: TypeScript
Styling: Tailwind CSS
UI Components: shadcn/ui (optional) or custom
State Management: React hooks (useState, useContext if needed)
Image Handling: Next.js Image component
```

#### 3.1.2 Backend
```
API: Next.js API Routes (app/api/*)
Runtime: Node.js (serverless functions)
Authentication: NextAuth.js (admin only)
Validation: Zod
```

#### 3.1.3 Database
```
Database: Supabase (PostgreSQL)
ORM: Supabase JS Client
Hosting: Supabase cloud (free tier)
```

#### 3.1.4 Hosting & Deployment
```
Hosting: Netlify or Vercel
Domain: blinkdir.com
SSL: Automatic (included)
CDN: Automatic (included)
```

### 3.2 Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                  User Browser                    │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│           Next.js Frontend (React)               │
│  ┌──────────┬──────────┬──────────┬──────────┐ │
│  │ Homepage │  Search  │  Detail  │  Submit  │ │
│  │          │  Filter  │   Page   │   Form   │ │
│  └──────────┴──────────┴──────────┴──────────┘ │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│           Next.js API Routes                     │
│  ┌──────────┬──────────┬──────────┬──────────┐ │
│  │ Get      │  Search  │  Submit  │  Admin   │ │
│  │ Blinks   │  Blinks  │  Blink   │  Actions │ │
│  └──────────┴──────────┴──────────┴──────────┘ │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│         Supabase (PostgreSQL)                    │
│  ┌──────────┬──────────┬──────────┬──────────┐ │
│  │  blinks  │  users   │ analytics│ featured │ │
│  │  table   │  table   │  table   │  table   │ │
│  └──────────┴──────────┴──────────┴──────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 4. Database Schema

### 4.1 Supabase Tables

#### 4.1.1 `blinks` Table
```sql
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  
  -- SEO
  tags TEXT[], -- Array of tags for better search
  
  -- Validation
  is_valid_blink BOOLEAN DEFAULT true, -- If actions.json validates
  last_checked TIMESTAMP -- Last time URL was validated
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
```

#### 4.1.2 `admin_users` Table
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, -- Use bcrypt
  name TEXT,
  role TEXT DEFAULT 'admin', -- 'admin', 'moderator'
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

#### 4.1.3 `analytics` Table (Optional - for detailed tracking)
```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blink_id UUID REFERENCES blinks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'view', 'click', 'search'
  user_agent TEXT,
  referrer TEXT,
  ip_hash TEXT, -- Hashed IP for privacy
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_blink ON analytics(blink_id, created_at DESC);
CREATE INDEX idx_analytics_event ON analytics(event_type, created_at DESC);
```

#### 4.1.4 `featured_payments` Table (Optional - for payment tracking)
```sql
CREATE TABLE featured_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blink_id UUID REFERENCES blinks(id) ON DELETE CASCADE,
  tier TEXT NOT NULL, -- 'basic', 'premium'
  amount INTEGER NOT NULL, -- In cents (e.g., 5000 = $50)
  payment_method TEXT, -- 'stripe', 'solana'
  transaction_id TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_featured_blink ON featured_payments(blink_id);
CREATE INDEX idx_featured_status ON featured_payments(status);
```

---

## 5. API Endpoints

### 5.1 Public Endpoints

#### 5.1.1 GET `/api/blinks`
**Purpose:** Fetch list of approved Blinks

**Query Parameters:**
```typescript
{
  category?: string;        // Filter by category
  search?: string;          // Search in name/description
  sort?: 'newest' | 'popular' | 'trending';
  limit?: number;           // Default: 50, Max: 100
  offset?: number;          // For pagination
  featured?: boolean;       // Only featured Blinks
}
```

**Response:**
```typescript
{
  blinks: [
    {
      id: string;
      url: string;
      name: string;
      description: string;
      category: string;
      screenshot_url: string;
      icon_url: string;
      creator_name: string;
      creator_twitter: string;
      featured: boolean;
      views: number;
      clicks: number;
      created_at: string;
    }
  ],
  total: number;
  hasMore: boolean;
}
```

#### 5.1.2 GET `/api/blinks/:id`
**Purpose:** Get single Blink details

**Response:**
```typescript
{
  id: string;
  url: string;
  name: string;
  description: string;
  category: string;
  screenshot_url: string;
  icon_url: string;
  creator_name: string;
  creator_twitter: string;
  featured: boolean;
  views: number;
  clicks: number;
  tags: string[];
  created_at: string;
}
```

#### 5.1.3 POST `/api/blinks/submit`
**Purpose:** Submit new Blink

**Body:**
```typescript
{
  url: string;              // Required
  name: string;             // Required
  description: string;      // Required
  category: string;         // Required
  creator_name?: string;
  creator_twitter?: string;
  creator_email?: string;
}
```

**Validation:**
1. Check if URL is valid HTTPS
2. Validate URL returns actions.json
3. Extract metadata from actions.json
4. Check if URL already exists
5. Store as 'pending' status

**Response:**
```typescript
{
  success: boolean;
  message: string;
  blink_id?: string;
}
```

#### 5.1.4 POST `/api/blinks/:id/track`
**Purpose:** Track view/click events

**Body:**
```typescript
{
  event: 'view' | 'click';
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

#### 5.1.5 GET `/api/categories`
**Purpose:** Get all categories with counts

**Response:**
```typescript
{
  categories: [
    {
      name: string;
      slug: string;
      count: number;
    }
  ]
}
```

### 5.2 Admin Endpoints (Protected)

#### 5.2.1 GET `/api/admin/blinks/pending`
**Purpose:** Get pending submissions

**Response:**
```typescript
{
  blinks: [/* Same as public but includes status, creator_email, etc */],
  total: number;
}
```

#### 5.2.2 POST `/api/admin/blinks/:id/approve`
**Purpose:** Approve Blink

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

#### 5.2.3 POST `/api/admin/blinks/:id/reject`
**Purpose:** Reject Blink

**Body:**
```typescript
{
  reason: string;
}
```

#### 5.2.4 PUT `/api/admin/blinks/:id`
**Purpose:** Edit Blink details

**Body:**
```typescript
{
  name?: string;
  description?: string;
  category?: string;
  featured?: boolean;
  featured_tier?: string;
  featured_until?: string;
}
```

#### 5.2.5 DELETE `/api/admin/blinks/:id`
**Purpose:** Delete Blink

#### 5.2.6 GET `/api/admin/analytics`
**Purpose:** Get analytics dashboard data

**Response:**
```typescript
{
  total_blinks: number;
  pending_blinks: number;
  total_views: number;
  total_clicks: number;
  top_blinks: Array<{
    id: string;
    name: string;
    views: number;
    clicks: number;
  }>;
  recent_submissions: Array<{ /* Blink data */ }>;
}
```

---

## 6. Frontend Components

### 6.1 Component Structure

```
app/
├── layout.tsx                 # Root layout
├── page.tsx                   # Homepage
├── search/
│   └── page.tsx              # Search results
├── blink/
│   └── [id]/
│       └── page.tsx          # Blink detail page
├── submit/
│   └── page.tsx              # Submit form
├── admin/
│   ├── layout.tsx            # Admin layout (protected)
│   ├── page.tsx              # Admin dashboard
│   ├── pending/
│   │   └── page.tsx          # Pending approvals
│   └── analytics/
│       └── page.tsx          # Analytics
└── components/
    ├── BlinkCard.tsx         # Blink preview card
    ├── SearchBar.tsx         # Search input
    ├── CategoryFilter.tsx    # Category buttons
    ├── Header.tsx            # Site header
    ├── Footer.tsx            # Site footer
    ├── SubmitForm.tsx        # Submission form
    └── AdminTable.tsx        # Admin table component
```

### 6.2 Key Components

#### 6.2.1 BlinkCard.tsx
```typescript
interface BlinkCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  screenshot_url: string;
  icon_url: string;
  creator_name: string;
  featured: boolean;
  views: number;
  clicks: number;
}

// Displays:
// - Screenshot/icon
// - Name (linked to detail page)
// - Description (truncated)
// - Category badge
// - Featured badge (if featured)
// - View/click stats
// - "Try This Blink" button
```

#### 6.2.2 SearchBar.tsx
```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

// Features:
// - Debounced search (300ms)
// - Clear button
// - Loading indicator
```

#### 6.2.3 CategoryFilter.tsx
```typescript
interface CategoryFilterProps {
  categories: Array<{ name: string; slug: string; count: number }>;
  activeCategory: string | null;
  onSelect: (category: string | null) => void;
}

// Displays:
// - "All" button
// - Category buttons with counts
// - Active state styling
```

---

## 7. Integration Requirements

### 7.1 Blink Validation

#### 7.1.1 actions.json Fetching
```typescript
async function validateBlinkUrl(url: string): Promise<{
  isValid: boolean;
  metadata?: {
    icon: string;
    title: string;
    description: string;
    links?: any;
  };
  error?: string;
}> {
  try {
    // Construct actions.json URL
    const actionsUrl = new URL('/actions.json', url).toString();
    
    // Fetch with timeout
    const response = await fetch(actionsUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000) // 5s timeout
    });
    
    if (!response.ok) {
      return { isValid: false, error: 'actions.json not found' };
    }
    
    const json = await response.json();
    
    // Validate Solana Actions spec
    if (!json.icon || !json.title) {
      return { isValid: false, error: 'Invalid actions.json format' };
    }
    
    return {
      isValid: true,
      metadata: {
        icon: json.icon,
        title: json.title,
        description: json.description,
        links: json.links
      }
    };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
}
```

### 7.2 Screenshot Generation

#### 7.2.1 Options

**Option A: Third-party API (Recommended for MVP)**
```typescript
// Use screenshot.one or similar service
const screenshotUrl = `https://api.screenshot.one/take?url=${encodeURIComponent(blinkUrl)}&viewport_width=1200&viewport_height=630&format=png`;

// Store this URL directly in database
// Free tier usually allows ~100 screenshots/month
```

**Option B: Puppeteer (More complex)**
```typescript
// Run Puppeteer in serverless function
// Requires more setup, larger bundle size
// Better for production after MVP
```

**Option C: Manual Upload**
```typescript
// Let submitters upload their own screenshot
// Simplest approach for MVP
// Add auto-generation later
```

**MVP Recommendation:** Use Option A (screenshot.one) with fallback to Option C

### 7.3 dial.to Registry Scraping (Optional)

#### 7.3.1 Implementation
```typescript
// Cron job (daily) to fetch from dial.to
async function scrapeDialToRegistry() {
  // Check if dial.to has public API or registry
  // If yes, fetch and parse
  // If no, skip this feature for MVP
  
  // For each new Blink found:
  // 1. Check if already in database (by URL)
  // 2. If new, add with status='approved' and source='dial.to'
  // 3. Mark as verified=true
}
```

**MVP Recommendation:** Skip this for initial launch, add in Week 2

### 7.4 Authentication (Admin)

#### 7.4.1 NextAuth.js Setup
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Check against admin_users table
        const user = await db.adminUsers.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user) return null;
        
        const isValid = await compare(credentials.password, user.password_hash);
        
        if (!isValid) return null;
        
        return { id: user.id, email: user.email, name: user.name };
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub;
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### 7.5 Analytics Tracking

#### 7.5.1 Simple Implementation
```typescript
// Client-side tracking (BlinkCard component)
const trackView = async (blinkId: string) => {
  await fetch(`/api/blinks/${blinkId}/track`, {
    method: 'POST',
    body: JSON.stringify({ event: 'view' }),
    headers: { 'Content-Type': 'application/json' }
  });
};

const trackClick = async (blinkId: string) => {
  await fetch(`/api/blinks/${blinkId}/track`, {
    method: 'POST',
    body: JSON.stringify({ event: 'click' }),
    headers: { 'Content-Type': 'application/json' }
  });
};

// API endpoint increments counter in database
// POST /api/blinks/:id/track
await supabase
  .from('blinks')
  .update({ views: db.raw('views + 1') })
  .eq('id', blinkId);
```

---

## 8. User Flows

### 8.1 Visitor Flow (Discovering Blinks)

```
1. User lands on homepage (/)
   ↓
2. Sees grid of featured + recent Blinks
   ↓
3. Options:
   a) Search for specific Blink (search bar)
   b) Filter by category (category buttons)
   c) Browse all Blinks (scroll/pagination)
   ↓
4. Clicks on Blink card
   ↓
5. Sees detail page with:
   - Full description
   - Screenshot
   - Creator info
   - "Try This Blink" button (opens URL in new tab)
   - View/click stats
   ↓
6. Clicks "Try This Blink"
   ↓
7. Opens Blink URL in new tab
   ↓
8. Click event tracked in database
```

### 8.2 Submitter Flow (Adding Blink)

```
1. User clicks "Submit Blink" (in header)
   ↓
2. Fills out form:
   - Blink URL (required)
   - Name (required)
   - Description (required)
   - Category (dropdown, required)
   - Creator name (optional)
   - Creator Twitter (optional)
   - Creator email (optional for updates)
   ↓
3. Clicks "Submit"
   ↓
4. Frontend validates:
   - URL is HTTPS
   - All required fields filled
   ↓
5. API validates:
   - URL returns valid actions.json
   - URL not already in database
   ↓
6. If valid:
   - Blink saved with status='pending'
   - Success message shown
   - "We'll review and list within 24-48 hours"
   ↓
7. If invalid:
   - Error message shown
   - User can correct and resubmit
```

### 8.3 Admin Flow (Reviewing Submissions)

```
1. Admin logs in (/admin/login)
   ↓
2. Sees dashboard:
   - Pending submissions count
   - Total Blinks
   - Views/clicks stats
   - Recent activity
   ↓
3. Clicks "Pending Submissions"
   ↓
4. Sees table of pending Blinks:
   - URL
   - Name
   - Category
   - Submitted date
   - Actions: Approve | Reject | Edit
   ↓
5. Admin reviews Blink:
   - Clicks URL to test
   - Checks description quality
   - Verifies not spam/malicious
   ↓
6. Decision:
   a) Approve → Status changes to 'approved', visible on site
   b) Reject → Status changes to 'rejected', reason stored
   c) Edit → Modify details, then approve
   ↓
7. Optional: Email submitter (if email provided)
```

---

## 9. Monetization Features

### 9.1 Featured Listings

#### 9.1.1 Tiers

**Basic Featured ($50/month):**
- Highlighted card design (border, badge)
- Shows at top of category
- "Featured" badge visible
- Higher position in search results

**Premium Placement ($200/month):**
- Everything in Basic
- Homepage hero slot (rotates if multiple)
- Social media promotion (1 tweet/month)
- Priority in "Trending" section
- Analytics dashboard access

#### 9.1.2 Implementation

**Database:**
```sql
-- Already in schema
featured BOOLEAN DEFAULT false
featured_tier TEXT -- 'basic' or 'premium'
featured_until TIMESTAMP
```

**Display Logic:**
```typescript
// Homepage query
const featuredBlinks = await supabase
  .from('blinks')
  .select('*')
  .eq('status', 'approved')
  .eq('featured', true)
  .gte('featured_until', new Date().toISOString())
  .order('featured_tier', { ascending: false }) // Premium first
  .limit(10);
```

**Admin UI:**
- Add "Make Featured" button in admin panel
- Form: Select tier, duration (1 month, 3 months, 6 months)
- Calculates featured_until date
- Updates database

### 9.2 Developer Analytics (Future)

**Features:**
- Detailed view/click breakdown
- Traffic sources
- Geographic data
- Time-series charts
- Export CSV

**Pricing:** $20/month per Blink

**Implementation:** Post-MVP (Week 3-4)

---

## 10. Development Milestones

### Day 1: Setup & Foundation
**Time:** 6-8 hours

**Tasks:**
- [x] Initialize Next.js project
- [x] Set up Tailwind CSS
- [x] Create Supabase project
- [x] Define database schema
- [x] Create tables in Supabase
- [x] Set up environment variables
- [x] Install dependencies (NextAuth, Supabase client, etc.)
- [x] Create basic folder structure
- [x] Set up Git repository

**Deliverables:**
- Working Next.js app (blank homepage)
- Database ready
- Environment configured

---

### Day 2: Core Backend
**Time:** 8-10 hours

**Tasks:**
- [x] Create API endpoint: GET /api/blinks
- [x] Create API endpoint: GET /api/blinks/:id
- [x] Create API endpoint: POST /api/blinks/submit
- [x] Create API endpoint: POST /api/blinks/:id/track
- [x] Implement Blink validation function (actions.json check)
- [x] Create admin authentication (NextAuth setup)
- [x] Create API endpoint: GET /api/admin/blinks/pending
- [x] Create API endpoint: POST /api/admin/blinks/:id/approve
- [x] Create API endpoint: POST /api/admin/blinks/:id/reject
- [x] Test all endpoints with Postman/Thunder Client

**Deliverables:**
- All API endpoints functional
- Authentication working
- Can manually test via API client

---

### Day 3: Frontend Components
**Time:** 8-10 hours

**Tasks:**
- [x] Create Header component (logo, nav, search)
- [x] Create Footer component
- [x] Create BlinkCard component
- [x] Create SearchBar component
- [x] Create CategoryFilter component
- [x] Build Homepage (/) - grid of Blinks
- [x] Implement search functionality
- [x] Implement category filtering
- [x] Add pagination/load more
- [x] Style with Tailwind CSS

**Deliverables:**
- Homepage functional
- Can browse, search, filter Blinks
- Responsive design

---

### Day 4: Detail Page & Submission
**Time:** 8-10 hours

**Tasks:**
- [x] Create Blink detail page (/blink/[id])
- [x] Display full Blink information
- [x] Add "Try This Blink" button (opens URL)
- [x] Implement view tracking (fires on page load)
- [x] Implement click tracking (fires on button click)
- [x] Create Submit page (/submit)
- [x] Build submission form
- [x] Add client-side validation
- [x] Integrate with API endpoint
- [x] Show success/error messages

**Deliverables:**
- Detail pages working
- Analytics tracking functional
- Submission form complete

---

### Day 5: Admin Panel
**Time:** 8-10 hours

**Tasks:**
- [x] Create admin login page (/admin/login)
- [x] Create admin dashboard (/admin)
- [x] Show key metrics (total Blinks, pending, views, clicks)
- [x] Create pending approvals page (/admin/pending)
- [x] Build approval/rejection UI
- [x] Add edit functionality
- [x] Create manual add Blink form
- [x] Test full admin workflow
- [x] Polish UI/UX

**Deliverables:**
- Complete admin panel
- Can approve, reject, edit Blinks
- Dashboard shows metrics

---

### Day 6: Testing & Polish
**Time:** 6-8 hours

**Tasks:**
- [x] Manual testing of all flows
- [x] Fix bugs found during testing
- [x] Add loading states
- [x] Add error handling
- [x] Optimize images (Next.js Image)
- [x] Add meta tags for SEO
- [x] Test responsive design (mobile, tablet, desktop)
- [x] Performance optimization
- [x] Accessibility check (basic)

**Deliverables:**
- Bug-free application
- Good UX (loading states, errors)
- SEO-ready

---

### Day 7: Deployment & Seeding
**Time:** 4-6 hours

**Tasks:**
- [x] Deploy to Netlify/Vercel
- [x] Configure environment variables in production
- [x] Set up custom domain (blinkdir.com)
- [x] Configure SSL
- [x] Manually seed 30 initial Blinks
- [x] Create admin account
- [x] Test production deployment
- [x] Launch!

**Deliverables:**
- Live production site
- 30+ Blinks listed
- Ready for public use

---

## 11. Deployment Strategy

### 11.1 Hosting Platform

**Recommended: Netlify**

**Why:**
- Free tier includes:
  - Automatic HTTPS
  - CDN
  - Serverless functions
  - 100GB bandwidth/month
  - Custom domain
- Easy Next.js deployment
- One-click deploys from Git

**Alternative: Vercel**
- Similar features
- Better Next.js integration (made by same team)
- Slightly less generous free tier

### 11.2 Environment Variables

**Required in Production:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# NextAuth
NEXTAUTH_URL=https://blinkdir.com
NEXTAUTH_SECRET=xxx (generate with: openssl rand -base64 32)

# Optional: Screenshot API
SCREENSHOT_API_KEY=xxx
```

### 11.3 Domain Setup

1. Register blinkdir.com (Namecheap, Google Domains)
2. Point DNS to Netlify:
   - Add A record: 75.2.60.5
   - Add CNAME: www → blinkdir.netlify.app
3. Configure in Netlify dashboard
4. Wait for SSL provisioning (automatic, ~5 min)

### 11.4 Database Backups

**Supabase Free Tier:**
- Automatic daily backups (7-day retention)
- Can manually export SQL if needed

**Recommendation:**
- Weekly manual exports during first month
- Monitor database size (free tier = 500MB)

---

## 12. Success Criteria

### 12.1 Technical Success

**MVP is complete when:**
- [x] User can browse Blinks
- [x] User can search Blinks
- [x] User can filter by category
- [x] User can view Blink details
- [x] User can submit new Blink
- [x] Admin can approve/reject submissions
- [x] Admin can edit Blink details
- [x] Analytics (views/clicks) are tracked
- [x] Site is deployed and accessible
- [x] Site has 30+ Blinks seeded

### 12.2 Business Success (Week 1-2)

**Metrics to track:**
- 50+ Blinks listed
- 100+ unique visitors
- 10+ organic submissions
- 1+ featured listing sold
- Listed on Solana Discord/Reddit

### 12.3 Growth Success (Month 1-2)

**Metrics to track:**
- 150+ Blinks listed
- 1,000+ unique visitors
- 5+ featured listings active
- Referenced by Solana Foundation
- Integration requests from wallets/apps

---

## 13. Post-MVP Roadmap

### Week 2-3: Enhancements
- Automated dial.to scraping
- Email notifications for submitters
- Better screenshot generation
- User accounts (optional login)
- Upvote/downvote system
- Comments on Blinks

### Week 4-6: Monetization
- Payment integration (Stripe)
- Featured listings self-service
- Developer analytics dashboard
- Newsletter system
- API for programmatic access

### Month 2-3: Scale
- Performance optimizations
- Advanced search (tags, filters)
- Mobile app (optional)
- Partnership with dial.to
- Community moderation tools

---

## 14. Technical Challenges & Solutions

### 14.1 Challenge: Validating Blink URLs

**Problem:** Some actions.json might have CORS issues

**Solution:**
```typescript
// Use server-side fetch in API route (bypasses browser CORS)
// Add timeout to prevent hanging
// Cache validation results to avoid re-fetching
```

### 14.2 Challenge: Screenshot Generation at Scale

**Problem:** Screenshot APIs have rate limits/costs

**Solution:**
```typescript
// MVP: Manual upload + screenshot.one API
// Future: Self-hosted Puppeteer with queue
// Cache screenshots, refresh only on request
```

### 14.3 Challenge: Spam Submissions

**Problem:** Malicious or low-quality submissions

**Solution:**
```typescript
// All submissions start as 'pending'
// Admin approval required before public
// Rate limit: Max 5 submissions per IP per day
// Email verification (optional)
```

### 14.4 Challenge: Database Performance

**Problem:** Slow queries as database grows

**Solution:**
```typescript
// Indexes already defined in schema
// Pagination on all listings
// Cache popular queries (Redis in future)
// Limit to 100 results per query
```

---

## 15. Code Quality Standards

### 15.1 TypeScript

**All files must use TypeScript:**
```typescript
// Good
interface Blink {
  id: string;
  name: string;
  // ...
}

// Bad
const blink: any = { /* ... */ };
```

### 15.2 Error Handling

**All API routes must handle errors:**
```typescript
export async function GET(request: Request) {
  try {
    // Logic here
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/blinks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 15.3 Comments

**Add comments for complex logic:**
```typescript
// Good
// Filter out Blinks where featured period has expired
const activeFeatured = blinks.filter(b => 
  b.featured && new Date(b.featured_until) > new Date()
);

// Not needed for obvious code
const count = blinks.length;
```

---

## 16. Security Considerations

### 16.1 SQL Injection Prevention

**Use Supabase client (parameterized queries):**
```typescript
// Good - parameterized
await supabase
  .from('blinks')
  .select('*')
  .eq('category', userInput);

// Bad - raw SQL with user input
await db.query(`SELECT * FROM blinks WHERE category = '${userInput}'`);
```

### 16.2 XSS Prevention

**Sanitize user input in frontend:**
```typescript
// Next.js automatically escapes in JSX
<p>{blink.description}</p> // Safe

// If using dangerouslySetInnerHTML, sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
```

### 16.3 Rate Limiting

**Protect submission endpoint:**
```typescript
// Simple rate limit: Store in memory (production use Redis)
const submissions = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = submissions.get(ip) || [];
  
  // Remove timestamps older than 1 hour
  const recent = timestamps.filter(t => now - t < 3600000);
  
  if (recent.length >= 5) {
    return false; // Too many submissions
  }
  
  recent.push(now);
  submissions.set(ip, recent);
  return true;
}
```

### 16.4 Admin Access

**Protect all /admin routes:**
```typescript
// app/admin/layout.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }) {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/admin/login');
  }
  
  return <div>{children}</div>;
}
```

---

## 17. Testing Checklist

### 17.1 Manual Testing

**Before Launch:**
- [ ] Homepage loads correctly
- [ ] Search works with various queries
- [ ] Category filtering works
- [ ] Pagination/load more works
- [ ] Blink detail page displays all info
- [ ] "Try This Blink" button opens correct URL
- [ ] Submit form validates input
- [ ] Submit form shows success message
- [ ] Submit form shows error for invalid URL
- [ ] Admin login works
- [ ] Admin can see pending submissions
- [ ] Admin can approve Blink (shows on site)
- [ ] Admin can reject Blink (doesn't show on site)
- [ ] Admin can edit Blink details
- [ ] View tracking increments
- [ ] Click tracking increments
- [ ] Mobile responsive (test on phone)
- [ ] Works in Chrome, Firefox, Safari

### 17.2 Edge Cases

- [ ] Empty search returns all Blinks
- [ ] Search with no results shows "No Blinks found"
- [ ] Invalid Blink ID shows 404
- [ ] Submitting duplicate URL shows error
- [ ] Submitting invalid URL shows error
- [ ] actions.json timeout handled gracefully
- [ ] Very long descriptions truncate properly
- [ ] Missing screenshot shows placeholder
- [ ] Admin trying to access without login redirects

---

## 18. Launch Checklist

### 18.1 Pre-Launch

- [ ] Code committed to Git
- [ ] Environment variables configured in production
- [ ] Database seeded with 30+ Blinks
- [ ] Admin account created
- [ ] Custom domain configured (blinkdir.com)
- [ ] SSL certificate active
- [ ] All pages tested in production
- [ ] Analytics setup (Google Analytics optional)
- [ ] Favicon added
- [ ] Meta tags for SEO added
- [ ] README.md written

### 18.2 Launch Day

- [ ] Announce in Solana Discord (#blinks channel)
- [ ] Tweet from creator account
- [ ] Post on Reddit r/solana
- [ ] Submit to Product Hunt (optional)
- [ ] DM 10 Blink creators to list their Blinks
- [ ] Monitor for bugs/errors
- [ ] Respond to feedback quickly

### 18.3 Week 1 Post-Launch

- [ ] Review all submissions
- [ ] Fix any reported bugs
- [ ] Add requested features (quick wins)
- [ ] Reach out to Solana Foundation
- [ ] Reach out to dial.to team
- [ ] Start featured listings outreach
- [ ] Monitor analytics daily

---

## 19. Handoff Documentation

### 19.1 Repository Structure

```
blinkdir/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   ├── admin/               # Admin pages
│   ├── blink/               # Blink detail pages
│   ├── components/          # React components
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
├── public/                   # Static assets
│   ├── favicon.ico
│   └── logo.png
├── lib/                      # Utility functions
│   ├── supabase.ts         # Supabase client
│   ├── validation.ts       # Blink validation
│   └── types.ts            # TypeScript types
├── .env.local               # Local environment variables
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

### 19.2 Key Files

**Database Schema:** See section 4.1
**API Endpoints:** See section 5
**Environment Variables:** See section 11.2

### 19.3 Common Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)

# Production
npm run build           # Build for production
npm run start           # Start production server

# Database
# (All done via Supabase dashboard)

# Deployment
git push origin main    # Auto-deploys to Netlify
```

---

## 20. Questions for AI Developer

**Before starting, please confirm:**

1. **Tech Stack Familiarity:**
   - [ ] Are you comfortable with Next.js 15 (App Router)?
   - [ ] Have you used Supabase before?
   - [ ] Have you implemented NextAuth.js?
   - [ ] Are you familiar with Tailwind CSS?

2. **Time Estimate:**
   - [ ] Can you commit 6-8 hours/day for 5-7 days?
   - [ ] Do you see any blockers in the spec?
   - [ ] What's your estimated completion time?

3. **Clarifications Needed:**
   - [ ] Any unclear requirements?
   - [ ] Any features you'd recommend changing?
   - [ ] Any concerns about feasibility?

4. **Deliverables:**
   - [ ] Can you provide daily progress updates?
   - [ ] Can you commit to clean, commented code?
   - [ ] Can you provide basic documentation?

---

## 21. Success Metrics (Post-Launch)

### Week 1:
- 50+ Blinks listed
- 100+ unique visitors
- 10+ submissions

### Month 1:
- 150+ Blinks listed
- 1,000+ unique visitors
- 3+ featured listings sold ($150+ revenue)

### Month 3:
- 300+ Blinks listed
- 5,000+ unique visitors
- 10+ featured listings ($500+ MRR)
- Recognized as THE Blink directory

---

## 22. Contact & Support

**Project Owner:** [Your name]
**Timeline:** 5-7 days
**Budget:** Development cost to be discussed
**Launch Target:** [Date]

**Communication:**
- Daily standups (async via Discord/Slack)
- Blockers reported immediately
- Code reviews before deployment

---

## Appendix A: Sample Blink Data

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://solnftscanner.com",
  "name": "SolNFTscanner",
  "description": "Automated NFT portfolio analysis via Solana Blinks. Scan your wallet, discover undervalued traits, get detailed CSV reports.",
  "category": "nft",
  "creator_name": "SolNFT Team",
  "creator_twitter": "@solnftscanner",
  "creator_email": "hello@solnftscanner.com",
  "screenshot_url": "https://screenshot.one/api/...",
  "icon_url": "https://solnftscanner.com/icon.png",
  "verified": false,
  "featured": false,
  "featured_tier": null,
  "featured_until": null,
  "source": "submission",
  "views": 127,
  "clicks": 43,
  "status": "approved",
  "tags": ["nft", "portfolio", "analysis", "traits"],
  "created_at": "2026-01-27T10:00:00Z",
  "updated_at": "2026-01-27T10:00:00Z",
  "approved_at": "2026-01-27T11:30:00Z"
}
```

---

## Appendix B: Categories List

```typescript
export const CATEGORIES = [
  { name: 'NFT Tools', slug: 'nft', description: 'NFT marketplaces, minting, analysis' },
  { name: 'DeFi', slug: 'defi', description: 'Trading, lending, staking, yield' },
  { name: 'Gaming', slug: 'gaming', description: 'On-chain games, gaming tools' },
  { name: 'Social', slug: 'social', description: 'Social platforms, tipping, communities' },
  { name: 'Utilities', slug: 'utilities', description: 'Wallets, payments, tools' },
  { name: 'Governance', slug: 'governance', description: 'DAOs, voting, proposals' },
  { name: 'Other', slug: 'other', description: 'Everything else' }
];
```

---

## Appendix C: Color Scheme (Tailwind)

```typescript
// Recommended color palette
export const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',  // Main brand color
    600: '#0284c7',
    700: '#0369a1',
  },
  accent: {
    500: '#8b5cf6',  // Purple for featured badges
  },
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
};

// Category colors
export const categoryColors = {
  nft: 'bg-purple-100 text-purple-800',
  defi: 'bg-green-100 text-green-800',
  gaming: 'bg-red-100 text-red-800',
  social: 'bg-blue-100 text-blue-800',
  utilities: 'bg-yellow-100 text-yellow-800',
  governance: 'bg-indigo-100 text-indigo-800',
  other: 'bg-gray-100 text-gray-800',
};
```

---

**END OF SPECIFICATION**

This document contains everything needed to build BlinkDir from scratch. Please review and confirm you can deliver within the 5-7 day timeline.

If you have any questions or need clarifications on any section, please ask before starting development.

Good luck! 🚀
