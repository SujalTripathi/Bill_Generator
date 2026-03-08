# SmartBill - AI-Powered Bill Generator

A complete MERN stack web application for generating professional, GST-compliant bills and invoices for Indian businesses.

## Features

- **AI-Powered Bill Generation** — Describe your bill in plain text (English or Hinglish) and AI extracts all data
- **Voice Input** — Dictate bills using Web Speech API
- **GST Compliant** — Auto CGST/SGST (intra-state) or IGST (inter-state) calculation
- **Dynamic Custom Fields** — Add any extra fields (vehicle number, signature, stamp, etc.)
- **PDF Download** — Generate and download professional A4 PDF bills
- **WhatsApp Sharing** — Share bills via WhatsApp with a public link
- **Dashboard** — Revenue charts, invoice stats, and customer analytics
- **Built-in Templates** — Transport, Medical, Restaurant, Contractor, Retail, Export
- **Dark Mode** — Full dark mode support
- **Customer Management** — Save and reuse customer details

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Recharts, jsPDF, html2canvas
- **Backend:** Node.js, Express, MongoDB/Mongoose
- **AI:** Google Gemini API
- **Auth:** JWT + bcrypt
- **File Upload:** Multer + Cloudinary

## Quick Start

### 1. Clone and install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment setup

Copy `.env.example` to `server/.env` and fill in your values:

```bash
cp .env.example server/.env
```

Required environment variables:

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — Secret key for JWT tokens
- `GEMINI_API_KEY` — Google Gemini API key
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — For logo uploads

### 3. Run the app

```bash
# Terminal 1 — Start server
cd server
npm run dev

# Terminal 2 — Start client
cd client
npm run dev
```

- Server runs on `http://localhost:5000`
- Client runs on `http://localhost:5173`

## Project Structure

```
/client                          React + Vite + Tailwind
  /src
    /api                         Axios API calls
    /components
      /bill                      Bill template & sub-components
      /dashboard                 Stats, charts, invoice list
      /forms                     AI input, manual form, custom fields
      /shared                    Navbar, sidebar, spinner
    /pages                       All route pages
    /utils                       Calculator, number-to-words, PDF
    /context                     Auth & Bill context
    /hooks                       useAuth, useBill

/server                          Express + MongoDB
  /models                        Mongoose schemas
  /routes                        Express routes
  /controllers                   Route handlers
  /middleware                    Auth, validation, error handler
  /services                     Gemini AI, email, PDF
  /utils                        Calculator, number-to-words, invoice numbering
```

## API Endpoints

| Method       | Route                           | Description               |
| ------------ | ------------------------------- | ------------------------- |
| POST         | /api/auth/register              | Register new user         |
| POST         | /api/auth/login                 | Login                     |
| GET          | /api/auth/me                    | Get current user          |
| POST/GET/PUT | /api/business                   | Business profile CRUD     |
| POST         | /api/business/logo              | Upload logo               |
| POST         | /api/invoices/parse             | AI parse text to bill     |
| POST         | /api/invoices                   | Create invoice            |
| GET          | /api/invoices                   | List invoices (paginated) |
| GET          | /api/invoices/stats             | Dashboard stats           |
| GET          | /api/invoices/:id               | Get invoice               |
| GET          | /api/invoices/public/:token     | Public bill view          |
| PUT          | /api/invoices/:id               | Update invoice            |
| PUT          | /api/invoices/:id/status        | Update status             |
| DELETE       | /api/invoices/:id               | Cancel invoice            |
| POST         | /api/invoices/:id/duplicate     | Duplicate invoice         |
| POST         | /api/invoices/:id/send-whatsapp | WhatsApp share URL        |
| CRUD         | /api/customers                  | Customer management       |
| CRUD         | /api/templates                  | Template management       |
