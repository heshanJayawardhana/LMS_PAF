# Smart Campus Operations Hub

A comprehensive web application for managing university facilities, bookings, and maintenance tickets. Built with React and Spring Boot REST API.

## 🎨 Design Theme

The application features a professional **Navy Blue + White** color scheme:
- Primary Navy: `#1a365d` (deep navy)
- Secondary Navy: `#4a6fa5` (medium navy)
- Accent Navy: `#627d98` (light navy)
- Clean White backgrounds for readability
- Consistent shadow effects for depth

## 🚀 Features

### Core Modules

#### 🏢 Facilities & Assets Catalogue
- Browse and search campus facilities (rooms, labs, equipment)
- Filter by type, capacity, location, and status
- Detailed resource information with amenities
- Real-time availability status

#### 📅 Booking Management
- Create and manage facility bookings
- Workflow: PENDING → APPROVED/REJECTED → CANCELLED
- Conflict prevention for overlapping bookings
- Admin approval system with reasons
- Booking history and status tracking

#### 🎫 Maintenance & Incident Ticketing
- Create incident tickets for equipment/facility issues
- Upload up to 3 image attachments per ticket
- Ticket workflow: OPEN → IN_PROGRESS → RESOLVED → CLOSED
- Technician assignment and status updates
- Comment system for ticket collaboration

#### 🔔 Notifications
- Real-time notifications for booking updates
- Ticket status change alerts
- Comment notifications
- Centralized notification panel
- Read/unread status management

#### 👤 Authentication & Authorization
- OAuth 2.0 integration (Google Sign-In ready)
- Role-based access control: USER, ADMIN, TECHNICIAN
- Secure session management
- Profile management

#### 📊 Admin Dashboard
- System overview with key metrics
- User management and role assignment
- Facility utilization analytics
- Department statistics
- System health monitoring

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful icon library
- **React Hook Form** - Form management
- **React Query** - Data fetching and caching
- **React Hot Toast** - Toast notifications
- **Date-fns** - Date manipulation

### Backend (Required)
- **Spring Boot** - REST API framework
- **Spring Security** - Authentication & authorization
- **MySQL/PostgreSQL** - Database
- **JWT** - Token-based authentication

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout and navigation
│   ├── dashboard/         # Dashboard components
│   ├── facilities/        # Facilities management
│   ├── bookings/          # Booking management
│   ├── tickets/           # Ticket management
│   ├── notifications/     # Notification system
│   ├── profile/           # User profile
│   └── admin/             # Admin components
├── contexts/              # React contexts
├── App.js                 # Main application component
├── index.js              # Application entry point
└── index.css             # Global styles
```

## 🎯 Key Design Principles

### UI/UX Excellence
- **Responsive Design**: Mobile-first approach with breakpoints
- **Consistent Theming**: Navy blue + white color scheme throughout
- **Intuitive Navigation**: Clear sidebar and header navigation
- **Accessibility**: Semantic HTML and ARIA labels
- **Micro-interactions**: Hover states and transitions

### Code Quality
- **Component Architecture**: Reusable, modular components
- **State Management**: Context API for global state
- **Form Handling**: React Hook Form for validation
- **Error Handling**: Comprehensive error boundaries
- **Performance**: Optimized re-renders and lazy loading

## 🔐 Security Features

- **Authentication**: JWT-based with OAuth 2.0 support
- **Authorization**: Role-based access control
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized inputs and outputs
- **CSRF Protection**: Token-based CSRF prevention

## 📱 Responsive Design

The application is fully responsive with optimized layouts for:
- **Mobile** (< 640px): Single column, collapsible sidebar
- **Tablet** (640px - 1024px): Two-column layouts
- **Desktop** (> 1024px): Full multi-column layouts

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-campus-operations-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open browser**
   Navigate to `http://localhost:3000`

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```

## 📊 Database Schema

The application uses the following main tables:

- **users** - User accounts and profiles
- **roles** - User roles (USER, ADMIN, TECHNICIAN)
- **resources** - Facilities and equipment
- **bookings** - Booking records and status
- **tickets** - Maintenance and incident tickets
- **attachments** - Ticket file attachments
- **comments** - Ticket comments
- **notifications** - User notifications

## 🔧 Configuration

### Tailwind CSS Configuration

Custom theme extensions in `tailwind.config.js`:
- Navy blue color palette
- Custom font family (Inter)
- Shadow effects for depth
- Responsive breakpoints

### Routing Configuration

Protected routes with role-based access:
- `/dashboard` - All authenticated users
- `/admin/*` - Admin users only
- `/facilities` - All authenticated users
- `/bookings` - All authenticated users
- `/tickets` - All authenticated users

## 🎨 UI Components

### Common Components
- **Layout**: Header, sidebar, and main content area
- **Cards**: Consistent card components with shadows
- **Forms**: Styled form inputs with validation
- **Buttons**: Primary, secondary, and danger variants
- **Modals**: Reusable modal components
- **Tables**: Responsive data tables
- **Notifications**: Toast and in-app notifications

### Icon System
Using Heroicons for consistent, beautiful icons:
- Navigation icons
- Action icons
- Status indicators
- Form field icons

## 📈 Performance Optimizations

- **Code Splitting**: Lazy loading for routes
- **Image Optimization**: WebP format support
- **Bundle Analysis**: Optimized dependencies
- **Caching**: Service worker for offline support
- **Minification**: Production build optimization

## 🔮 Future Enhancements

- **Real-time Updates**: WebSocket integration
- **Mobile App**: React Native version
- **Advanced Analytics**: Usage tracking and insights
- **QR Code Check-in**: Booking verification
- **Email Templates**: Customizable notifications
- **API Rate Limiting**: Enhanced security
- **Multi-language Support**: Internationalization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- **Email**: support@campus.edu
- **Documentation**: See inline code comments
- **Issues**: Use GitHub Issues for bug reports

---

**Smart Campus Operations Hub** - Modernizing university facility management 🏛️
