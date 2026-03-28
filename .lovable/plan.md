

## Plan: Drop unused `suggestions` table

Everything you requested is already built and working. The only remaining artifact is the old `suggestions` database table that is no longer used by any code.

### Single step

**Drop the `suggestions` table** via a database migration:

```sql
DROP TABLE IF EXISTS public.suggestions;
```

This removes the last trace of the old suggestions system. No code changes are needed — all UI components, routes, and navigation already use Socials, Contact, simplified Donations, and email OTP authentication.

