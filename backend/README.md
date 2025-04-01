# API Documentation

## Endpoint: `/user/register`

### Description
This endpoint is used to register a new user in the system. It validates the input data and creates a new user if the data is valid and the email is not already registered.

### Method
`POST`

### Request Body
The following fields are required in the request body:

| Field               | Type   | Description                                      |
|---------------------|--------|--------------------------------------------------|
| `fullname.firstname`| String | First name of the user (minimum 3 characters).   |
| `fullname.lastname` | String | Last name of the user (optional).                |
| `email`             | String | Email address of the user (must be valid).       |
| `password`          | String | Password for the user (minimum 6 characters).    |

Example:
```json
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "password123"
}
```

### Response

#### Success (201)
If the user is successfully registered, the response will include a token and user details:
```json
{
  "token": "jwt_token_here",
  "user": {
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com"
  }
}
```

#### Error (400)
If there are validation errors or the email is already registered, the response will include an error message:
- Validation errors:
```json
{
  "errors": [
    {
      "msg": "Invalid Email",
      "param": "email",
      "location": "body"
    }
  ]
}
```
- Email already registered:
```json
{
  "message": "User already exist"
}
```

### Notes
- Ensure that all required fields are provided and meet the validation criteria.
- Passwords are hashed before being stored in the database.
