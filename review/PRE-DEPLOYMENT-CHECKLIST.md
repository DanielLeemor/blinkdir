# PRE-DEPLOYMENT CHECKLIST

## ⚠️ CRITICAL FIX FIRST

**BlinkActionPreview.tsx has duplicate code!**

❌ DO NOT USE: `BlinkActionPreview-UPDATED.tsx` (has garbage at end)
✅ USE THIS: `BlinkActionPreview-CLEAN.tsx` (fixed version)

Replace your `app/components/BlinkActionPreview.tsx` with `BlinkActionPreview-CLEAN.tsx`

---

## 📋 ALL FILES TO UPDATE (VERIFIED CLEAN)

### 1. Database (Run SQL)
- [ ] Run `drop-old-indexes.sql` in Supabase
- [ ] Run `fix-rls-ULTRA-SIMPLE.sql` in Supabase
- [ ] Verify 0 security alerts in Dashboard

### 2. Core Files (Replace)
- [ ] `lib/validation.ts` ← `validation-STRICT.ts`
- [ ] `app/components/WalletProvider.tsx` ← `WalletProvider-MULTIWALLET.tsx`
- [ ] `app/components/WalletButton.tsx` ← `WalletButton-MULTIWALLET.tsx`
- [ ] `app/components/BlinkActionPreview.tsx` ← `BlinkActionPreview-CLEAN.tsx` ⚠️

### 3. New Files (Add)
- [ ] Add `lib/blinkCrawler.ts`
- [ ] Add `scripts/seed-real-blinks.ts`

### 4. Existing Files (Should Already Be There)
- [ ] `app/components/TransactionPreviewModal.tsx`
- [ ] `app/components/TransactionSuccessModal.tsx`
- [ ] `app/components/Header.tsx` (with WalletButton import)
- [ ] `app/layout.tsx` (with WalletProvider wrapper)
- [ ] `app/api/blinks/transaction/route.ts`
- [ ] `app/api/proxy/route.ts` (with POST handler)

### 5. Optional UI Improvements
- [ ] `app/components/BlinkDetailContent.tsx` ← `BlinkDetailContent-IMPROVED.tsx`
- [ ] `app/blink/[id]/page.tsx` ← `page-IMPROVED.tsx`

---

## 🧪 TESTING BEFORE DEPLOYMENT

### Step 1: Clean Install
```bash
rm -rf node_modules package-lock.json
npm install
```

### Step 2: Build Test
```bash
npm run build
```

**Expected:** Build succeeds with 0 errors

### Step 3: Run Locally
```bash
npm run dev
```

**Test these:**

#### Security Tests:
- [ ] Supabase Dashboard shows 0 RLS warnings
- [ ] Database has 0 fake blinks (check table)

#### Wallet Tests:
- [ ] Click "Connect Wallet" → Shows picker with 3 wallets
- [ ] Connect with Phantom → Works
- [ ] Connect with Solflare → Works (if installed)
- [ ] Connect with Backpack → Works (if installed)
- [ ] Disconnect → Works

#### Validation Tests:
- [ ] Try submitting `https://jup.ag` → Should be REJECTED with error
- [ ] Try submitting `https://google.com` → Should be REJECTED
- [ ] Try submitting a real action URL → Should be ACCEPTED

#### Action Tests:
- [ ] Navigate to a Blink detail page
- [ ] Click action button → Transaction preview modal appears
- [ ] Approve transaction → Wallet prompts for signature
- [ ] After signing → Success modal appears
- [ ] Click "View on Solscan" → Opens explorer

#### UI Tests:
- [ ] Homepage loads
- [ ] Blink cards display correctly
- [ ] Search works
- [ ] Category filter works
- [ ] Mobile responsive (resize browser)

---

## 🚨 COMMON BUILD ERRORS & FIXES

### Error: "Interface fragment hanging outside component"
**Fix:** Use `BlinkActionPreview-CLEAN.tsx` instead of `-UPDATED.tsx`

### Error: "Cannot find module 'WalletProvider'"
**Fix:** Make sure file is `app/components/WalletProvider.tsx` (not in subdirectory)

### Error: "useWallet must be used within WalletProvider"
**Fix:** Check that `app/layout.tsx` wraps children with `<WalletProvider>`

### Error: "Module not found: Can't resolve './WalletButton'"
**Fix:** Check `app/components/Header.tsx` has correct import path

### Error: TypeScript errors about wallet types
**Fix:** Make sure you're using `WalletProvider-MULTIWALLET.tsx` (has walletType)

---

## ✅ DEPLOYMENT READY CHECKLIST

Before pushing to production:

- [ ] `npm run build` succeeds with 0 errors
- [ ] `npm run dev` works locally
- [ ] All wallet types connect successfully
- [ ] Validation rejects fake submissions
- [ ] Actions execute transactions
- [ ] Database has only real Blinks
- [ ] Supabase shows 0 security warnings
- [ ] Mobile tested (responsive design works)
- [ ] All environment variables set in production
- [ ] `.env.local` has correct Supabase keys

---

## 🔑 ENVIRONMENT VARIABLES NEEDED

Make sure these are set in production:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

---

## 📊 POST-DEPLOYMENT VERIFICATION

After deploying:

1. **Check Supabase:**
   - [ ] RLS still enabled
   - [ ] Policies working
   - [ ] No security alerts

2. **Check App:**
   - [ ] Wallets connect
   - [ ] Actions work
   - [ ] No console errors

3. **Check Real Blinks:**
   - [ ] Run seed script if needed
   - [ ] Verify Blinks work
   - [ ] Test a few actions

---

## 🆘 IF BUILD STILL FAILS

1. Check exact error message
2. Look for the file name in error
3. Make sure you used the CLEAN version of BlinkActionPreview
4. Verify all imports are correct
5. Check for missing files
6. Run `npm install` again
7. Delete `.next` folder and rebuild

---

## 📞 HANDOFF TO DEVELOPER

Tell your developer:

"I've updated 6 critical files and run the SQL scripts. The build was failing because BlinkActionPreview-UPDATED.tsx had duplicate code at the end. Use BlinkActionPreview-CLEAN.tsx instead. All other files are verified clean. Run `npm run build` to test - it should work now."

Give them:
- This checklist
- All the CLEAN files
- The SQL scripts (already run in Supabase)

---

Ready to deploy! 🚀
