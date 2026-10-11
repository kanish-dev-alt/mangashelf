# 📚 MangaShelf — Manga Library Management System

MangaShelf is a web-based manga library management system that allows users to browse manga series and view their volumes through a simple interface.

## 🌐 Live Demo

**[Visit MangaShelf](https://mangashelf-s8rr.onrender.com)**

## ✨ Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Cloud Database:** Aiven
- **Deployment:** Render
- **Version Control:** Git and GitHub

## 🚀 Features

- Browse manga series.
- View manga information and available volumes.
- Store manga records in a MySQL database.
- Access the website through a browser on desktop or mobile.
- Use a cloud-hosted backend and database.

## 💻 Run Locally

### Prerequisites

- Node.js and npm
- MySQL database
- Git (optional)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/kanish-dev-alt/mangashelf.git
   ```

2. Open the project folder:

   ```bash
   cd mangashelf
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the project root and configure your database connection:

   ```env
   DB_HOST=your_database_host
   DB_PORT=3306
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   ```

   Replace these example values with your own database credentials. Never upload your `.env` file or database password to GitHub.

5. Start the server:

   ```bash
   node server.js
   ```

6. Open your browser and visit:

   https://mangashelf-s8rr.onrender.com

   The local port may differ if you configure a different `PORT` value.

## ☁️ Deployment

MangaShelf is deployed using Render, with Aiven providing the cloud MySQL database.

- **Live application:** https://mangashelf-s8rr.onrender.com
- **GitHub repository:** https://github.com/kanish-dev-alt/mangashelf

## 👨‍💻 Author

**Kanish Kumar**

GitHub: [@kanish-dev-alt](https://github.com/kanish-dev-alt)

---

*Built as a web development project to practice frontend development, backend APIs, database integration, and cloud deployment.*