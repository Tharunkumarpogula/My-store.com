# server.R - Start the Plumber API
library(plumber)

# Path to the API definition
pr <- plumb("r-backend/plumber.R")

# Run the API on port 8000
# (Using 8000 to avoid conflict with Node backend which usually uses 3000)
cat("\n--- My-store.com R Backend Starting ---\n")
pr$run(port = 8000, host = "0.0.0.0")
