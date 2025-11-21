# Quick Setup Checklist

## Immediate Next Steps (Do These First!)

### 1. Run Supabase SQL Setup (5 minutes)
- [ ] Open Supabase Dashboard → Your Project
- [ ] Go to SQL Editor → New Query
- [ ] Copy entire contents of `docs/supabase-policies.sql`
- [ ] Paste and click Run
- [ ] Verify in Table Editor that all 4 tables are created:
  - [ ] hackathons (with new fields: participation_type, max_team_size)
  - [ ] teams
  - [ ] team_members
  - [ ] hackathon_registrations

### 2. Test the Backend
- [ ] Run `npm run dev` in terminal
- [ ] Sign in to your app
- [ ] Go to Create Hackathon
- [ ] Notice new "Participation Type" radio button group
- [ ] Try creating an Individual hackathon
- [ ] Try creating a Team hackathon (should ask for max team size)

### 3. Test Individual Participation
- [ ] Create account 2 (different email)
- [ ] Sign in as account 2
- [ ] Go to Hackathons list
- [ ] Click "Participate!" on Individual hackathon
- [ ] Verify button changes to "Unregister"
- [ ] In Supabase, check hackathon_registrations table for new row

### 4. Test Team Participation
- [ ] Go to Manage Teams
- [ ] Click "Create Team"
- [ ] Enter team name and description
- [ ] View team (should show you as creator)
- [ ] Go back to Hackathons
- [ ] Click "Participate!" on Team hackathon
- [ ] See dropdown of your teams
- [ ] Select your team to register
- [ ] Verify in Supabase: hackathon_registrations row has team_id set

### 5. Test Team Invitations (Optional)
- [ ] In Manage Teams, find your team
- [ ] Click "Invite"
- [ ] Enter email of another user
- [ ] That user checks their email for invitation
- [ ] Accept and verify they appear as team member

## File Structure Reference

### New Files Created
```
src/lib/teams.ts                    ← Team CRUD helpers
docs/TEAM_PARTICIPATION_SETUP.md    ← Full setup guide
docs/supabase-policies.sql          ← Updated with new tables
```

### Modified Files
```
src/lib/hackathons.ts               ← Added registration functions
src/pages/CreateHackathon.tsx       ← Added participation type field
src/pages/EditHackathon.tsx         ← Added participation type field
src/components/HackathonCard.tsx    ← Added Participate! button & logic
```

### No Changes Needed
```
src/pages/ManageTeams.tsx           ← Already implemented
src/pages/Landing.tsx               ← Works with new components
src/App.tsx                         ← Routes already set up
```

## Database Tables Summary

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| hackathons | Events management | title, participation_type, max_team_size, created_by |
| teams | Team creation | name, created_by |
| team_members | Team membership | team_id, user_id |
| hackathon_registrations | Participation tracking | hackathon_id, user_id (or team_id) |

## Key Component APIs

### Register Individual
```typescript
await registerUserForHackathon(hackathonId, userId);
```

### Register Team
```typescript
await registerTeamForHackathon(hackathonId, teamId);
```

### Check Registration
```typescript
const isReg = await isUserRegistered(hackathonId, userId);
```

### Create Team
```typescript
await createTeam("Team Name", "Description", userId);
```

### Fetch User Teams
```typescript
const teams = await fetchUserTeams(userId);
```

## Important Notes

⚠️ **Must Create Team Before Team Hackathon Registration**
- If hackathon is team-based, user must create a team in Manage Teams first
- When they click Participate!, they select which of their teams to register

⚠️ **Entire Team Gets Registered**
- When a user registers their team, all current members are enrolled
- This matches ETHGlobal's model

⚠️ **RLS Policies Prevent Unauthorized Access**
- Users can only see their own teams
- Only team creator can add/remove members
- Users can't register teams they don't own

## Troubleshooting

**Error: "You haven't created any teams yet"**
→ User needs to create a team in Manage Teams first

**Error: "Already registered for this hackathon"**
→ User/team already registered, must unregister first

**Team selection popup not appearing**
→ Check that user has created at least one team

**RLS Errors**
→ Re-run the SQL script to ensure all policies are created correctly

## Support Resources

- **Full Setup Guide:** `docs/TEAM_PARTICIPATION_SETUP.md`
- **Supabase Docs:** https://supabase.com/docs
- **TypeScript Interfaces:** Check `src/lib/teams.ts` and `src/lib/hackathons.ts`
