# plumber.R - API Definition for My-store.com
library(plumber)
source("r-backend/db_manager.R")

#* @filter cors
function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
  res$setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  }
  
  plumber::forward()
}

#* Get all products
#* @get /api/products
function() {
  get_products()
}

#* Register a new user
#* @post /api/register
#* @param username
#* @param email
#* @param mobileNumber
#* @param password
function(username, email, mobileNumber, password) {
  if (missing(username) || missing(email) || missing(password)) {
    return(list(error = "Missing required fields"))
  }
  
  result <- tryCatch({
    register_user(username, email, mobileNumber, password)
  }, error = function(e) {
    list(error = e$message)
  })
  
  return(result)
}

#* Login user
#* @post /api/login
#* @param email
#* @param password
function(email, password) {
  if (missing(email) || missing(password)) {
    return(list(error = "Email and password are required"))
  }
  
  user <- login_user(email, password)
  
  if (is.null(user)) {
    return(list(error = "Invalid email or password"))
  }
  
  return(user)
}
