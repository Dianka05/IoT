# User Management, Organizations and Admin Access

This document describes how the current user-management system works after adding admin-only access and organization-based filtering.

## Main idea

The system now has two different flows:

1. **Public registration** through `POST /auth/register`
2. **Admin user creation** through `POST /users`

For normal usage, users should be created by an authenticated admin. Public registration should usually stay disabled, except for development/bootstrap.

## Roles

The important role is:

```js
role: "admin"
```

Only users with `role: "admin"` can manage other users.

Admin-only actions:

- view users list
- create users
- update users
- delete users
- change `allowedDeviceIds`

Regular users should not be able to do these actions.

## Organizations

There is a Firestore collection:

```text
organizations
```

Example document:

```js
organizations/org-1
{
  organizationId: "org-1",
  name: "Main Organization",
  active: true,
  createdAt: ...,
  updatedAt: ...
}
```

Each user should also have an `organizationId` field:

```js
users/<authUid>
{
  authUid: "<firebase-auth-uid>",
  userId: "<firebase-auth-uid>",
  email: "admin@example.com",
  name: "Admin",
  role: "admin",
  active: true,
  organizationId: "org-1",
  allowedDeviceIds: [],
  cards: []
}
```

## Organization access rule

Admins can manage only users from their own organization.

Allowed:

```text
admin.organizationId = "org-1"
targetUser.organizationId = "org-1"
```

Forbidden:

```text
admin.organizationId = "org-1"
targetUser.organizationId = "org-2"
```

This rule is enforced on the backend.

## Environment variables

In `server/.env`:

```env
ALLOW_PUBLIC_REGISTRATION=false
DEFAULT_ORGANIZATION_ID=org-1
CLIENT_URL=http://localhost:5173
```

For temporary development/testing, public registration can be enabled:

```env
ALLOW_PUBLIC_REGISTRATION=true
```

After changing `.env`, restart the backend.

## Public registration

Endpoint:

```http
POST /auth/register
```

This route is controlled by:

```env
ALLOW_PUBLIC_REGISTRATION
```

If public registration is disabled, the backend returns `403`.

This route is mostly useful for development/bootstrap. In normal usage, users should be created by an admin through `POST /users`.

## Admin-created users

Endpoint:

```http
POST /users
```

Requirements:

- user must be authenticated
- user must have `role: "admin"`
- admin must have `organizationId`

Example request:

```http
POST http://localhost:3000/users
Content-Type: application/json
Cookie: session=<session-cookie>
```

Body:

```json
{
  "email": "worker1@example.com",
  "password": "Worker123!",
  "name": "Worker One",
  "role": "user",
  "active": true,
  "allowedDeviceIds": ["fan-1"],
  "cards": [
    {
      "uid": "RF-1001",
      "status": "active"
    }
  ],
  "sessionDurationSec": 1800
}
```

The backend automatically assigns:

```js
organizationId: req.userProfile.organizationId
```

So if the admin belongs to `org-1`, the created user will also belong to `org-1`.

## Getting users

Endpoint:

```http
GET /users
```

Requirements:

- authenticated user
- admin role

The response contains only users from the same organization as the current admin.

Example:

```http
GET http://localhost:3000/users
Cookie: session=<session-cookie>
```

Expected result:

```json
{
  "success": true,
  "items": [
    {
      "id": "...",
      "email": "worker1@example.com",
      "role": "user",
      "organizationId": "org-1"
    }
  ],
  "count": 1
}
```

## Updating users

Endpoint:

```http
PATCH /users/:uid
```

Only admins can update users, and only users from the same organization.

Example body:

```json
{
  "name": "Updated Worker",
  "role": "user",
  "active": true,
  "sessionDurationSec": 3600
}
```

## Updating allowed devices

Endpoint:

```http
PATCH /users/:uid/allowedDeviceIds
```

Example body:

```json
{
  "allowedDeviceIds": ["fan-1", "fan-2"]
}
```

This route is also admin-only and organization-protected.

## Deleting users

Endpoint:

```http
DELETE /users/:uid
```

Only admins can delete users from their own organization.

The delete action removes:

- the Firestore user profile
- the Firebase Authentication user

## Organizations API

Create organization:

```http
POST /organizations
```

Example body:

```json
{
  "organizationId": "org-1",
  "name": "Main Organization",
  "active": true
}
```

List organizations:

```http
GET /organizations
```

Get one organization:

```http
GET /organizations/org-1
```

These routes are intended for admin usage.

## Frontend behavior

The Users page should call:

```http
GET /users
```

Because filtering is done by the backend, the frontend receives only users from the admin's organization.

The frontend should not manually show users from other organizations.

If the page shows:

```text
Authentication required
```

then the request probably does not include the `session` cookie.

Check that frontend requests use:

```js
credentials: "include"
```

## Required cookie/CORS setup

Backend CORS should allow credentials:

```js
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}))
```

Frontend fetch requests should include:

```js
credentials: "include"
```

For local development, auth cookies should use:

```js
httpOnly: true,
secure: false,
sameSite: "lax"
```

## How to test with Thunder Client

### 1. Login as admin

```http
POST http://localhost:3000/auth/login
```

```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

Copy the returned `session` cookie.

### 2. Get users

```http
GET http://localhost:3000/users
Cookie: session=<session-cookie>
```

Expected:

- `200 OK`
- only users from the admin's organization

### 3. Create user as admin

```http
POST http://localhost:3000/users
Cookie: session=<session-cookie>
Content-Type: application/json
```

```json
{
  "email": "worker2@example.com",
  "password": "Worker123!",
  "name": "Worker Two",
  "role": "user",
  "active": true,
  "allowedDeviceIds": []
}
```

Expected:

- user appears in Firebase Authentication
- user profile appears in Firestore
- profile has the same `organizationId` as the admin

### 4. Try as non-admin

Login as a normal user and call:

```http
GET /users
```

Expected:

```http
403 Forbidden
```

### 5. Try cross-organization access

If admin is from `org-1`, try deleting or updating a user from `org-2`.

Expected:

```http
403 Forbidden
```

## Bootstrap note

If there is no admin yet, create the first admin manually:

1. Create a Firebase Authentication user in Firebase Console.
2. Copy the Firebase UID.
3. Create or update the Firestore document:

```js
users/<uid>
{
  authUid: "<uid>",
  userId: "<uid>",
  email: "admin@example.com",
  name: "Admin",
  role: "admin",
  active: true,
  organizationId: "org-1",
  allowedDeviceIds: [],
  cards: []
}
```

After that, login as this admin and create other users through `POST /users`.

## Common problems

### `Authentication required`

The request has no valid cookie/token.

Check:

- user is logged in
- cookie exists
- frontend uses `credentials: "include"`
- backend CORS has `credentials: true`

### `Admin role required`

Current user is authenticated but does not have:

```js
role: "admin"
```

### `Admin organization is not set`

Current admin profile does not have:

```js
organizationId
```

### Empty users list

The backend filters by organization. Make sure users have the same `organizationId` as the current admin.

### Public registration still returns 403

Check:

```env
ALLOW_PUBLIC_REGISTRATION=true
```

Use lowercase `true`, then restart backend.

Also make sure the frontend is calling:

```http
POST /auth/register
```

not:

```http
POST /users
```

`POST /users` is always admin-only.
