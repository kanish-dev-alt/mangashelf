# MangaShelf 📚

A Manga Library Management System built to help users explore manga series and view their available volumes through a clean, user-friendly interface.

## ✨ Features

- Browse manga series
- Search for manga
- View manga cover images
- Explore volume details for each series
- REST API for retrieving manga and volume data
- MySQL database integration

## 🛠️ Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **API:** REST API

## 📂 Project Structure

```text
mangashelf/
├── config/
│   └── db.js
├── database/
│   └── manga_library.sql
├── public/
│   ├── css/
│   │   └── style.css
│   ├── image/
│   ├── js/
│   │   └── app.js
│   ├── favicon.png
│   └── index.html
├── routes/
├── controllers/
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

## ⚙️ Prerequisites

Before running this project, install:

- [Node.js](https://nodejs.org/)
- [MySQL](https://dev.mysql.com/downloads/)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/kanish-dev-alt/mangashelf.git
cd mangashelf
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add your own MySQL connection details:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=manga_library_management
PORT=3000
```

Use the environment variable names expected by your `config/db.js` file.

### 4. Set up the database

Import `database/manga_library.sql` into MySQL if that file is included in the repository.

### 5. Start the application

```bash
npm start
```

If your `package.json` uses a different start script, run the appropriate command defined there.

### 6. Open the application

Visit:

http://localhost:3000

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check server health |
| GET | `/api/manga` | Retrieve manga series |
| GET | `/api/manga/:id/volumes` | Retrieve volumes for a manga series |

## 🔐 Security

- Keep `.env` out of version control.
- Never publish database passwords or other secrets.
- Use environment variables for sensitive configuration.

## 👨‍💻 Author

**Kanish Kumar**

- GitHub: [@kanish-dev-alt](https://github.com/kanish-dev-alt)

---

Built as a Manga Library Management System project.