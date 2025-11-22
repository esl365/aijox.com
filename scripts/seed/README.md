# Modular Database Seeding

This directory contains the refactored, modular seed script system for the Global Educator Nexus platform.

## Overview

The seed system has been refactored from a single 731-line monolithic file into a modular, maintainable architecture with:

- **Environment safety checks** - Prevents accidental seeding in production
- **Deduplication logic** - Prevents duplicate data on re-runs
- **Separation of concerns** - Static data separated from test data
- **Comprehensive logging** - Clear feedback during seeding process
- **Error handling** - Graceful failure with detailed error messages

## File Structure

```
scripts/seed/
├── index.ts          # Main orchestrator - entry point
├── utils.ts          # Shared utilities (hashing, logging, deduplication)
├── test-users.ts     # Test user accounts (schools, teachers, recruiters)
├── sample-jobs.ts    # Sample job postings
└── README.md         # This file
```

## Usage

### Basic Usage

```bash
# Run the new modular seed script
npm run db:seed:new

# Or use the legacy seed script
npm run db:seed
```

### Environment Variables

Control seeding behavior with environment variables:

```bash
# Force seeding even in production (DANGEROUS!)
FORCE_SEED=true npm run db:seed:new

# Allow test data in production
ALLOW_TEST_DATA=true npm run db:seed:new

# Check environment
NODE_ENV=production npm run db:seed:new  # Will be blocked unless FORCE_SEED=true
```

## Features

### 1. Environment Safety

The seed script checks the environment before running:

- **Development/Test**: Seeding allowed by default
- **Production**: Seeding blocked unless `FORCE_SEED=true`
- Clear warnings when running in production

### 2. Deduplication

All seed functions check for existing data before creating:

- Users checked by email
- Schools checked by name
- Jobs checked by title + school ID

This means you can run the seed script multiple times safely.

### 3. Detailed Logging

Every operation is logged with clear status indicators:

- ✓ Success messages
- ⚠️ Warnings (skipped items)
- ❌ Errors
- ℹ️ Information
- Summary statistics at the end

### 4. Modular Architecture

#### `utils.ts`
- Password hashing helpers
- Environment configuration
- Deduplication checkers
- Logging utilities
- Summary tracker
- Database cleanup helpers

#### `test-users.ts`
- School data and seeding function
- Recruiter data and seeding function
- Teacher data and seeding function
- All with deduplication logic

#### `sample-jobs.ts`
- Job posting templates by school
- Job seeding function with deduplication

#### `index.ts`
- Main orchestrator
- Environment checks
- Calls seed functions in correct order
- Final statistics and summary

## Test Data

### Schools (8 total)
- Seoul International Academy
- Dubai English Speaking School
- Shanghai American School
- Bangkok British School
- Tokyo International School
- Singapore International Academy
- Hanoi International School
- Kuala Lumpur International School

Password: `School123!@#`

### Teachers (8 total)
- john.smith@email.com
- sarah.johnson@email.com
- david.wong@email.com
- emma.brown@email.com
- michael.chen@email.com
- lisa.garcia@email.com
- robert.anderson@email.com
- maria.rodriguez@email.com

Password: `Teacher123!@#`

### Recruiters (2 total)
- contact@globalteachrecruit.com
- info@asiaedupartners.com

Password: `Recruiter123!@#`

### Admin
- admin@aijobx.com

Password: `Admin123!@#`

### Job Postings (15 total)
Various positions across all schools, including:
- ESL Teacher
- Mathematics Teacher
- Science Teacher
- Primary School Teacher
- And more...

## Database Cleanup

The `utils.ts` file includes cleanup helpers:

```typescript
import { cleanup } from './utils';

// Delete test data only
await cleanup.deleteTestData();

// Delete ALL data (use with extreme caution!)
await cleanup.deleteAllData();
```

## Migration from Legacy Seed

The old seed script (`scripts/seed-dummy-data.ts`) is preserved for backward compatibility.

**Advantages of new modular system:**

1. Maintainability - Smaller, focused files
2. Testability - Each module can be tested independently
3. Safety - Environment checks prevent production accidents
4. Deduplication - Safe to run multiple times
5. Clarity - Better logging and error messages
6. Extensibility - Easy to add new data types

## Future Enhancements

Potential improvements for future phases:

- [ ] Add static reference data (countries, subjects, etc.)
- [ ] Add seeding for applications and messages
- [ ] Create CLI with interactive prompts
- [ ] Add data validation before seeding
- [ ] Support selective seeding (e.g., only schools)
- [ ] Add progress bars for long operations
- [ ] Export seed data to JSON for version control

## Development

To add new seed data:

1. Create or update data constants in appropriate file
2. Implement deduplication checks
3. Add seeding function with proper logging
4. Call function in `index.ts` in correct order
5. Update this README

## Troubleshooting

### "Seeding blocked in production"
Set `ALLOW_TEST_DATA=true` or `FORCE_SEED=true` environment variable.

### Duplicate key errors
The script should handle duplicates automatically. If you see this error, the deduplication logic may need updating.

### Foreign key constraint errors
Ensure seed functions are called in the correct order in `index.ts`:
1. Schools (independent)
2. Recruiters (independent)
3. Teachers (independent)
4. Jobs (depends on schools)

## Related Files

- `prisma/seed.ts` - Legacy monolithic seed script
- `scripts/create-admin.ts` - Admin user creation script
- `scripts/list-users.ts` - User listing utility
- `scripts/check-profiles.ts` - Profile verification utility

---

**Last Updated:** 2025-01-22
**Part of:** Phase 0, Week 1 - Data Integrity & Cleanup
