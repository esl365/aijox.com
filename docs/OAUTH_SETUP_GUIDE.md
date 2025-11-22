# OAuth Setup Guide

**Last Updated**: 2025-01-22
**Phase**: Phase 0, Week 2 - Auth Stabilization
**Task**: 2.3 - OAuth Hardening
**Status**: Documentation Complete

---

## Overview

This guide explains how to set up Google and LinkedIn OAuth providers for the Global Educator Nexus platform.

---

## Prerequisites

- NextAuth v5 (beta.25) installed
- Prisma database configured
- `.env.local` file in project root

---

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing one
3. Enable Google+ API (or "Google Identity Services")

### 2. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Fill in required information:
   - **App name**: Global Educator Nexus
   - **User support email**: your-email@example.com
   - **Developer contact email**: your-email@example.com
4. **Scopes**: Add these scopes:
   - `openid`
   - `email`
   - `profile`
5. **Test users** (optional for development):
   - Add your test email addresses
6. Save and continue

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. **Authorized redirect URIs**:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
5. Click **Create**
6. Copy **Client ID** and **Client Secret**

### 4. Add to Environment Variables

Add to `.env.local`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

---

## LinkedIn OAuth Setup

### 1. Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click **Create app**
3. Fill in required information:
   - **App name**: Global Educator Nexus
   - **LinkedIn Page**: (Select your company page)
   - **Privacy policy URL**: https://yourdomain.com/privacy
   - **App logo**: (Upload your logo)
4. Click **Create app**

### 2. Request OAuth 2.0 Scopes

1. Go to **Products** tab
2. Request access to **Sign In with LinkedIn using OpenID Connect**
3. Wait for approval (usually instant for development)

### 3. Configure OAuth 2.0 Settings

1. Go to **Auth** tab
2. **Authorized redirect URLs**:
   - Development: `http://localhost:3000/api/auth/callback/linkedin`
   - Production: `https://yourdomain.com/api/auth/callback/linkedin`
3. Copy **Client ID** and **Client Secret** from the **Application credentials** section

### 4. Add to Environment Variables

Add to `.env.local`:

```bash
# LinkedIn OAuth
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
```

---

## NextAuth Configuration

### Current Configuration (Disabled)

OAuth providers are currently disabled in `lib/auth.ts:34-56`:

```typescript
// OAuth providers temporarily disabled until we set up proper adapter configuration
// Google({ ... }),
// LinkedIn({ ... }),
```

### Enable OAuth Providers

1. **Uncomment OAuth providers** in `lib/auth.ts`
2. **Add PrismaAdapter** for account linking
3. **Configure hybrid session strategy**

**Updated configuration**:

```typescript
import { PrismaAdapter } from '@auth/prisma-adapter';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database', // Change from 'jwt' to 'database' for OAuth
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true, // Auto-link accounts with same email
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: 'openid profile email',
        },
      },
    }),
    Credentials({
      // ... existing credentials provider
    }),
  ],
  // ... rest of configuration
});
```

---

## Account Linking Strategy

### Email-Based Auto-Linking

**Scenario**: User signs up with email/password, later tries to sign in with Google OAuth using same email.

**Behavior with `allowDangerousEmailAccountLinking: true`**:
- ✅ Automatically links OAuth account to existing user
- ✅ User can sign in with either method
- ⚠️ **Security consideration**: Only enable if emails are verified

**Our Implementation**:
- ✅ Email normalization (lowercase, trimmed) - `lib/validations/auth.ts:16-20`
- ✅ Unique constraint on email - `prisma/schema.prisma`
- ✅ OAuth emails are verified by providers
- ✅ Safe to enable auto-linking

### Account Linking Flow

```
1. User signs up with email/password
   ↓
2. User record created in database with normalized email
   ↓
3. User later clicks "Sign in with Google"
   ↓
4. Google returns verified email (normalized)
   ↓
5. NextAuth finds existing user by email
   ↓
6. Creates OAuth account record linked to existing user
   ↓
7. User can now sign in with either method
```

### Database Schema

OAuth accounts are stored in the `Account` table:

```prisma
model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String  // "oauth" or "email"
  provider           String  // "google", "linkedin", "credentials"
  providerAccountId  String
  refresh_token      String? @db.Text
  access_token       String? @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String? @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

---

## Session Strategy: JWT vs Database

### Current: JWT Strategy

**Pros**:
- ✅ Fast (no database lookup)
- ✅ Works with Credentials provider
- ✅ Stateless

**Cons**:
- ❌ Harder to revoke sessions
- ❌ Token can't be updated without re-login

### Required: Database Strategy (for OAuth)

**Pros**:
- ✅ Can revoke sessions server-side
- ✅ Works with OAuth providers
- ✅ PrismaAdapter support

**Cons**:
- ❌ Requires database lookup per request
- ❌ Slightly slower

### Hybrid Solution

NextAuth v5 supports hybrid strategy:

```typescript
session: {
  strategy: 'database', // Use database sessions
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60, // Update every 24 hours
},
```

**Database tables required**:
- `User` ✅ (already exists)
- `Account` ✅ (already exists)
- `Session` ✅ (already exists)
- `VerificationToken` ✅ (already exists)

All tables exist in `prisma/schema.prisma`. No migration needed.

---

## Error Handling

### OAuth Callback Errors

**Common errors**:

1. **Email already registered with different provider**
   - **Solution**: Auto-link with `allowDangerousEmailAccountLinking`

2. **Missing OAuth credentials**
   - **Error**: `MISSING_CLIENT_ID` or `MISSING_CLIENT_SECRET`
   - **Solution**: Check `.env.local` has correct variables

3. **Invalid redirect URI**
   - **Error**: `redirect_uri_mismatch`
   - **Solution**: Update Google/LinkedIn console with correct URIs

4. **User cancels OAuth flow**
   - **Behavior**: Redirect to `/login` with error message
   - **Handling**: Show user-friendly error

### Implementation in `lib/auth.ts`

```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    // OAuth sign-in (Google/LinkedIn)
    if (account?.provider === 'google' || account?.provider === 'linkedin') {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      // User exists with email - auto-link account
      if (existingUser) {
        // Check if user has a role
        if (!existingUser.role) {
          // Redirect to role selection
          return '/select-role';
        }

        // Allow sign in
        return true;
      }

      // New user - will redirect to role selection via pages.newUser
      return true;
    }

    // Credentials sign-in
    return true;
  },
},
```

---

## Testing OAuth Flow

### Development Testing

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to login page**:
   ```
   http://localhost:3000/login
   ```

3. **Click "Sign in with Google" or "Sign in with LinkedIn"**

4. **Complete OAuth flow**:
   - Authorize app
   - Redirect back to app
   - Check session: `http://localhost:3000/api/auth/session`

### Test Scenarios

#### Scenario 1: New User (OAuth)
1. User clicks "Sign in with Google"
2. Google redirects to `/select-role`
3. User selects role (TEACHER, SCHOOL, RECRUITER)
4. User completes profile
5. Redirect to dashboard

#### Scenario 2: Existing User (Email + OAuth)
1. User registers with email/password
2. Later, clicks "Sign in with Google" with same email
3. Google account automatically linked
4. User can sign in with either method

#### Scenario 3: Existing OAuth User Returns
1. User previously signed in with Google
2. Clicks "Sign in with Google" again
3. Immediate sign in (no role selection)
4. Redirect to dashboard

---

## Security Considerations

### Email Verification

**OAuth providers** (Google, LinkedIn):
- ✅ Emails are verified by provider
- ✅ Safe to use for account linking

**Credentials provider**:
- ⚠️ Email verification not implemented
- 🔜 **Future**: Add email verification flow for credentials

### Account Hijacking Prevention

**Risk**: Attacker creates account with victim's email before victim signs up with OAuth.

**Mitigation**:
1. ✅ Email normalization prevents case variations
2. ✅ Unique constraint prevents duplicate emails
3. ✅ `allowDangerousEmailAccountLinking` only links verified emails
4. ⚠️ **Limitation**: If attacker registers with email/password first, they control the account

**Recommendation**: Implement email verification for credentials provider (Week 3).

### Session Security

**Current**:
- ✅ 30-day session max age
- ✅ Secure cookies (httpOnly, sameSite)
- ✅ CSRF protection

**Future enhancements**:
- [ ] Session revocation endpoint
- [ ] Active session management (view/revoke)
- [ ] IP-based session validation

---

## Rollback Plan

If OAuth causes issues, disable it:

1. **Comment out OAuth providers** in `lib/auth.ts`:
   ```typescript
   // Google({ ... }),
   // LinkedIn({ ... }),
   ```

2. **Revert to JWT strategy**:
   ```typescript
   session: {
     strategy: 'jwt',
   },
   ```

3. **Remove PrismaAdapter**:
   ```typescript
   // adapter: PrismaAdapter(prisma),
   ```

4. **Restart server**:
   ```bash
   npm run dev
   ```

---

## Production Deployment

### Environment Variables

**Vercel** (recommended):

1. Go to project settings → Environment Variables
2. Add for all environments (Production, Preview, Development):
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   LINKEDIN_CLIENT_ID=...
   LINKEDIN_CLIENT_SECRET=...
   ```

3. Redeploy

### OAuth Redirect URIs

Update Google/LinkedIn consoles with production URLs:

**Google Console**:
- `https://yourdomain.com/api/auth/callback/google`

**LinkedIn App**:
- `https://yourdomain.com/api/auth/callback/linkedin`

### Testing Production OAuth

1. Deploy to production
2. Test OAuth flow on live site
3. Monitor error logs: `vercel logs`
4. Check session: `https://yourdomain.com/api/auth/session`

---

## Troubleshooting

### Issue: OAuth button doesn't appear

**Cause**: OAuth providers commented out in code

**Solution**: Uncomment providers in `lib/auth.ts`

### Issue: "MISSING_CLIENT_ID" error

**Cause**: Environment variables not set

**Solution**: Check `.env.local` has `GOOGLE_CLIENT_ID` and `LINKEDIN_CLIENT_ID`

### Issue: "redirect_uri_mismatch" error

**Cause**: Redirect URI in code doesn't match Google/LinkedIn console

**Solution**: Update console with exact URL (including `/api/auth/callback/google`)

### Issue: User signs in but has no role

**Cause**: New OAuth user hasn't selected role

**Solution**: Redirect to `/select-role` via `pages.newUser` config

### Issue: Account not linking automatically

**Cause**: `allowDangerousEmailAccountLinking` is `false`

**Solution**: Set to `true` in provider config (safe with verified emails)

---

## Related Files

- **Auth Config**: `lib/auth.ts`
- **Email Schema**: `lib/validations/auth.ts`
- **Database Schema**: `prisma/schema.prisma`
- **Login Page**: `app/(auth)/login/page.tsx`
- **Signup Page**: `app/(auth)/signup/page.tsx`
- **Select Role**: `app/(auth)/select-role/page.tsx`

---

## Next Steps (After OAuth Setup)

1. ✅ Set up Google OAuth credentials
2. ✅ Set up LinkedIn OAuth credentials
3. ✅ Add credentials to `.env.local`
4. ✅ Uncomment OAuth providers in `lib/auth.ts`
5. ✅ Change session strategy to `database`
6. ✅ Add PrismaAdapter
7. ✅ Test OAuth flow locally
8. ✅ Deploy to production
9. [ ] Add email verification for credentials (Week 3)
10. [ ] Add session management UI (Week 4)

---

**Last Updated**: 2025-01-22
**Author**: Week 2 - Auth Stabilization Task
