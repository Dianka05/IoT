# IoT-based Equipment Access Control System

This application provides controlled access to physical equipment using RFID authentication, role-based authorization, IoT devices based on ESP32, backend services, MQTT communication and an administrator web dashboard.

The system consists of a Main Box ESP32, which reads RFID and local sensors, a Device ESP32, which controls a fan and reads local inputs, a backend application, which performs authorization and manages business logic, and a frontend dashboard, which allows administrators to manage users, devices, sessions and logs.

The backend acts as the central application brain. It stores users, devices, permissions, sessions, logs and offline whitelist entries. The Main Box ESP32 interacts with the physical world, reads RFID cards and sensor data, and requests access authorization from backend. The Device ESP32 executes hardware commands such as fan control and reports its state back to the system.

The application supports both online mode and limited offline mode. In online mode, RFID access is validated by backend. In offline mode, only selected users with technician or admin role can be authenticated by Main Box using synchronized offline whitelist data.

The application also records telemetry, device state changes, access attempts and session lifecycle events. The administrator dashboard provides CRUD operations over core entities and monitoring of active sessions and event logs.

## Technology Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | **React** |
| **Backend** | **Node.js + Express**|
| **Database** | **Firebase** | 

---

## Branch Structure

### **Main Branches**

| Branch | Purpose |
|--------|----------|
| `main` | Contains the latest stable and production-ready code. Only fully tested and approved changes are merged here. |
| `develop` | Serves as the integration branch for all upcoming sprint work. All completed feature branches are merged into `develop` after testing. |

### **Supporting Branches**

| Branch Type | Naming Convention | Purpose |
|--------------|------------------|----------|
| **Feature Branches** | `feature/<feature-name>` | Used to develop new features or functionalities (e.g., `feature/create-project-api`). |
| **Bugfix Branches** | `bugfix/<issue-name>` | Used to fix identified issues during development (e.g., `bugfix/task-validation`). |
| **Hotfix Branches** | `hotfix/<issue-name>` | Used for urgent fixes on the `main` branch (e.g., `hotfix/deployment-error`). |

---

## Workflow

1. **Create a new branch** from `develop`:  
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/<feature-name>
   ```

2. **Work on your feature** — commit changes regularly:  
   ```bash
   git add .
   git commit -m "Add API endpoint for creating a project"
   ```

3. **Push your branch** to the repository:  
   ```bash
   git push origin feature/<feature-name>
   ```

4. **Create a Pull Request (PR)** from your feature branch → `develop`.  
   - Include a short description of what was added or changed.  
   - Assign a reviewer.  

5. **Await review**

## Example Branch Naming

| Type | Example |
|------|----------|
| Feature | `feature/create-project-api` |
| Feature | `feature/create-task-form` |
| Bugfix | `bugfix/fix-task-deadline` |
| Hotfix | `hotfix/fix-deployment-error` |

---

## Branching Rules

- Always branch **off of `develop`**, not `main`.  
- Never push directly to `main`.  
- Always use **Pull Requests** for merging — no direct commits.  
- Delete feature branches after merging to keep the repo clean.  
- Write clear and descriptive commit messages.  

---