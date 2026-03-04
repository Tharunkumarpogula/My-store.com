# Database Management for My-store.com (R Backend)
library(DBI)
library(RSQLite)

# Initialize database connection
init_db <- function() {
  db_path <- "r_backend_store.sqlite"
  con <- dbConnect(RSQLite::SQLite(), db_path)
  
  # Check if products table exists, if not, initialize
  tables <- dbListTables(con)
  if (!("products" %in% tables)) {
    schema_path <- "r-backend/schema.sql"
    if (file.exists(schema_path)) {
      schema <- readLines(schema_path)
      statements <- paste(schema, collapse = "\n")
      stmt_list <- strsplit(statements, ";")[[1]]
      stmt_list <- stmt_list[nchar(trimws(stmt_list)) > 0]
      
      for (stmt in stmt_list) {
        dbExecute(con, stmt)
      }
    }
  }
  
  return(con)
}

# Fetch all products
get_products <- function() {
  con <- init_db()
  on.exit(dbDisconnect(con))
  
  query <- "SELECT * FROM products WHERE isActive = 1"
  products <- dbGetQuery(con, query)
  return(products)
}

# Register a new user
register_user <- function(username, email, mobileNumber, password) {
  con <- init_db()
  on.exit(dbDisconnect(con))
  
  # Generate a simple ID (UUID placeholder)
  user_id <- as.character(as.numeric(Sys.time()) * 1000)
  
  query <- "INSERT INTO users (id, username, email, mobileNumber, passwordHash) VALUES (?, ?, ?, ?, ?)"
  
  tryCatch({
    dbExecute(con, query, params = list(user_id, username, email, mobileNumber, password))
    new_user <- dbGetQuery(con, "SELECT id, username, email FROM users WHERE email = ?", params = list(email))
    return(as.list(new_user))
  }, error = function(e) {
    stop(paste("Registration failed:", e$message))
  })
}

# Login user
login_user <- function(email, password) {
  con <- init_db()
  on.exit(dbDisconnect(con))
  
  query <- "SELECT id, username, email FROM users WHERE email = ? AND passwordHash = ?"
  user <- dbGetQuery(con, query, params = list(email, password))
  
  if (nrow(user) == 0) {
    return(NULL)
  }
  
  return(as.list(user))
}
