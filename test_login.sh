# Login and store the token
TOKEN=$(curl -s -X POST "http://34.82.192.6:8000/api/auth/token" \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "username=test@example.com&password=testpassword123" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

# Use the token to check authentication
curl -X GET "http://34.82.192.6:8000/api/auth/me" \
-H "Authorization: Bearer $TOKEN"
