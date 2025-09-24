# 🚀 Full Stack Next.js Project

This is a full-stack web app built with **Next.js, React, TailwindCSS, Express, MongoDB, and Socket.io**.  
It includes frontend UI, backend APIs, authentication, and real-time features.


## 📦 Tech Stack
- **Frontend:** Next.js, React, TailwindCSS, Radix UI, Framer Motion, Recharts, Leaflet  
- **Backend:** Express.js, MongoDB (Mongoose), JWT, Bcrypt, Socket.io  
- **Utilities:** Axios, Zod, React Hook Form, Date-fns  
- **Dev Tools:** TypeScript, PostCSS, TailwindCSS plugins, Testing Library  
------------------------------------------------------------------------------------------------------------------------------

Environment variables:
Create a .env file in the root folder and add your secrets:

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

NEXT_PUBLIC_API_URL=http://localhost:3000/api or mongo atlas link

------------------------------------------------------------------------------------------------------------------------------
Project Structure
.
├── /pages          # Next.js pages (frontend + API routes)
├── /components     # React components
├── /styles         # Tailwind / global CSS
├── /lib            # Utilities (e.g. db, auth helpers)
├── /models         # Mongoose schemas
├── /server         # Express.js backend logic
└── package.json    # Dependencies
------------------------------------------------------------------------------------------------------------------------------
for running project:
1. in backend : npm run dev
2. in front end : npm start
