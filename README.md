# UrbanNest

### Modern Property Marketplace built with the MERN Stack

UrbanNest is a full-stack property marketplace that connects **buyers, sellers, and administrators** through a role-based platform.

Buyers can discover properties, save favorites, and submit booking requests. Sellers can create and manage their listings and respond to booking requests. Administrators can monitor marketplace activity, manage listings, and oversee bookings.

---

## Overview

UrbanNest was built to simulate a real-world property marketplace with separate workflows for different user roles.

The application focuses on:

- Role-based authentication and authorization
- Property listing and management
- Search and filtering
- Favorites
- Booking requests
- Seller approval/rejection workflows
- Administrative marketplace management
- Responsive user interface
- RESTful backend APIs
- MongoDB-based data persistence

---

## Features

### Buyer

Buyers can:

- Register and log in
- Browse available properties
- Search properties
- Filter properties by:
  - City
  - Property type
  - Price range
  - Bedrooms
- View detailed property information
- Browse property images
- Add/remove properties from favorites
- Submit booking requests
- View their bookings
- Cancel eligible bookings
- View booking status and relevant reasons

---

### Seller

Sellers can:

- Register and log in as a seller
- Create property listings
- View their own properties
- Edit their listings
- Delete listings
- Activate/deactivate listings
- View incoming booking requests
- Approve booking requests
- Reject booking requests with a reason
- Monitor listing and booking statistics

---

### Admin

Administrators can:

- Access a dedicated admin dashboard
- Monitor marketplace properties
- View booking activity
- Approve or reject pending bookings
- Deactivate active property listings
- Monitor property and booking statistics
- Access the public marketplace

---

## Core Marketplace Flow

```text
                         UrbanNest
                             │
             ┌───────────────┼───────────────┐
             │               │               │
           Buyer           Seller           Admin
             │               │               │
             ▼               ▼               ▼
        Browse          Create Listing    Monitor
        Search          Manage Listing    Properties
        Filter          View Requests     Bookings
        Favorite        Approve/Reject    Manage Status
        Book
             │               │
             └───────┬───────┘
                     │
                     ▼
              Booking Workflow
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Pending    Approved   Rejected

Booking Workflow
A typical booking flow works like this:
Buyer selects property
        │
        ▼
Submits booking request
        │
        ▼
Booking created as "pending"
        │
        ▼
Seller reviews request
        │
        ├───────────────┐
        ▼               ▼
    Approve           Reject
        │               │
        ▼               ▼
   "approved"       "rejected"

   The booking system also stores:
- Property
- Buyer
- Seller
- Booking date
- Start date
- End date
- Amount
- Status
- Cancellation reason
- Rejection reason
- Creation/update timestamps
Tech Stack
Frontend
- React.js
- React Router
- Axios
- Tailwind CSS
- JavaScript (ES6+)
- HTML5
- CSS3
Backend
- Node.js
- Express.js
- REST APIs
- JWT authentication
- bcrypt password hashing
Database
- MongoDB
- Mongoose
Development & Deployment
- Git
- GitHub
- VS Code
- Postman
- Vercel
- Render
Architecture
UrbanNest follows a client-server architecture.
┌───────────────────────────────┐
│          React Client         │
│                               │
│  Pages / Components / Router  │
│  State / API Calls / UI       │
└───────────────┬───────────────┘
                │
                │ HTTP / REST API
                ▼
┌───────────────────────────────┐
│       Express.js Server       │
│                               │
│ Routes → Middleware →         │
│ Controllers → Models          │
└───────────────┬───────────────┘
                │
                │ Mongoose
                ▼
┌───────────────────────────────┐
│           MongoDB             │
│                               │
│ Users / Properties / Bookings │
└───────────────────────────────┘

Authentication & Authorization
UrbanNest uses JWT-based authentication.
Authentication Flow
User Login
    │
    ▼
Express Authentication API
    │
    ▼
Credentials Verified
    │
    ▼
JWT Generated
    │
    ▼
Token Stored on Client
    │
    ▼
Bearer Token Sent With Requests
    │
    ▼
Authentication Middleware
    │
    ▼
User Identified

Protected routes use the authenticated user's identity.
Role-based authorization then determines whether the user can access a particular operation.
Supported Roles
buyer
seller
admin

Examples:
Buyer
 ├── Browse properties
 ├── Favorites
 └── Bookings

Seller
 ├── Create properties
 ├── Manage own properties
 └── Manage booking requests

Admin
 ├── Monitor properties
 └── Manage marketplace bookings

Property Model
A property contains information such as:
title
description
propertyType
price
location
city
bedrooms
bathrooms
area
amenities
images
owner
status
timestamps

Property status can be:
active
inactive
sold

Booking Model
Bookings contain:
property
buyer
seller
bookingDate
startDate
endDate
amount
status
cancellationReason
rejectionReason
timestamps

Supported booking statuses:
pending
approved
rejected
cancelled
completed

API Overview
Authentication
POST /register
POST /login
GET  /logout

Properties
GET    /properties
GET    /properties/:propertyId
GET    /seller/properties
POST   /properties
PUT    /properties/:propertyId
DELETE /properties/:propertyId

Favorites
GET    /favorites
POST   /favorites/:propertyId
DELETE /favorites/:propertyId

Buyer Bookings
POST  /bookings
GET   /bookings/my
PATCH /bookings/:bookingId/cancel

Seller Bookings
GET   /seller/bookings
PATCH /seller/bookings/:bookingId/approve
PATCH /seller/bookings/:bookingId/reject

Admin Bookings
GET   /admin/bookings
PATCH /admin/bookings/:bookingId/status

Project Structure
UrbanNest/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── reducers/
│       ├── App.js
│       └── index.js
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── model/
│   ├── router/
│   ├── db/
│   └── server.js
│
├── .gitignore
├── README.md
└── package.json

Folder names may vary slightly depending on the current project structure.

Getting Started
Prerequisites
Make sure you have installed:
- Node.js
- npm
- MongoDB or a MongoDB Atlas database
- Git
Clone the Repository
git clone https://github.com/Tanmay0405/urbannest.git
cd urbannest

Backend Setup
Navigate to the server:
cd server

Install dependencies:
npm install

Create a .env file:
PORT=5000
MONGODB_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret

Start the backend:
npm start

The backend will run on the configured port.
Frontend Setup
Open another terminal:
cd client

Install dependencies:
npm install

Create the frontend environment file:
REACT_APP_SERVER_URL=http://localhost:5000

Start the React application:
npm start

The frontend will be available at:
http://localhost:3000

Environment Variables
Server
PORT=
MONGODB_URI=
SECRET_KEY=

Client
REACT_APP_SERVER_URL=

Never commit real credentials, database connection strings, or secrets to GitHub.
API Authentication
Protected API requests use the following header:
Authorization: Bearer <JWT_TOKEN>

The backend validates the token before allowing access to protected resources.
Role-based middleware then restricts access according to the authenticated user's role.
Security Considerations
UrbanNest includes several security-focused implementation decisions:
- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- Role-based authorization
- Seller ownership checks for property operations
- Buyer-only favorite operations
- Protected booking operations
- Admin-only administrative routes
- Server-side booking amount determination
- Authentication checks before sensitive operations
The backend remains the authority for authorization and business rules rather than relying solely on frontend restrictions.
Responsive Design
The frontend is designed to work across:
- Desktop
- Laptop
- Tablet
- Mobile
Dashboard layouts, property cards, booking interfaces, navigation, and marketplace sections adapt to smaller screen sizes.
Screenshots
Add project screenshots here after taking final screenshots of the application.
Recommended screenshots:
1. Home page
2. Property marketplace
3. Property details
4. Buyer dashboard
5. Seller dashboard
6. Admin dashboard
7. Booking flow
Example:
![UrbanNest Home](./screenshots/home.png)

![Property Marketplace](./screenshots/properties.png)

![Property Details](./screenshots/property-details.png)

![Buyer Dashboard](./screenshots/buyer-dashboard.png)

![Seller Dashboard](./screenshots/seller-dashboard.png)

![Admin Dashboard](./screenshots/admin-dashboard.png)

Testing
API testing can be performed using Postman.
Important scenarios include:
Authentication
- Valid registration
- Invalid registration
- Login
- Invalid credentials
- Protected route access
- Unauthorized role access
Properties
- Create property
- Update property
- Delete property
- View property
- Search properties
- Filter properties
- Seller ownership validation
Favorites
- Add favorite
- Remove favorite
- Retrieve favorites
- Buyer authorization
Bookings
- Create booking
- View buyer bookings
- Seller booking requests
- Approve booking
- Reject booking
- Cancel booking
- Invalid booking dates
- Booking overlap validation
Administration
- View marketplace bookings
- Update booking status
- Deactivate property
- Admin authorization
Design Approach
The UI was designed around a clean marketplace experience rather than an administrative CRUD interface.
Key design principles:
- Clear visual hierarchy
- Responsive layouts
- Consistent cards and status badges
- Strong primary actions
- Clear booking states
- Role-specific dashboards
- Property-focused visual presentation
- Mobile-friendly interactions
The interface uses a consistent UrbanNest visual identity across the application.
Future Improvements
Potential future improvements include:
- Advanced amenity filtering
- Property image upload/storage
- Map-based property search
- Seller analytics
- Buyer notifications
- Email notifications
- Reviews and ratings
- Payment integration
- Saved searches
- Advanced admin analytics
- Property verification workflow
- Production-grade automated testing
- CI/CD pipeline
Learning Outcomes
Building UrbanNest provided practical experience with:
- Full-stack JavaScript development
- React component architecture
- REST API development
- Express.js middleware
- JWT authentication
- Role-based authorization
- MongoDB and Mongoose
- CRUD operations
- API integration with Axios
- Protected frontend routes
- State management
- Responsive UI development
- Error handling
- Git and GitHub workflow
- Full-stack debugging
Author
Tanmay Awasthi
Computer Science & Engineering
NIET, Greater Noida
GitHub:
https://github.com/Tanmay0405
Project:
https://github.com/Tanmay0405/urbannest
License
This project was developed for learning, portfolio, and demonstration purposes.
<p align="center">
  <strong>UrbanNest</strong>
  <br />
  A modern property marketplace built with the MERN stack.
</p>
```
