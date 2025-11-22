# OAuth Hardening Summary

**Date**: 2025-01-22
**Phase**: Phase 0, Week 2 - Auth Stabilization
**Task**: 2.3 - OAuth Hardening
**Status**: 🟡 **DOCUMENTATION COMPLETE** (Implementation Blocked - Requires OAuth Credentials)

---

## Overview

Task 2.3 focuses on hardening the authentication system by enabling Google and LinkedIn OAuth providers with proper account linking, security measures, and comprehensive error handling.

---

## Current Status

### Completed
✅ **Comprehensive OAuth Setup Guide Created**
- File: `docs/OAUTH_SETUP_GUIDE.md` (545 lines)
- Google OAuth setup instructions
- LinkedIn OAuth setup instructions
- NextAuth configuration guide
- Account linking strategy documentation
- Security considerations
- Testing scenarios
- Troubleshooting guide
- Production deployment checklist

### Blocked - Requires Manual Setup
🔴 **OAuth Credentials Not Yet Obtained**

Cannot proceed with implementation until OAuth credentials are obtained from:
1. **Google Cloud Console** → Client ID & Secret
2. **LinkedIn Developers** → Client ID & Secret

---

## Implementation Checklist

### Phase 1: Obtain OAuth Credentials (Manual - User Action Required)

#### Google OAuth
- [ ] Create Google Cloud project (or select existing)
- [ ] Configure OAuth consent screen
  - [ ] Set app name: "Global Educator Nexus"
  - [ ] Add scopes: `openid`, `email`, `profile`
  - [ ] Add test users (for development)
- [ ] Create OAuth 2.0 credentials
  - [ ] Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
  - [ ] Copy Client ID
  - [ ] Copy Client Secret
- [ ] Add to `.env.local`:
  ```env
  GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
  GOOGLE_CLIENT_SECRET="your-client-secret"
  ```

#### LinkedIn OAuth
- [ ] Create LinkedIn app at [LinkedIn Developers](https://www.linkedin.com/developers/apps)
- [ ] Request access to "Sign In with LinkedIn using OpenID Connect"
- [ ] Configure OAuth 2.0 settings
  - [ ] Set authorized redirect URI: `http://localhost:3000/api/auth/callback/linkedin`
  - [ ] Copy Client ID
  - [ ] Copy Client Secret
- [ ] Add to `.env.local`:
  ```env
  LINKEDIN_CLIENT_ID="your-linkedin-client-id"
  LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
  ```

### Phase 2: Enable OAuth in Code (After Credentials Obtained)

- [ ] Update `lib/auth.ts`:
  - [ ] Uncomment Google provider (lines 34-46)
  - [ ] Uncomment LinkedIn provider (lines 47-56)
  - [ ] Add PrismaAdapter import
  - [ ] Add adapter to NextAuth config
  - [ ] Change session strategy from 'jwt' to 'database'

**Required Changes to `lib/auth.ts`**:

```typescript
import { PrismaAdapter } from '@auth/prisma-adapter';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma), // ADD THIS
  session: {
    strategy: 'database', // CHANGE from 'jwt' to 'database'
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Google({ // UNCOMMENT
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    LinkedIn({ // UNCOMMENT
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

### Phase 3: Testing

- [ ] Start development server: `npm run dev`
- [ ] Test Scenario 1: New User (OAuth)
  - [ ] Click "Sign in with Google"
  - [ ] Verify redirect to `/select-role`
  - [ ] Select role (TEACHER/SCHOOL/RECRUITER)
  - [ ] Verify redirect to dashboard
- [ ] Test Scenario 2: Existing User (Email + OAuth)
  - [ ] Register with email/password
  - [ ] Sign out
  - [ ] Click "Sign in with Google" with same email
  - [ ] Verify automatic account linking
  - [ ] Verify can sign in with either method
- [ ] Test Scenario 3: Existing OAuth User Returns
  - [ ] Previously signed in with Google
  - [ ] Click "Sign in with Google" again
  - [ ] Verify immediate sign-in (no role selection)
- [ ] Repeat all scenarios for LinkedIn OAuth
- [ ] Check session: `http://localhost:3000/api/auth/session`

### Phase 4: Production Deployment

- [ ] Add OAuth credentials to Vercel environment variables
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `LINKEDIN_CLIENT_ID`
  - [ ] `LINKEDIN_CLIENT_SECRET`
- [ ] Update Google Cloud Console with production redirect URI:
  - [ ] `https://yourdomain.com/api/auth/callback/google`
- [ ] Update LinkedIn App with production redirect URI:
  - [ ] `https://yourdomain.com/api/auth/callback/linkedin`
- [ ] Deploy to production
- [ ] Test OAuth flow on live site
- [ ] Monitor error logs: `vercel logs`

---

## Technical Details

### Account Linking Strategy

**Email-Based Auto-Linking** (`allowDangerousEmailAccountLinking: true`)

**How it works**:
1. User signs up with email/password → User record created
2. User later clicks "Sign in with Google" with same email
3. NextAuth finds existing user by email
4. Creates OAuth account record linked to existing user
5. User can now sign in with either method

**Why it's safe**:
- ✅ Email normalization (lowercase, trimmed) - prevents duplicates
- ✅ Unique constraint on email in database schema
- ✅ OAuth provider emails are verified by Google/LinkedIn
- ✅ Email normalization logic in `lib/validations/auth.ts:16-20`

### Session Strategy Migration

**Current**: JWT Strategy
- Fast (no database lookup)
- Works with Credentials provider
- Stateless

**Required**: Database Strategy
- Can revoke sessions server-side
- Works with OAuth providers
- Required for PrismaAdapter

**Database Tables** (all already exist in `prisma/schema.prisma`):
- ✅ `User`
- ✅ `Account` (stores OAuth account links)
- ✅ `Session`
- ✅ `VerificationToken`

No migration needed - schema is already OAuth-ready.

### Security Considerations

**Email Verification**:
- OAuth providers (Google, LinkedIn): ✅ Emails verified by provider
- Credentials provider: ⚠️ Email verification not yet implemented (Future: Week 3)

**Account Hijacking Prevention**:
- ✅ Email normalization prevents case variations
- ✅ Unique constraint prevents duplicate emails
- ✅ `allowDangerousEmailAccountLinking` only links verified emails
- ⚠️ Limitation: If attacker registers with email/password first, they control the account
- 🔜 Recommendation: Implement email verification for credentials provider (Week 3)

**Session Security**:
- ✅ 30-day session max age
- ✅ Secure cookies (httpOnly, sameSite)
- ✅ CSRF protection
- 🔜 Future: Session revocation endpoint, active session management

---

## Error Handling

### OAuth Callback Errors

**Common Errors & Solutions**:

1. **Email already registered with different provider**
   - **Error**: `OAuthAccountNotLinked`
   - **Solution**: `allowDangerousEmailAccountLinking: true` (already configured)

2. **Missing OAuth credentials**
   - **Error**: `MISSING_CLIENT_ID` or `MISSING_CLIENT_SECRET`
   - **Solution**: Check `.env.local` has correct variables

3. **Invalid redirect URI**
   - **Error**: `redirect_uri_mismatch`
   - **Solution**: Update Google/LinkedIn console with exact URIs

4. **User cancels OAuth flow**
   - **Behavior**: Redirect to `/login` with error message
   - **Handling**: Show user-friendly error message

### Implementation in `lib/auth.ts`

OAuth sign-in callback already exists (lines 177-195):

```typescript
async signIn({ user, account, profile }) {
  // OAuth sign-in (Google/LinkedIn)
  if (account?.provider === 'google' || account?.provider === 'linkedin') {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    // User exists with email - auto-link account
    if (existingUser) {
      if (!existingUser.role) {
        return '/select-role'; // Redirect to role selection
      }
      return true; // Allow sign in
    }

    // New user - will redirect to role selection via pages.newUser
    return true;
  }

  // Credentials sign-in
  return true;
},
```

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

4. **Restart server**: `npm run dev`

---

## Related Files

### Documentation
- **OAuth Setup Guide**: `docs/OAUTH_SETUP_GUIDE.md` (545 lines)
- **API Implementation**: `docs/API_IMPLEMENTATION_SUMMARY.md`
- **Data Integrity**: `docs/DATA_INTEGRITY.md`

### Code Files
- **Auth Config**: `lib/auth.ts:22-56` (session strategy, OAuth providers)
- **Email Validation**: `lib/validations/auth.ts:16-20` (email normalization)
- **Database Schema**: `prisma/schema.prisma` (User, Account, Session tables)

### UI Files
- **Login Page**: `app/(auth)/login/page.tsx`
- **Signup Page**: `app/(auth)/signup/page.tsx`
- **Role Selection**: `app/(auth)/select-role/page.tsx`

### Environment
- **Current**: `.env.local` (15 lines - no OAuth credentials)
- **Template**: `.env.example:57-62` (OAuth placeholders)

---

## Why Implementation is Blocked

OAuth implementation requires external credentials that can only be obtained through manual user actions:

1. **Google Cloud Console** (requires Google account, project creation)
2. **LinkedIn Developers** (requires LinkedIn account, app creation)

These credentials cannot be auto-generated or obtained programmatically. The user must:
- Create accounts on these platforms
- Configure OAuth apps
- Obtain client IDs and secrets
- Add them to `.env.local`

**Estimated Time for Manual Setup**: 20-30 minutes (if user has Google/LinkedIn accounts)

---

## Next Steps

### Immediate (User Action Required)
1. Follow `docs/OAUTH_SETUP_GUIDE.md` to obtain OAuth credentials
2. Add credentials to `.env.local`
3. Notify when credentials are ready

### After Credentials Obtained
1. Uncomment OAuth providers in `lib/auth.ts`
2. Add PrismaAdapter
3. Change session strategy to 'database'
4. Test OAuth flow locally
5. Deploy to production
6. Mark Task 2.3 as completed

### Week 3 (Next Phase)
- Task 3.1: Unit Test Expansion (>90% utility coverage)
- Task 3.2: Integration Testing (Auth, Jobs, Applications)
- Task 3.3: UI Testing (Smoke tests)
- **Future**: Email verification for credentials provider

---

## Specification Compliance

OAuth functionality is not explicitly detailed in `specification/Specification.md` but is implied by:
- Multi-provider authentication support
- Account linking requirements
- Social login best practices

This implementation follows NextAuth v5 best practices and industry standards for OAuth 2.0.

---

## Conclusion

**Task 2.3 (OAuth Hardening)** is partially complete:

✅ **Documentation Phase Complete**
- Comprehensive OAuth setup guide created
- Implementation checklist defined
- Security considerations documented
- Testing scenarios defined
- Rollback plan documented

🔴 **Implementation Phase Blocked**
- Requires OAuth credentials from Google Cloud Console
- Requires OAuth credentials from LinkedIn Developers
- User must complete manual setup steps

**Estimated Remaining Work**: 1-2 hours (after credentials obtained)

**Status**: Ready for user to obtain OAuth credentials. Implementation can proceed immediately after credentials are added to `.env.local`.

---

**Last Updated**: 2025-01-22
**Task Owner**: Week 2 - Auth Stabilization

