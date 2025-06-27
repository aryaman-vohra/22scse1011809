# URL Shortener – Frontend

A minimal and responsive frontend application for shortening URLs, managing expiration, and tracking redirection metrics — built with React and TypeScript.

---

## ✨ Features

- 🔗 **Shorten any valid URL**
- ✏️ **Optional custom shortcode**
- ⏱️ **Optional expiration time in minutes**
- 📊 **Track total click count**
- 🌍 **Log basic user metadata on redirect**
- 🧭 **Client-side routing for redirection**
- 💾 **LocalStorage persistence for generated links**
- 🧩 **Modular structure with reusable utilities and components**

---

## 🛠 Tech Stack

- React (w/ TypeScript)
- Material UI (MUI)
- React Router v6
- LocalStorage for data persistence
- Custom logging utility (API-based)

---

## 🧩 Folder Structure

├── public/index.html
├── src/
│ ├── components/ # Shared UI and logic components
│ ├── pages/ # Core pages (Shortener & Stats)
│ ├── utils/ # Utility functions and custom logic
│ ├── types/ # TypeScript type definitions
│ ├── config/index.ts # App configuration
│ ├── App.tsx # Routes and layout
│ └── index.tsx # Entry point


---

## 🚀 How to Run

1. Clone this repository:
```bash
git clone https://github.com/your-username/url-shortener.git
cd url-shortener

Install dependencies:

npm install
Start the development server
npm start
The app will run at http://localhost:3000.

🔍 Key Components
UrlShortenerPage: Main form to shorten URLs and set expiry

RedirectHandler: Extracts shortCode from route and redirects user to original URL

StatisticsPage: Placeholder for visualizing click analytics (extensible)

StorageService: Wraps LocalStorage interactions for URL data

UrlUtils: Central utility for validation, formatting, and short code generation


