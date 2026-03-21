# Firestore Data Model — CMG Camp Ecosystem

All three apps (Camp Manager, Billing, Hygiene Inspection) share the **same Firebase project**
and read from the same top-level collections.

---

## Collection: `rooms`
Mirrors the SQL `rooms` table. Referenced by inspections and billing.

```
rooms/{roomId}
  campId        : string          // FK → camps/{campId}
  roomNumber    : string          // e.g. "A-101"
  zone          : string          // e.g. "Zone A"
  building      : string          // e.g. "Block 1"
  capacity      : number
  status        : "empty" | "partial" | "full" | "maintenance"
  createdAt     : Timestamp
  updatedAt     : Timestamp
```

---

## Collection: `workers`
Registered workers/residents in the camp.

```
workers/{workerId}
  campId          : string
  roomId          : string        // FK → rooms/{roomId}
  subcontractorId : string
  firstName       : string
  lastName        : string
  documentType    : "national_id" | "passport" | "work_permit"
  documentNumber  : string
  photoUrl        : string
  gender          : "male" | "female" | "other"
  nationality     : string
  phone           : string
  jobRole         : string
  qrCode          : string
  isActive        : boolean
  registeredAt    : Timestamp
```

---

## Collection: `inspection_logs`
One document per inspection event (one room, one inspector, one point in time).

```
inspection_logs/{logId}
  campId          : string          // which camp was inspected
  roomId          : string          // FK → rooms/{roomId}
  roomNumber      : string          // denormalised for easy querying/display
  zone            : string          // denormalised
  inspectorId     : string          // FK → users/{userId} (Firebase Auth UID)
  inspectorName   : string          // denormalised display name
  timestamp       : Timestamp       // server timestamp at submission
  overallStatus   : "passed" | "failed" | "warning"
                                    // passed  = 0 fails
                                    // warning = exactly 1 fail
                                    // failed  = 2+ fails
  passCount       : number
  failCount       : number
  naCount         : number
  generalNote     : string          // optional overall comment
  penaltyCreated  : boolean         // true if billing penalty was auto-generated
  details         : DetailItem[]    // inline array — see below
```

### `details` array item shape
```
{
  itemId     : string    // matches ChecklistItem.id  e.g. "room_floor"
  categoryId : string    // parent category           e.g. "room_interior"
  label      : string    // denormalised item label for offline readability
  status     : "pass" | "fail" | "na"
  note       : string    // required when status === "fail"
  photoUrl   : string    // Firebase Storage download URL (empty string if none)
  photoPath  : string    // Storage path for deletion  e.g. "inspections/{logId}/{itemId}.jpg"
}
```

### Firestore indexes to create (Firebase Console → Indexes → Composite)
| Collection       | Fields                                   | Query order |
|------------------|------------------------------------------|-------------|
| inspection_logs  | campId ASC, timestamp DESC               | DESC        |
| inspection_logs  | campId ASC, roomId ASC, timestamp DESC   | DESC        |
| inspection_logs  | campId ASC, overallStatus ASC, timestamp DESC | DESC   |

---

## Collection: `billing_penalties`  (written by Hygiene app, read by Billing app)
Auto-created when an inspection result is "failed".

```
billing_penalties/{penaltyId}
  campId            : string
  roomId            : string
  inspectionLogId   : string    // FK → inspection_logs/{logId}
  billingMonth      : string    // "YYYY-MM" e.g. "2025-03"
  failCount         : number
  amount            : number    // failCount × rate from billing_rates
  status            : "pending" | "invoiced" | "paid"
  createdAt         : Timestamp
```

---

## Firebase Storage structure
```
inspections/
  {logId}/
    {itemId}.jpg      ← one file per failed item with a photo
```
---

## Security Rules skeleton (firestore.rules)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() { return request.auth != null; }
    function belongsToCamp(campId) {
      return isSignedIn() && request.auth.token.campId == campId;
    }

    match /rooms/{id} {
      allow read: if isSignedIn();
      allow write: if isSignedIn(); // tighten per role in production
    }
    match /workers/{id} {
      allow read: if isSignedIn();
      allow write: if isSignedIn();
    }
    match /inspection_logs/{id} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if false; // logs are immutable once written
    }
    match /billing_penalties/{id} {
      allow read: if isSignedIn();
      allow write: if isSignedIn();
    }
  }
}
```
