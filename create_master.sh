#!/bin/bash

# Prompt for user input
echo "Enter email:"
read email

echo "Enter password:"
read -s password
echo

echo "Enter role (admin/user):"
read role

# Create the user using the API
response=$(curl -s -X POST "http://34.82.192.6:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$email\",
    \"password\": \"$password\",
    \"role\": \"$role\"
  }")

# Check if the request was successful
if echo "$response" | grep -q "id"; then
    echo "User created successfully!"
    echo "Email: $email"
    echo "Role: $role"
else
    echo "Failed to create user. Response:"
    echo "$response"
fi 