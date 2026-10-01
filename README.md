<div align="center">

# 🏡 UrbanNest

### Modern Full-Stack Property Marketplace

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2D6?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io/)

A scalable, multi-role property rental and sales platform connecting **Buyers, Sellers, and Administrators** through granular RBAC, real-time booking flows, and dedicated dashboards.

[Explore Live Demo](https://bookit-lite.vercel.app) • [API Endpoint](https://bookit-backend-wbt1.onrender.com) • [Report Bug](https://github.com/Tanmay0405/urbannest/issues)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Core Workflows](#-core-workflows)
- [Tech Stack](#-tech-stack)
- [REST API Reference](#-rest-api-reference)
- [Data Models](#-data-models)
- [Local Development & Setup](#-local-development--setup)
- [Security Implementations](#-security-implementations)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Author & License](#-author--license)

---

## 🌟 Overview

**UrbanNest** simulates a production-grade digital real estate marketplace. It replaces generic administrative CRUD interfaces with role-tailored user experiences:

- **Buyers** search, filter, bookmark, and submit reservation requests for verified listings.
- **Sellers** maintain listings, toggle availability, track analytics, and moderate reservation requests.
- **Admins** oversee global platform health, audit pending bookings, and enforce listing compliance.

---

## 🏛 System Architecture

The application adopts a decoupled, stateless client-server architecture communicating via RESTful JSON APIs.

```text
┌─────────────────────────────────────────────────────────────┐
│                       React SPA Client                      │
│     (Tailwind CSS, React Router, Context API, Axios)        │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON Web Token (Bearer)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Express.js Engine                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Auth Middleware (JWT Verify) → RBAC Gatekeeper      │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              ▼                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Controllers (Business Logic, Amount Auditing)       │  │
│  └───────────────────────────┬───────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────┘
                               │ Mongoose ODM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     MongoDB Atlas Cluster                   │
│          Collections: Users | Properties | Bookings         │
└─────────────────────────────────────────────────────────────┘
```
