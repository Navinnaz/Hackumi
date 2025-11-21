# Team Participation Feature - Visual & Code Examples

## Feature Overview

### What's New?
1. **Participation Types:** Hackathons can now be "Individual" or "Team-based"
2. **Team Registration:** Entire teams auto-enroll when a team is registered
3. **Smart Registration:** UI automatically adapts based on participation type
4. **Team Management:** Create, invite, and manage teams

---

## User Flow Examples

### Example 1: Individual Hackathon Registration

```
Alice browses hackathons
      ↓
Sees "Web3 Bootcamp" (Individual Participation badge)
      ↓
Clicks "Participate!" button
      ↓
Instantly registered! Button changes to "Unregister"
      ↓
Alice is now a participant
```

**Data in Database:**
```
hackathon_registrations table:
┌────────────────────────────────────────┐
│ id | hackathon_id | user_id | team_id │
├────────────────────────────────────────┤
│ x1 | hack-123     | alice   | NULL    │
└────────────────────────────────────────┘
```

---

### Example 2: Team Hackathon Registration (ETHGlobal Style)

```
Bob wants to register for "AI Summit" (Team Participation: Max 3)
      ↓
Bob hasn't created a team yet → Error shown
      ↓
Bob goes to "Manage Teams" page
      ↓
Creates team "AI Legends" with himself as creator
      ↓
Back to hackathons → Clicks "Participate!" on "AI Summit"
      ↓
Dropdown shows "AI Legends"
      ↓
Clicks "AI Legends" → Team registered!
      ↓
All current team members (just Bob now) are enrolled
```

**Data in Database:**
```
teams table:
┌──────────────────────────────────────┐
│ id | name        | created_by        │
├──────────────────────────────────────┤
│ t1 | AI Legends  | bob               │
└──────────────────────────────────────┘

team_members table:
┌────────────────────────────────────┐
│ id | team_id | user_id | joined_at │
├────────────────────────────────────┤
│ m1 | t1      | bob     | 2024-... │
└────────────────────────────────────┘

hackathon_registrations table:
┌────────────────────────────────────────┐
│ id | hackathon_id | user_id | team_id  │
├────────────────────────────────────────┤
│ x2 | hack-456     | NULL    | t1       │
└────────────────────────────────────────┘
```

---

### Example 3: Team Member Gets Added Later

```
Bob's team "AI Legends" is registered for "AI Summit"
      ↓
Charlie gets invited to join "AI Legends"
      ↓
Charlie receives email invitation and accepts
      ↓
Charlie is now added to the team_members table
      ↓
Charlie is AUTOMATICALLY enrolled in "AI Summit" (because team is registered)
      ↓
No separate action needed!
```

---

## Code Examples

### Creating a Hackathon (Form Data)

```typescript
// CreateHackathon.tsx form submission
const formData = {
  title: "React Bootcamp 2025",
  description: "Learn React and build cool apps",
  start_date: "2025-03-01T09:00:00Z",
  end_date: "2025-03-03T17:00:00Z",
  location: "San Francisco, CA",
  prize: "$5000",
  participation_type: "Team",  // ← NEW FIELD
  max_team_size: 4,             // ← NEW FIELD (only for Team)
  created_by: "user-123",
  image_url: "https://..."
};

await createHackathon(formData);
```

### Registering a User (Individual)

```typescript
// HackathonCard.tsx - handleParticipate for individual
const handleParticipate = async () => {
  try {
    await registerUserForHackathon(hackathon.id, user.id);
    setIsRegistered(true);
    toast.success("Successfully registered!");
  } catch (err) {
    toast.error(err.message);
  }
};
```

### Registering a Team

```typescript
// HackathonCard.tsx - handleTeamRegister for team
const handleTeamRegister = async (teamId: string) => {
  try {
    await registerTeamForHackathon(hackathon.id, teamId);
    setIsRegistered(true);
    setShowTeamSelection(false);
    toast.success("Your team has been registered!");
  } catch (err) {
    toast.error(err.message);
  }
};
```

### Creating a Team

```typescript
// ManageTeams.tsx - handleCreate
const handleCreate = async () => {
  try {
    const newTeam = await createTeam(
      newName,      // "AI Legends"
      newDesc,      // "We love AI"
      user.id       // creator
    );
    setTeams(s => [newTeam, ...s]);
    toast.success("Team created!");
  } catch (err) {
    toast.error(err.message);
  }
};
```

### Inviting Team Members

```typescript
// ManageTeams.tsx - handleInvite
const handleInvite = async () => {
  try {
    // Send invitation (creates row in team_invitations)
    await supabase.from("team_invitations").insert({
      team_id: selectedTeamId,
      email: inviteEmail,
      invited_by: user.id,
    });
    toast.success("Invitation sent!");
  } catch (err) {
    toast.error("Failed to send invite");
  }
};
```

---

## UI Component Structure

### Hackathon Card with Participation Button

```tsx
<HackathonCard 
  hackathon={{
    id: "hack-123",
    title: "Web Summit",
    participation_type: "Team",
    max_team_size: 4,
    // ... other fields
  }}
  onRegistrationChange={() => { /* refresh */ }}
/>
```

**Renders:**
```
┌─────────────────────────────────────┐
│  [Image]                            │
├─────────────────────────────────────┤
│  Web Summit                         │
│  [Team Participation Max 4 badge]   │
│  Location: NYC                      │
│  Mar 1 - Mar 3, 2025                │
├─────────────────────────────────────┤
│  [Participate! Button]              │
└─────────────────────────────────────┘
```

After click (Team hackathon):
```
┌─────────────────────────────────────┐
│  Web Summit                         │
│  [Team Participation Max 4 badge]   │
├─────────────────────────────────────┤
│  Select a team to register:         │
│  [AI Legends]                       │
│  [Web Warriors]                     │
│  [Cancel]                           │
└─────────────────────────────────────┘
```

---

## Database Query Examples

### Find All Registrations for a Hackathon

```sql
SELECT * FROM hackathon_registrations
WHERE hackathon_id = 'hack-123';

-- Results:
-- Row 1: user_id = 'alice', team_id = NULL (individual)
-- Row 2: user_id = NULL, team_id = 't1' (team with members)
```

### Find Team Members for a Registered Team

```sql
SELECT 
  u.id,
  u.full_name,
  u.avatar_url
FROM team_members tm
JOIN auth.users u ON tm.user_id = u.id
WHERE tm.team_id = 't1';
```

### Check Who's Registered (Including Team Members)

```sql
-- Individual registrations
SELECT u.id, u.full_name, 'Individual' as type
FROM hackathon_registrations hr
JOIN auth.users u ON hr.user_id = u.id
WHERE hr.hackathon_id = 'hack-123'

UNION ALL

-- Team registrations (all team members)
SELECT u.id, u.full_name, 'Team: ' || t.name as type
FROM hackathon_registrations hr
JOIN teams t ON hr.team_id = t.id
JOIN team_members tm ON t.id = tm.team_id
JOIN auth.users u ON tm.user_id = u.id
WHERE hr.hackathon_id = 'hack-123';
```

---

## API Reference

### hackathons.ts - Registration Functions

```typescript
// Register individual user
await registerUserForHackathon(hackathonId: string, userId: string)
// Returns: Registration | null
// Throws: "Already registered for this hackathon"

// Register entire team
await registerTeamForHackathon(hackathonId: string, teamId: string)
// Returns: Registration | null
// Throws: "This team is already registered for this hackathon"

// Check if user registered
await isUserRegistered(hackathonId: string, userId: string)
// Returns: boolean

// Check if team registered
await isTeamRegistered(hackathonId: string, teamId: string)
// Returns: boolean

// Get all registrations for hackathon
await getHackathonRegistrations(hackathonId: string)
// Returns: Registration[]

// Unregister user
await unregisterUserFromHackathon(hackathonId: string, userId: string)
// Returns: boolean
```

### teams.ts - Team Management Functions

```typescript
// Get all teams for user
await fetchUserTeams(userId: string)
// Returns: Team[]

// Get teams created by user
await fetchCreatedTeams(userId: string)
// Returns: Team[] (only creator's teams, not member teams)

// Get specific team with members
await getTeamById(teamId: string)
// Returns: Team | null

// Create new team
await createTeam(name: string, description: string, createdBy: string)
// Returns: Team | null

// Update team
await updateTeam(teamId: string, updates: {name?, description?})
// Returns: Team | null

// Delete team
await deleteTeam(teamId: string)
// Returns: boolean

// Add member to team (invite)
await addTeamMember(teamId: string, userId: string)
// Returns: TeamMember | null
// Throws: "User is already a member of this team"

// Remove member from team
await removeTeamMember(teamId: string, userId: string)
// Returns: boolean

// Get team members
await getTeamMembers(teamId: string)
// Returns: TeamMember[]

// Check if user is team member
await isTeamMember(teamId: string, userId: string)
// Returns: boolean
```

---

## Validation & Constraints

### Team Size Validation
```typescript
// In CreateHackathon/EditHackathon form:
max_team_size must be:
- Between 2 and 5
- Only shown when participation_type = "Team"
- Cannot be 1 (that's individual participation)
```

### Registration Constraints
```sql
-- Can't register twice (UNIQUE constraints)
UNIQUE(hackathon_id, user_id)
UNIQUE(hackathon_id, team_id)

-- Must be either user OR team (CHECK constraint)
CHECK (
  (user_id IS NOT NULL AND team_id IS NULL)
  OR (user_id IS NULL AND team_id IS NOT NULL)
)
```

---

## Error Handling

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Please sign in to participate" | User not authenticated | Sign in first |
| "You haven't created any teams yet" | No teams for team hackathon | Create team in Manage Teams |
| "Already registered for this hackathon" | Duplicate registration | Unregister first |
| "This team is already registered" | Team duplicate registration | Different team or unregister |
| "User is already a member of this team" | Member already exists | Remove then re-add |
| RLS Policy Violation | Unauthorized access attempt | Check permissions and table policies |

---

## Real-World Scenario

### "ETHGlobal-Style" Team Registration

```
Scenario: Web3 Hackathon with max 4-person teams

1. Alice creates hackathon "ETH NYC 2025"
   - Participation Type: Team
   - Max Team Size: 4
   - Prize: $50,000

2. Bob browses hackathons
   - Sees "ETH NYC 2025" with Team badge (Max 4)
   - Clicks Participate!
   - Error: "You haven't created any teams yet"

3. Bob goes to Manage Teams
   - Creates team "Web3 Legends"
   - Invites Charlie and Dana

4. Charlie and Dana receive emails and accept

5. Now team has 3 members: Bob (creator), Charlie, Dana

6. Bob clicks Participate! on "ETH NYC 2025"
   - Selects "Web3 Legends"
   - Team registered!

7. All 3 members are automatically enrolled:
   - Bob ✓ (registered via team)
   - Charlie ✓ (registered via team)
   - Dana ✓ (registered via team)

8. Database has 1 entry in hackathon_registrations:
   - team_id = "t1" (Web3 Legends)
   - user_id = NULL

But hackathon organizer can see all 3 members via:
SELECT team_members.user_id FROM hackathon_registrations
JOIN team_members ON team_id
```

---

## Testing Checklist

- [ ] Create Individual hackathon and register
- [ ] Create Team hackathon and see max_team_size field
- [ ] Create a team in Manage Teams
- [ ] Register team for hackathon
- [ ] Invite person to team and see auto-enrollment
- [ ] Unregister from hackathon
- [ ] Edit hackathon to change participation type
- [ ] Check database tables for correct data
- [ ] Test error messages (no teams, already registered, etc.)
- [ ] Verify RLS permissions work correctly
