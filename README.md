# </> Hackumi

A **modern, full-stack-ready web application** built using **React, TypeScript, and Vite** to manage and organize hackathons efficiently.  
It features a clean UI built with **TailwindCSS** and **shadcn/ui**, ensuring scalability, responsiveness, and ease of customization.

---

## 🚀 Features

- 🔐 Authentication pages — Sign In / Sign Up  
- 🏁 Landing page with hero sections and feature highlights  
- 🏆 Hackathon creation, editing, and management
- 👥 Team-based participation system (ETHGlobal style)
- 🤝 Team management with member invitations
- ⚙️ Modular, reusable components with shadcn/ui integration  
- 🎨 Neo-brutalist theme powered by TailwindCSS  
- 📊 Prebuilt UI utilities (charts, accordions, modals, etc.)  
- ⚡ Lightning-fast development with Vite + React Query  

---

## 📚 Documentation

Start here for the **Team Participation Feature**:

| Document | Purpose |
|----------|---------|
| **[docs/README.md](./docs/README.md)** | Overview & quick start |
| **[docs/QUICK_START.md](./docs/QUICK_START.md)** | 5-minute setup checklist |
| **[docs/TEAM_PARTICIPATION_SETUP.md](./docs/TEAM_PARTICIPATION_SETUP.md)** | Complete setup guide (10 sections) |
| **[docs/EXAMPLES.md](./docs/EXAMPLES.md)** | Code examples & real scenarios |
| **[docs/IMPLEMENTATION_SUMMARY.md](./docs/IMPLEMENTATION_SUMMARY.md)** | Feature summary |

### Quick Links
- 🔧 [Backend Setup Guide](./docs/TEAM_PARTICIPATION_SETUP.md)
- 💻 [Code Examples](./docs/EXAMPLES.md)
- ✅ [Setup Checklist](./docs/QUICK_START.md)

| Category        | Technology |
|-----------------|-----------|
| Frontend Framework | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Bundler         | [Vite](https://vitejs.dev/) |
| Styling         | [TailwindCSS](https://tailwindcss.com/) + [PostCSS](https://postcss.org/) |
| UI Components   | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Icons           | [Lucide React](https://lucide.dev/) |
| State & Data    | [TanStack Query](https://tanstack.com/query/latest) |
| Backend         | [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS) |
| Charts          | [Recharts](https://recharts.org/en-US/) |

---

## 🗂️ Project Structure

```bash
.
├── README.md
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── public/
│   └── robots.txt
├── docs/                      ← Documentation
│   ├── README.md
│   ├── QUICK_START.md
│   ├── TEAM_PARTICIPATION_SETUP.md
│   ├── EXAMPLES.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   └── supabase-policies.sql  ← Database setup
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── supabaseClient.ts       ← Supabase config
    ├── components/
    │   ├── Navbar.tsx
    │   ├── HackathonCard.tsx   ← Hackathon display + registration
    │   ├── FeatureCard.tsx
    │   └── ui/                 ← Shadcn-based UI library
    ├── contexts/
    │   └── authContext.tsx     ← Auth provider
    ├── hooks/
    │   ├── use-auth.ts
    │   ├── use-mobile.tsx
    │   └── use-toast.ts
    ├── lib/
    │   ├── hackathons.ts       ← Hackathon CRUD + registration
    │   ├── teams.ts            ← Team management
    │   └── utils.ts
    └── pages/
        ├── Landing.tsx
        ├── SignIn.tsx
        ├── SignUp.tsx
        ├── ProfilePage.tsx
        ├── CreateHackathon.tsx  ← New: Create hackathons
        ├── EditHackathon.tsx    ← New: Edit hackathons
        ├── HackathonsList.tsx   ← List all hackathons
        ├── ManageTeams.tsx      ← Team management
        └── NotFound.tsx
```

## ⚙️ Setup & Installation
1️⃣ Clone the repository
```git clone https://github.com/navinnaz/hackathon-management-system.git```
```cd hackathon-management-system```

2️⃣ Install dependencies
```npm install```

3️⃣ Set up Supabase
- Create a [Supabase](https://supabase.com/) project
- Run the SQL script: `docs/supabase-policies.sql` in your Supabase SQL editor
- Copy your Supabase URL and Key to environment variables

4️⃣ Run development server
```npm run dev```

App runs at 👉 http://localhost:8080

5️⃣ Build for production
```npm run build```

## 🧩 Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint checks |

## 🎨 Design System

**Font:** Inter, Space Grotesk  
**Theme:** Neo-brutalism (flat colors, bold borders, strong contrasts)

**Colors:**
- Navy: `#11224E`
- Orange: `#F87B1B`
- Green: `#CBD99B`
- Off-White: `#EEEEEE`

## 💡 Developer Notes

- Uses `@/` aliases for cleaner imports
- UI logic follows modular and reusable patterns
- Hooks like `use-toast` and `use-mobile` provide interactivity
- Each UI element in `src/components/ui` is isolated and theme-aware
- Supabase RLS policies enforce security at database level
- Team registration auto-enrolls all team members (ETHGlobal style)
