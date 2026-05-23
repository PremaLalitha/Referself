# ReferSelf

ReferSelf is a modern full-stack JavaScript platform built using the MERN (MongoDB, Express.js, React.js, Node.js) stack, designed for sharing and managing educational resources. It enables users to upload, explore, rate, and discuss resources across various subjects, fostering a collaborative learning environment. The technologies used across the frontend, backend, and supporting layers are as follows:

## 1. Frontend Technologies
- **React.js**: Used for building the dynamic, component-based user interface for Admin and User modules, including dashboards, resource exploration, and interactive chats.
- **Vite**: Employed as a fast build tool and development server for optimized frontend performance and quick development cycles.
- **React Router**: Enables smooth navigation and role-based route protection across different pages like Home, Explore, Profile, and Admin Dashboard.
- **Context API**: Manages global state for themes (dark/light mode), user statistics, and authentication across components.
- **Axios**: Handles API communication between frontend and backend for seamless data fetching and updates.
- **Firebase**: Integrated for authentication, real-time database features, and potential file storage or notifications.
- **CSS Modules**: Used for modular and responsive UI styling, ensuring consistent design across pages and components.

## 2. Backend Technologies
- **Node.js**: Provides the runtime environment for executing JavaScript code on the server side, enabling scalable server operations.
- **Express.js**: Framework for building RESTful APIs and handling backend routing, authentication, middleware integration, and request processing.
- **JWT (JSON Web Token)**: Ensures secure authentication and authorization for user sessions and protected routes.
- **bcrypt.js**: Used for password hashing to enhance user security and protect sensitive data.
- **Multer**: Middleware for handling file and image uploads (e.g., resource files, profile pictures).
- **Dotenv**: Manages environment variables securely to handle configuration like database URIs and API keys.
- **Passport.js with Google OAuth**: Enables seamless third-party authentication via Google for user login and registration.
- **Nodemailer**: Used for sending automated email notifications (e.g., password reset, account verification).
- **OpenAI**: Integrated for AI-powered features like the chatbot, providing intelligent responses and assistance.

## 3. Database Technologies
- **MongoDB**: Serves as the primary NoSQL database for storing data related to users, subjects, resources, comments, ratings, messages, todos, and activity logs.
- **Mongoose**: Object Data Modeling (ODM) library that simplifies database schema creation, validation, querying, and relationships.

## 4. Authentication & Security Technologies
- **JWT**: For stateless, token-based authentication to secure API endpoints.
- **Passport.js**: Handles OAuth flows, particularly for Google authentication integration.
- **bcrypt**: Provides robust password hashing for secure user credential storage.
- **Helmet**: Security middleware for setting HTTP headers to protect against common vulnerabilities.
- **Express-session**: Manages user sessions for enhanced security and state management.

## 5. Additional Tools & Libraries
- **Cors**: Middleware for enabling secure cross-origin communication between frontend and backend.
- **Express-session**: Supports session-based authentication and data persistence.
- **Firebase SDK**: Used for additional authentication layers, real-time features, or cloud storage integration.
- **OpenAI API**: Powers the chatbot component for interactive AI-driven conversations.

## 6. Development & Deployment Tools
- **Visual Studio Code (VS Code)**: Primary code editor used for development, with support for debugging and extensions.
- **Git & GitHub**: Version control and repository management for collaborative development and code versioning.
- **Postman**: API testing and debugging tool for validating backend endpoints and data flows.
- **npm (Node Package Manager)**: Manages project dependencies, scripts, and package installations for both frontend and backend.

This stack ensures a scalable, secure, and efficient platform for educational resource sharing, with features like real-time chats, file uploads, ratings, and AI assistance.

## Key Pages and Features

### IndexPage (Landing Page)
The IndexPage serves as the main landing page for ReferSelf, welcoming users and introducing the platform's core functionalities for sharing and managing educational resources. It displays dynamic statistics such as the total number of registered users and uploaded resources, fetched from the backend via the StatsContext. The page highlights key platform features including easy resource sharing, collaborative learning, and analytics tracking, while explaining user roles (User for accessing and uploading resources, Admin for platform management). It also lists supported resource formats like PDF, DOCX, PPT, Images, and External Links, and emphasizes security measures and performance optimizations. Users can initiate their journey by clicking the "Get Started" button, which navigates to the authentication page, and submit inquiries through a contact form that sends data to the backend API for processing.

These functionalities are implemented using React components for dynamic and responsive UI rendering, state management with React hooks (e.g., useState for visibility animations and scroll-based footer display), and integration with React Router for navigation. Backend interactions are handled via Axios for fetching stats and submitting contact forms, ensuring real-time data updates, form validation, and seamless user experience across the landing page features.

### AuthChoicePage (Authentication Choice Page)
The AuthChoicePage serves as the entry point for user authentication in ReferSelf, allowing visitors to choose between logging into an existing account or creating a new one. Upon arriving from the landing page, users are presented with two clear options: a "Login" button for returning users to access their personalized dashboard, resource uploads, and interactions, and a "Sign Up" button for new users to register and join the community. Clicking the "Login" button redirects users to the LoginPage, where they can enter their email and password to authenticate via JWT tokens, granting access to protected routes and features. Clicking the "Sign Up" button redirects users to the SignupPage, where they can provide registration details such as name, email, and password, which are securely hashed and stored in the database, followed by email verification if configured. These functionalities are implemented using React components for a clean and intuitive UI, with React Router handling programmatic navigation to ensure smooth transitions between pages. The page employs CSS modules for responsive styling, maintaining consistency with the overall design theme, and avoids any backend calls at this stage to keep the initial load lightweight, deferring authentication logic to the subsequent pages.

### SignupPage (User Registration Page)
The SignupPage enables new users to create an account on ReferSelf through a two-step process for manual registration or seamless Google OAuth integration. In the first step, users enter their full name, username, email, and password, then click "Send OTP" to receive a one-time password via email for verification. The password must meet security requirements (at least 6 characters with uppercase, lowercase, number, and symbol). Upon successful OTP sending, the form advances to the second step where users input the OTP to complete registration, securely hashing the password and storing user data in the database. Alternatively, users can sign up instantly using Google authentication, which handles user creation or login automatically via Passport.js and redirects to the home page upon success. The page includes loading states for better UX, form validation, and navigation options to the login page for existing users. These features are built with React hooks for state management, Axios for API calls to backend endpoints like /api/auth/signup-send-otp and /api/auth/signup-verify-otp, and CSS modules for responsive styling, ensuring a secure and user-friendly registration experience.

### LoginPage (User Authentication Page)
The LoginPage allows existing users to authenticate and access their accounts on ReferSelf, supporting both manual login and Google OAuth for convenience. Users enter their email and password, select their role (User or Admin), and submit the form to authenticate via JWT tokens. Upon successful login, user data including token, name, email, role, coins, and streak information is stored in localStorage, and users are redirected to their appropriate dashboard (home for users, admin for admins). The page also offers Google login for quick access, handled through Passport.js, which redirects to the home page after authentication. Features include loading states during login attempts, form validation, and links to signup and password reset pages. Implemented with React hooks for state management, Axios for API calls to the /api/auth/login endpoint, and CSS modules for responsive styling, the LoginPage ensures secure and efficient user access while maintaining a clean, intuitive interface.

### HomePage (User Dashboard Page)
The HomePage serves as the main dashboard for authenticated users on ReferSelf, providing access to top-liked educational resources, search functionality, and interactive features like ratings and comments. Upon loading, it fetches and displays top-liked resources in a grid layout, allowing users to search and filter by title or subject. Clicking on a resource opens a modal with detailed information, including subject, file type, upload date, downloads, average rating, and external links if applicable. Users can view or download resources, rate them using a star rating system that updates the average rating in real-time, and engage in discussions through a nested comments section supporting replies, edits, deletions, and likes. The page includes a sidebar with a TodoList component for task management and a Navbar for navigation and search. Authentication is enforced, redirecting unauthenticated users to the login page. Built with React hooks for state management, Axios for API interactions with endpoints like /api/resources/top-liked, /api/resources/{id}/comments, and rating/comment APIs, and CSS modules for responsive styling, the HomePage fosters a collaborative learning environment with seamless user interactions and data persistence.

### ExplorePage (Resource Exploration Page)
The ExplorePage allows users to browse and interact with all available educational resources on ReferSelf, providing a comprehensive view beyond the top-liked resources on the HomePage. It features a search bar for filtering resources by title or subject, fetching data from the /api/resources endpoint with optional search parameters. Each resource is displayed using the ExploreResourceItem component, showing details like likes count and comments. Users can add comments and ratings to resources, with authentication checks ensuring only logged-in users can interact. Comments are fetched on demand for each resource, and ratings update the likes count in real-time. The page includes a back button to return to the home page and handles user state for personalized interactions. Implemented with React hooks for state management and API calls, it promotes discovery and engagement with the platform's resource library.

### UploadPage (Resource Upload Page)
The UploadPage enables authenticated users to upload new educational resources or edit existing ones on ReferSelf, supporting both file uploads and external links. Users can select a subject from a dropdown populated from the /api/subjects endpoint, choose an optional folder within the subject, specify the file type (PDF, DOCX, PPT, Image, or Link), and provide a title. For file uploads, users select a file, while for links, they enter a URL. Upon submission, the form sends data to the /api/resources/upload endpoint, rewarding users with 1 coin for successful uploads. The page also supports editing resources, pre-filling fields with existing data and allowing updates without re-uploading files. Authentication is enforced, and users can cancel edits or reset the form. Built with React hooks for state management, Axios for API interactions, and form handling, it ensures secure and user-friendly resource contribution with real-time feedback and validation.

### SubjectPage (Subject and Folder Management Page)
The SubjectPage allows users to navigate and manage subjects and folders on ReferSelf, providing a hierarchical view of educational resources. If no subject is specified in the URL, it displays a list of all subjects fetched from the /api/subjects endpoint, allowing users to click on a subject to view its folders. For a specific subject, it shows folders within that subject, fetched from the /api/folders/subject/{subjectId} endpoint, and enables users to create new folders via a form that posts to /api/folders/create. Users can edit or delete folders they created, with updates sent to /api/folders/{folderId} and deletions handled via DELETE requests. Selecting a folder filters resources to those in that folder, fetched from /api/resources with folderId parameter, and displays them in a grid using ResourceCard components. Resources can be opened directly, opening external links or viewing files via the download endpoint. The page includes navigation buttons to go back to home or subjects, and handles loading states for folders and resources. Implemented with React hooks for state management and API calls, it supports CRUD operations on folders and seamless resource browsing within the subject hierarchy.
