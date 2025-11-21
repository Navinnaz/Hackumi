# Hackathon Team Participation System - Setup Guide

## Overview
This guide provides step-by-step instructions to set up the complete team-based hackathon participation system, including Supabase database tables, RLS policies, and the application features.

## Part 1: Supabase Database Setup

### Step 1: Run the SQL Setup Script

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Open the **SQL Editor**
4. Click **New Query**
5. Copy and paste the entire contents of `docs/supabase-policies.sql`
6. Click **Run**

**What this creates:**
- ✅ **hackathons** table (updated with `participation_type` and `max_team_size` fields)
- ✅ **teams** table for team creation and management
- ✅ **team_members** table to track team membership
- ✅ **hackathon_registrations** table to track user and team participation

**What this configures:**
- ✅ Row Level Security (RLS) policies for all tables
- ✅ Public can view all hackathons and registrations
- ✅ Authenticated users can manage their own teams
- ✅ Team creators can manage team members
- ✅ Individual and team-based registrations with constraints

### Step 2: Verify Table Creation

After running the SQL, verify all tables are created:

1. In Supabase, go to **Table Editor**
2. You should see these tables:
   - `public.hackathons`
   - `public.teams`
   - `public.team_members`
   - `public.hackathon_registrations`
   - `public.profiles` (already existed)

---

## Part 2: Frontend Features

### New Files Created

1. **`src/lib/teams.ts`** - Team management helpers
   - `fetchUserTeams()` - Get all teams for a user
   - `getTeamById()` - Get specific team with members
   - `createTeam()` - Create new team
   - `updateTeam()` - Update team name/description
   - `deleteTeam()` - Delete team
   - `addTeamMember()` - Add member to team
   - `removeTeamMember()` - Remove member from team
   - `getTeamMembers()` - Get all team members
   - `isTeamMember()` - Check if user is member
   - `fetchCreatedTeams()` - Get teams user created

2. **Updated `src/lib/hackathons.ts`** - Added registration functions
   - `registerUserForHackathon()` - Register individual user
   - `registerTeamForHackathon()` - Register entire team
   - `isUserRegistered()` - Check user registration status
   - `isTeamRegistered()` - Check team registration status
   - `getHackathonRegistrations()` - Get all registrations for hackathon
   - `unregisterUserFromHackathon()` - Remove user registration

3. **Updated `src/pages/CreateHackathon.tsx`**
   - Added "Participation Type" radio button group
   - Individual vs Team participation options
   - Conditional "Max Team Size" field (appears only for team participation)
   - Field constraints: Max team size between 2-5 participants

4. **Updated `src/pages/EditHackathon.tsx`**
   - Same participation type fields as CreateHackathon
   - Allows editing existing participation settings
   - Maintains team size constraints

5. **Updated `src/components/HackathonCard.tsx`**
   - "Participate!" button for guest users
   - Participation type badge (Individual/Team with max size)
   - Smart registration flow:
     - **Individual Hackathon:** Direct registration with one click
     - **Team Hackathon:** Shows dropdown to select which team to register
   - "Unregister" button for registered users
   - Real-time registration status checking

---

## Part 3: How the Feature Works

### For Hackathon Creators

1. **Create a Hackathon:**
   - Go to Create Hackathon page
   - Select "Individual Participation" OR "Team Participation"
   - If Team: Set max team size (2-5 people)
   - Submit form

2. **Edit Hackathon:**
   - Can change participation type anytime
   - Can adjust max team size

### For Individual Hackers (Individual Participation)

1. **Browse Hackathons:**
   - Go to "View Hackathons" or "Explore" page
   - See all available hackathons with participation type badges

2. **Register:**
   - Click "Participate!" button on any Individual hackathon
   - Instantly registered
   - Button changes to "Unregister"

### For Team Hackers (Team Participation)

1. **Create a Team First (IMPORTANT):**
   - Go to "Manage Teams" page
   - Click "Create Team"
   - Give team a name and optional description
   - Team is created with you as the creator

2. **Add Team Members (Optional):**
   - In Manage Teams, find your team
   - Click "Invite" button
   - Enter email of person to invite
   - Invitation sent via email

3. **Register Team for Hackathon:**
   - Browse hackathons with Team Participation badge
   - Click "Participate!" button
   - **Team Selection popup appears** showing all your created teams
   - Click the team to register
   - **Entire team is automatically enrolled** in the hackathon

4. **Unregister:**
   - If registered, click "Unregister"
   - Removes entire team from hackathon

---

## Part 4: Database Schema Reference

### hackathons Table
```
- id (UUID, Primary Key)
- title (Text, Required)
- description (Text)
- start_date (Timestamp)
- end_date (Timestamp)
- location (Text)
- prize (Text)
- image_url (Text)
- participation_type (Text: 'Individual' or 'Team', Default: 'Individual')
- max_team_size (Integer: 1-5, Default: 1)
- created_by (UUID, References auth.users)
- created_at (Timestamp, Auto)
```

### teams Table
```
- id (UUID, Primary Key)
- name (Text, Required)
- description (Text)
- created_by (UUID, References auth.users)
- created_at (Timestamp, Auto)
```

### team_members Table
```
- id (UUID, Primary Key)
- team_id (UUID, References teams, Cascade on Delete)
- user_id (UUID, References auth.users)
- joined_at (Timestamp, Auto)
- UNIQUE: (team_id, user_id)
```

### hackathon_registrations Table
```
- id (UUID, Primary Key)
- hackathon_id (UUID, References hackathons, Cascade on Delete)
- user_id (UUID, References auth.users) - NULL for team registrations
- team_id (UUID, References teams) - NULL for individual registrations
- registered_at (Timestamp, Auto)
- UNIQUE: (hackathon_id, user_id)
- UNIQUE: (hackathon_id, team_id)
- CONSTRAINT: Either user_id or team_id must be set (not both)
```

---

## Part 5: Testing the Features

### Test Individual Participation
1. Create a hackathon with "Individual Participation"
2. Sign in with a different account
3. Go to hackathons list
4. Click "Participate!" on the hackathon
5. Verify button changes to "Unregister"
6. Query `hackathon_registrations` table - should have a row with `user_id` set

### Test Team Participation
1. Create a hackathon with "Team Participation" (e.g., max 3)
2. Sign in with a different account
3. Go to "Manage Teams"
4. Create a new team
5. Go back to hackathons
6. Click "Participate!" on the team hackathon
7. Select team from dropdown
8. Verify team is registered
9. Query `hackathon_registrations` table - should have row with `team_id` set

### Test Team Registration with Multiple Members
1. In team you created, click "Invite"
2. Send invitation to another user's email
3. Other user checks their email
4. Other user clicks link and accepts invitation
5. Back in your team, you see member added
6. When you register team for hackathon, that member is also enrolled

---

## Part 6: TypeScript Types

### Hackathon Type (Updated)
```typescript
export interface Hackathon {
  id?: string;
  title: string;
  description?: string;
  start_date?: string | null;
  end_date?: string | null;
  location?: string;
  prize?: string;
  image_url?: string;
  participation_type?: "Individual" | "Team";
  max_team_size?: number; // 1 for individual, 2-5 for team
  created_by?: string;
  created_at?: string;
}
```

### Team Type
```typescript
export interface Team {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at?: string;
  members?: TeamMember[];
}
```

### Registration Type
```typescript
export interface Registration {
  id?: string;
  hackathon_id: string;
  user_id?: string | null;  // Set for individual registration
  team_id?: string | null;  // Set for team registration
  registered_at?: string;
}
```

---

## Part 7: RLS Security Model

### hackathons Table
- **SELECT:** Public (everyone can view)
- **INSERT:** Only creator (created_by = auth.uid())
- **UPDATE:** Only creator
- **DELETE:** Only creator

### teams Table
- **SELECT:** Team creator OR team member
- **INSERT:** Any authenticated user (creates own team)
- **UPDATE:** Team creator only
- **DELETE:** Team creator only

### team_members Table
- **SELECT:** Team creator, team members, or the user themselves
- **INSERT:** Team creator only (to invite members)
- **DELETE:** Team creator OR user themselves (can leave team)

### hackathon_registrations Table
- **SELECT:** Public (view all registrations)
- **INSERT:** Authenticated users only (can register self or their team)
- **DELETE:** User or team creator (can unregister)

---

## Part 8: API Helper Functions Summary

### hackathons.ts
```typescript
// Existing (unchanged)
fetchHackathons()
fetchRecentHackathons(limit)
fetchHackathonsByUser(userId)
getHackathonById(id)
createHackathon(payload)
updateHackathon(payload)
deleteHackathon(id)

// New Registration Functions
registerUserForHackathon(hackathonId, userId)
registerTeamForHackathon(hackathonId, teamId)
isUserRegistered(hackathonId, userId)
isTeamRegistered(hackathonId, teamId)
getHackathonRegistrations(hackathonId)
unregisterUserFromHackathon(hackathonId, userId)
```

### teams.ts (New)
```typescript
fetchUserTeams(userId)              // Get all teams for user
getTeamById(teamId)                 // Get specific team with members
createTeam(name, description, userId)
updateTeam(teamId, updates)
deleteTeam(teamId)
addTeamMember(teamId, userId)       // Team creator invites member
removeTeamMember(teamId, userId)
getTeamMembers(teamId)
isTeamMember(teamId, userId)
fetchCreatedTeams(userId)           // Only teams user created
```

---

## Part 9: UI/UX Flow Diagram

```
User browses hackathons (HackathonsList.tsx or Landing.tsx)
    ↓
Sees HackathonCard with:
  - Title, description, dates
  - Participation Type Badge (Individual/Team)
  - "Participate!" button (if not creator & not registered)
    ↓
IF Individual Participation:
  - Click "Participate!" → Instant registration
  - Button changes to "Unregister"
    ↓
IF Team Participation:
  - Click "Participate!" → Checks for created teams
  - If no teams: Error message "Create a team first"
  - If teams exist: Shows dropdown of user's teams
  - Select team → Entire team registered
  - Button changes to "Unregister"
```

---

## Part 10: Common Issues & Troubleshooting

### Issue: "You haven't created any teams yet"
**Solution:** User must go to "Manage Teams" and create a team before registering for team-based hackathons.

### Issue: "Already registered for this hackathon"
**Solution:** User is already registered. They must unregister first.

### Issue: RLS policy errors
**Solution:** Ensure all tables have RLS enabled and policies are created correctly. Re-run the SQL script to verify.

### Issue: Other user's email not showing up for invitation
**Solution:** The user must already have a Supabase auth account. Check if their email is registered in Supabase.

### Issue: Can't see team members after invitation
**Solution:** The invited user must click the confirmation link in their email first.

---

## Next Steps

1. ✅ Run the SQL script in Supabase
2. ✅ Verify all tables are created
3. ✅ Test individual participation flow
4. ✅ Test team creation in Manage Teams
5. ✅ Test team registration flow
6. ✅ Run `npm run dev` and test in browser

All code is already implemented and ready to use!
