# dadHealth co-parenting fix - TODO

## RLS + API unblock
- [x] Update Supabase RLS policy for `co_parenting_schedules` so co-parents can `select` their linked shared schedules (fixes 403).
- [x] Update RLS policy for `co_parenting_events` similarly.



## Testing (bash + curl)
- [ ] Run bash `curl` tests for:
  - [ ] `POST /api/co-parenting/invite`
  - [ ] `POST /api/co-parenting/accept`
  - [ ] PostgREST `POST .../rest/v1/co_parenting_schedules?select=...` using co-parent JWT.

## If invite still returns 500
- [ ] Capture JSON error and trace whether it’s from:
  - [ ] missing `CO_PARENT_INVITE_SECRET`
  - [ ] `sendEmail`/Resend failure
  - [ ] DB insert/select failure


