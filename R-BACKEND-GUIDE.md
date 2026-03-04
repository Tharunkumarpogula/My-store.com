# 🚀 R Backend Migration Guide

You now have a complete backend implemented in **R** using the `plumber` package, alongside a local SQLite database.

## 📁 New Files
- `r-backend/server.R`: Main script to start the API server.
- `r-backend/plumber.R`: API endpoint definitions (Products, Login, Register).
- `r-backend/db_manager.R`: Database connection and logic handlers.
- `r-backend/schema.sql`: Database table definitions and initial seed data.

## 🛠️ Prerequisites
To run this backend, you need R installed on your system with the following packages:
```r
install.packages(c("plumber", "RSQLite", "DBI", "jsonlite"))
```

## 🏃 How to Run
1. Open your terminal in the project root.
2. Run the following command:
   ```bash
   Rscript r-backend/server.R
   ```
3. The server will start on **http://localhost:8000**.

## 🔄 What changed?
1. **API Port**: Switched from `3000` (Node.js) to `8000` (R) to avoid conflicts.
2. **Frontend Support**: `js/main.js` and `login.html` have been updated to point to the new port.
3. **Database**: A new SQLite database `r_backend_store.sqlite` will be created automatically on first run.

## 🧪 Testing the API
- **Products**: `GET http://localhost:8000/api/products`
- **Register**: `POST http://localhost:8000/api/register`
- **Login**: `POST http://localhost:8000/api/login`

Enjoy your new R-powered backend!
