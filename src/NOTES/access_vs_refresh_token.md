An **access token** and a **refresh token** are both part of the authentication process in web applications, typically used in OAuth2 and similar security protocols. Here's how they differ:

### 1. **Access Token**
- **Purpose**: It grants access to protected resources (like APIs or services) on behalf of a user or application.
- **Short Lifespan**: Access tokens usually have a short expiration time (e.g., 15 minutes to 1 hour) for security purposes. After expiration, a new token is needed to continue accessing resources.
- **Usage**: Sent with each request to access a resource (typically in the HTTP Authorization header).
- **Security**: Because it grants direct access to resources, it should be handled carefully and should never be exposed.

### 2. **Refresh Token**
- **Purpose**: It is used to obtain a new access token when the current one expires, without requiring the user to re-authenticate.
- **Long Lifespan**: Refresh tokens usually have a longer expiration time (e.g., days, weeks, or even months) compared to access tokens.
- **Usage**: When the access token expires, the refresh token is sent to the authorization server to request a new access token.
- **Security**: Should be stored securely (usually server-side or in secure storage mechanisms like `httpOnly` cookies) because if compromised, it can be used to generate new access tokens.

### Key Differences:
| Feature           | Access Token                         | Refresh Token                          |
|-------------------|--------------------------------------|----------------------------------------|
| **Purpose**       | Grants access to resources           | Used to obtain a new access token      |
| **Lifespan**      | Short-lived (minutes to hours)       | Long-lived (days to months)            |
| **Usage**         | Sent with each resource request      | Sent to authorization server when access token expires |
| **Security Risk** | Higher risk if leaked (direct access) | Lower immediate risk but can generate access tokens |
| **Storage**       | Typically in-memory or short-term    | Stored securely, often server-side     |

In essence, the access token is the "key" to the resources, while the refresh token is used to "get a new key" when the old one expires.