Project Initialization and Setup
🛠️ Prerequisites
Before you begin, ensure the following software is installed on your system:

Node.js: A JavaScript runtime environment.
MySQL: A relational database management system.
MySQL Workbench: A visual tool for managing your MySQL database.
⚙️ Database Configuration
Create the Database: Open MySQL Workbench and create a new database named storerating.

Update Credentials: In your backend project directory, open the .env file and update the DB_USERNAME and DB_PASSWORD to match your local MySQL credentials.

▶️ Running the Application
Start the Backend:

Open a new terminal and navigate to your backend directory:

cd backend
Start the backend server:

node server.js
Create the Default Administrator Account:

After the server starts, stop it by pressing Ctrl + C.

Run the following command to create the default admin account:

node setup.js
This will create a default administrator with the following credentials:

Email: admin@gmail.com
Password: Admin@123
This is a one-time setup. After this step:

The admin can log in using the above credentials.
The admin will have the ability to create additional administrators and store owners via the application interface.
Restart the backend server:

node server.js
Start the Frontend:

Open a second terminal window.

Navigate to your frontend directory:

cd frontend
Start the frontend application:

npm run dev
