# Konsoul - Add soul to your console </>

> A powerful, developer-friendly console logging library that makes your terminal output beautiful and informative.

## 🌟 Features

- 🎨 Beautiful, colored console output
- ⚡ Easy-to-use presets for common scenarios
- 🔄 Progress indicators and spinners
- ⏱️ Built-in performance timing
- 📊 Enhanced table formatting
- 🚦 Request/Response logging
- 🎯 Step-by-step process tracking
- 🔍 Debug-friendly environment info

## 📦 Installation

```bash
npm i konsoul
```

## 🚀 Quick Start

```typescript
import { konsoul } from "konsoul";

// Basic logging with style
konsoul.log("Hello, World!", {
  color: "cyan",
  bold: true,
  style: "border-normal",
});

// Output:
// === [ Hello, World! ] ===
```

## 🎯 Real-World Examples

### 1. API Request Logging

```typescript
async function fetchUsers() {
  konsoul.logRequest({
    method: "GET",
    url: "/api/users",
  });

  try {
    const start = Date.now();
    const response = await fetch("/api/users");
    const data = await response.json();

    konsoul.logResponse({
      status: response.status,
      data,
      duration: Date.now() - start,
    });
  } catch (error) {
    konsoul.preset("error", `Failed to fetch users: ${error.message}`);
  }
}

// Output:
// [ 10:45:23 ] [ API ] GET /api/users
// [ 10:45:24 ] [ API ] Status: 200 | Duration: 145ms
```

### 2. Process Steps Tracking

```typescript
await konsoul.steps([
  {
    name: "Database Connection",
    action: async () => await connectDB(),
  },
  {
    name: "Schema Migration",
    action: async () => await runMigrations(),
  },
  {
    name: "Server Startup",
    action: async () => await startServer(),
  },
]);

// Output:
// [ STEP ] Step 1/3: Database Connection ⠋
// ✓ Database Connection completed
// [ STEP ] Step 2/3: Schema Migration ⠙
// ✓ Schema Migration completed
// [ STEP ] Step 3/3: Server Startup ⠹
// ✓ Server Startup completed
```

### 3. Performance Monitoring

```typescript
await konsoul.time("Database Query", async () => {
  const users = await db.users.findMany({
    where: { active: true },
  });
  return users;
});

// Output:
// [ SUCCESS ] Database Query completed in 234.56ms
```

### 4. Environment Information

```typescript
konsoul.logEnvironment();

// Output:
// --- Environment Info ---
// Node Version: v16.14.2
// Platform: darwin
// Environment: development
// Memory Usage: 234MB
// CPU Architecture: x64
// Process ID: 12345
// Working Directory: /users/project
// ---------------------
```

### 5. List Processing

```typescript
const tasks = [
  "Initialize database",
  "Load configuration",
  "Start server",
  "Connect to Redis",
];

konsoul.logList(tasks, {
  label: "Startup Tasks",
  color: "cyan",
});

// Output:
// <---------- Startup Tasks ---------->
// [ 1 ] Initialize database
// [ 2 ] Load configuration
// [ 3 ] Start server
// [ 4 ] Connect to Redis
// <---------- Startup Tasks ---------->
```

### 6. Data Table Formatting

```typescript
const users = [
  { id: 1, name: "John", status: "active", lastLogin: "2024-03-15" },
  { id: 2, name: "Jane", status: "inactive", lastLogin: "2024-03-10" },
];

konsoul.log(users, {
  label: "Users",
  color: "cyan",
  style: "border-normal",
});

// Output: (formatted table with borders and metadata)
// === [ Users ] ===
// Total Entries: 2
// Total Fields: 4
// Fields: id, name, status, lastLogin
// ┌─────────┬────┬──────┬──────────┬────────────┐
// │ (index) │ id │ name │  status  │ lastLogin  │
// ├─────────┼────┼──────┼──────────┼────────────┤
// │    0    │ 1  │ John │ active   │ 2024-03-15 │
// │    1    │ 2  │ Jane │ inactive │ 2024-03-10 │
// └─────────┴────┴──────┴──────────┴────────────┘
```

### 7. Custom Presets

```typescript
// Add your own preset
konsoul.addPreset("metric", {
  label: "METRIC",
  style: "border-dashed",
  color: "blue",
  timestamp: true,
});

// Use it throughout your application
konsoul.preset("metric", {
  cpu: "45%",
  memory: "1.2GB",
  requests: "150/sec",
});

// Output:
// [ 10:45:23 ] [ METRIC ] ---
// cpu: 45%
// memory: 1.2GB
// requests: 150/sec
// ---
```

## 🎨 Styling Options

- Colors: `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, etc.
- Styles: `border-normal`, `border-dashed`, `spacy`, `extra-spacy`, `double`
- Text formats: `bold`, `italic`, `underline`, `strikethrough`
- Animations: `spinner`, `progressBar`, `typing`

## 📄 License

MIT © Rohit Bajaj

---

Made with ❤️ for developers who love beautiful console output.
