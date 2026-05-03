# DriveBox - MongoDB Database Schema

## Database Name: `drivebox`

---

## Collections

### 1. `users`
Stores registered user accounts.

```json
{
  "_id": "ObjectId",
  "name": "String (required)",
  "email": "String (required, unique, lowercase)",
  "password": "String (hashed with bcrypt, not returned by default)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```
**Indexes:** `email` (unique)

---

### 2. `folders`
Stores folder hierarchy. Supports infinite nesting via `parent` reference.

```json
{
  "_id": "ObjectId",
  "name": "String (required)",
  "owner": "ObjectId → users._id (required)",
  "parent": "ObjectId → folders._id | null (null = root folder)",
  "path": "String (default: '/')",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```
**Indexes:**
- `{ name, parent, owner }` — Compound unique (prevents duplicate names in same location)

---

### 3. `images`
Stores uploaded image metadata. Actual files saved to `/backend/uploads/`.

```json
{
  "_id": "ObjectId",
  "name": "String (required, display name)",
  "filename": "String (UUID-based filename on disk)",
  "mimetype": "String (e.g. image/jpeg)",
  "size": "Number (bytes)",
  "folder": "ObjectId → folders._id (required)",
  "owner": "ObjectId → users._id (required)",
  "url": "String (e.g. /uploads/abc123.jpg)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Relationships

```
users (1) ──────< folders (many)
users (1) ──────< images  (many)
folders (1) ────< folders (many, self-referential for nesting)
folders (1) ────< images  (many)
```

---

## Key Business Logic

### Folder Size Calculation
Folder size = sum of all images recursively within nested folders.
Computed at query time using a recursive helper (see `backend/routes/folders.js`).

### User Isolation
All queries are filtered by `owner: req.user._id` to ensure users only see their own data.

### Cascade Delete
Deleting a folder also deletes all nested folders and their images (files + DB records).
