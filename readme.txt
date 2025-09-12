The instructions you provided are already well-structured and clear. I have reformatted them to be more formal and professional, which should present the process in a "good posture."

***

### 🚀 Project Initialization and Setup

#### 🛠️ Prerequisites
Before you begin, ensure the following software is installed on your system:
* **Node.js:** A JavaScript runtime environment.
* **MySQL:** A relational database management system.
* **MySQL Workbench:** A visual tool for managing your MySQL database.

#### ⚙️ Database Configuration
1.  **Create the Database:** Using MySQL Workbench, create a new database named **`storerating`**.
2.  **Update Credentials:** In your backend project directory, open the `.env` file and update the `username` and `password` to match your local MySQL credentials.

---

### ▶️ Running the Application

1.  **Start the Backend:**
    * Open a new terminal and navigate to your `backend` directory. // cd backend
    * Execute the command `node server.js` to start the server.

2.  **Create the Administrator Account:**
    * After the server has started, press **`Ctrl + C`** to stop it.
    * Run the command `node setup.js` to create the initial admin user. This is a one-time process.
    * Restart your backend server by running `node server.js` again.

3.  **Start the Frontend:**
    * Open a **second** terminal window.
    * Navigate to your `frontend` directory. // cd frontend
    * Execute `npm run dev` to start the frontend application.

The application will now be fully operational and accessible in your browser.