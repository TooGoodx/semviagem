# Postman Setup Instructions for Moblix API

## Step 1: Import the Collection

1. Open Postman
2. Click "Import" button (top left)
3. Select "Upload Files" 
4. Choose the file: `Moblix_API_Collection.postman_collection.json`
5. Click "Import"

## Step 2: Execute the Requests in Order

### Request 1: Get Authentication Token

**URL:** `POST https://api.moblix.com.br/api/Token`

**Headers:**
```
Content-Type: application/x-www-form-urlencoded
Origin: externo
```

**Body (x-www-form-urlencoded):**
```
grant_type: password
username: TooGood
password: 23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7
```

**Expected Response:**
```json
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 3600
}
```

> **Important:** The collection will automatically save the `access_token` to a variable for use in subsequent requests.

### Request 2: Search Airports (Method 1)

**URL:** `GET https://api.moblix.com.br/aereo/api/aeroporto?filtro=nova`

**Headers:**
```
Authorization: Bearer {{access_token}}
Accept: application/json
```

### Request 3: Search Airports (Method 2)

**URL:** `POST https://api.moblix.com.br/moblix-api/api/ConsultaAereo/Aeroportos?filtro=nova`

**Headers:**
```
Authorization: Bearer {{access_token}}
Accept: application/json
Content-Type: application/json
```

### Request 4: Get All Airports (No Filter)

**URL:** `GET https://api.moblix.com.br/aereo/api/aeroporto`

**Headers:**
```
Authorization: Bearer {{access_token}}
Accept: application/json
```

## Step 3: View Results

1. **Execute Request 1 first** - This gets your authentication token
2. **Check the Console tab** in Postman to see the token was saved
3. **Execute Requests 2, 3, or 4** to get airport data
4. **Check the Response tab** to see all available airports
5. **Check the Console tab** for formatted airport listings

## Expected Airport Data Format

The API should return airport data in this format:
```json
[
    {
        "codigo": "GRU",
        "nome": "Guarulhos - Governador André Franco Montoro",
        "cidade": "São Paulo",
        "estado": "SP",
        "pais": "Brasil"
    },
    {
        "codigo": "CGH",
        "nome": "Congonhas",
        "cidade": "São Paulo", 
        "estado": "SP",
        "pais": "Brasil"
    }
]
```

## Troubleshooting

- **401 Unauthorized:** Token expired or invalid - re-run Request 1
- **CORS Error:** Use Postman desktop app, not web version
- **Network Error:** Check internet connection and API availability
- **Empty Response:** Try different endpoint variations (Requests 2, 3, or 4)

## Manual Setup (Alternative)

If you prefer to set up manually:

1. **Create New Collection:** "Moblix API"
2. **Add Collection Variables:**
   - `base_url`: `https://api.moblix.com.br`
   - `username`: `TooGood`
   - `password`: `23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7`
   - `access_token`: (leave empty)

3. **Create the 4 requests** as described above using the collection variables
