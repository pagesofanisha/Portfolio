# Anisha Vanjinathan - Full-Stack Portfolio & Startup Hub

A Framer-inspired ("Folioblox" Creative Director theme) portfolio website and backend API crafted for **Anisha Vanjinathan**:
- 🎓 **2nd Year B.Tech CSBS** @ SRM IST Ramapuram
- 💼 **Freelance Full-Stack Engineer & UI/UX Designer**
- 🚀 **Aspiring EdTech Startup Founder (SkillPulse AI)**

Designed for seamless responsiveness across **Laptops, Tablets, and Mobile Phones**.

---

## 🔗 Backend API Links & Endpoints

The project includes a built-in Node.js / Express backend server:

| Endpoint | Method | Description | Link |
| :--- | :--- | :--- | :--- |
| **Health Check** | `GET` | Server status, uptime, and info | [`http://localhost:5000/api/health`](http://localhost:5000/api/health) |
| **View Inquiries** | `GET` | View all messages sent via the contact form | [`http://localhost:5000/api/contact/messages`](http://localhost:5000/api/contact/messages) |
| **View Waitlist** | `GET` | View all SkillPulse AI startup waitlist signups | [`http://localhost:5000/api/waitlist/subscribers`](http://localhost:5000/api/waitlist/subscribers) |
| **Profile Data** | `GET` | JSON representation of profile & projects | [`http://localhost:5000/api/profile`](http://localhost:5000/api/profile) |
| **Send Inquiry** | `POST` | Submit a new contact form message | `/api/contact` |
| **Join Waitlist** | `POST` | Add email to EdTech early access | `/api/waitlist` |

*Messages and waitlist signups are automatically persisted in `data/messages.json` and `data/waitlist.json`.*

---

## 🚀 How to Run

### Option A: Run Full-Stack (Frontend + Backend on port 5000)
```bash
npm start
```
Open **`http://localhost:5000`** in your browser. This serves both the website and the API together!

### Option B: Run Dev Server with Live Reload
1. In one terminal, start the backend:
   ```bash
   npm run server
   ```
2. In another terminal, start the Vite frontend (with mobile network preview):
   ```bash
   npm run dev
   ```
   Open **`http://localhost:5174`** on laptop or **`http://10.11.161.37:5174`** on your mobile phone!

---

## 🎨 How to Personalize

All profile data, projects, and services are centralized in **[`profile-config.js`](profile-config.js)**:
- **Email**: Update `email: "anisha.vanjinathan@example.com"` with your real email.
- **Socials**: Add your real LinkedIn, GitHub, and Twitter handles in `socials`.
- **Projects**: Add, edit, or reorder items in the `projects` array.
- **Services**: Customize your freelance offerings and pricing/deliverables.
- **EdTech Vision**: Update your stealth startup teaser details in `startupLab`.
