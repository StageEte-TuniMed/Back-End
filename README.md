# TuniMed Backend API

> Express.js Backend API for TuniMed medical appointment platform

## 🏥 **About TuniMed**

TuniMed is a comprehensive medical appointment platform that connects patients with healthcare providers in Tunisia. The platform provides secure authentication, appointment scheduling, medical records management, and more.

## 🚀 **Features**

- **User Authentication** - JWT-based authentication with email verification
- **Role-Based Access Control** - Patient, Doctor, and Admin roles
- **Email Integration** - Automated email notifications
- **Medical Records** - Secure patient data management
- **Appointment Scheduling** - Real-time appointment booking
- **Review System** - Patient feedback and ratings

## 🛠️ **Technologies Used**

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Nodemailer** - Email service
- **bcrypt** - Password hashing

## 📋 **Prerequisites**

- Node.js (v16 or higher)
- MongoDB
- Gmail account (for email service)

## 🔧 **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/tunimed-backend.git
   cd tunimed-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Update .env with your configuration
   ```

4. **Start the server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 🌐 **API Endpoints**

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset
- `GET /api/auth/verify-email/:token` - Email verification

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 📧 **Email Configuration**

Follow the instructions in `EMAIL_SETUP.md` to configure email services.

## 🔐 **Authentication**

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📁 **Project Structure**

```
src/
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
├── config/         # Configuration files
└── app.js          # Main application file
```

## 🧪 **Testing**

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 **Author**

**Nassim Khaldi**

- Email: nassimkhaldi181@gmail.com
- GitHub: [@yourusername](https://github.com/yourusername)

## 🤝 **Support**

If you have any questions or need help, please open an issue or contact the author.

---

© 2025 Nassim Khaldi. All rights reserved.
