# Seen - Incident Reporting Platform

A comprehensive web application for documenting and analyzing discrimination and bias incidents, built with React, TypeScript, and modern web technologies.

## 🌟 Features

### Core Functionality
- **Multi-step Incident Reporting**: Guided form with smart validation and auto-save
- **Personal Report Management**: View, organize, and track your submitted reports
- **Analytics Dashboard**: Aggregated, anonymized data visualization with interactive charts
- **Advanced Analytics**: Deep insights with filtering and trend analysis
- **Support Resources**: Context-aware support resource finder based on incident type and location

### Enhanced User Experience
- **Accessibility First**: Screen reader support, keyboard navigation, and WCAG compliance
- **Mobile Optimized**: Responsive design that works seamlessly on all devices
- **Offline Support**: Continue working even when connectivity is limited
- **Dark/Light Theme**: User preference-based theme switching
- **Smart Validation**: Real-time form validation with helpful error messages
- **Progress Tracking**: Visual indicators for multi-step processes

### Privacy & Security
- **Local Data Storage**: All data stored locally in browser (prototype mode)
- **Encryption Ready**: Built-in encryption services for production deployment
- **Anonymous Analytics**: Privacy-preserving data aggregation
- **Secure File Upload**: Metadata scrubbing and secure file handling
- **Privacy Controls**: Granular control over what information to share

### Technical Features
- **Modern React**: Built with React 18+ and TypeScript
- **Component Library**: Reusable, accessible UI components
- **State Management**: Context-based state management for auth and themes
- **Error Boundaries**: Graceful error handling and recovery
- **Performance Optimized**: Code splitting and optimized bundle size

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/seen.git
   cd seen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## 📱 Usage

### Reporting an Incident
1. Navigate to the "Report" page
2. Follow the guided multi-step form:
   - **Context**: Optional demographic information
   - **Details**: Incident type, description, and tags
   - **Location**: Where and when the incident occurred
   - **Impact**: Effects and desired support
   - **Review**: Confirm and submit

### Viewing Reports
- Access "My Reports" to see all your submitted reports
- Click on any report for detailed view with timeline
- Use the quick view panel for fast browsing

### Exploring Data
- Visit "Explore" for community analytics
- Filter by incident type, location, or time period
- View trends and patterns in aggregated data

## 🛠 Technology Stack

### Frontend
- **React 18+** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Interactive data visualization
- **React Router** - Client-side routing

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting and quality
- **PostCSS** - CSS processing
- **Vercel** - Deployment platform

### Architecture
- **Component-Based**: Modular, reusable components
- **Context API**: State management for auth and themes
- **Service Layer**: Abstracted data and API services
- **Error Boundaries**: Robust error handling

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AccessibilityEnhancements.tsx
│   ├── AuthModal.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── ErrorBoundary.tsx
│   ├── FileUpload.tsx
│   ├── Navigation.tsx
│   └── ...
├── context/            # React context providers
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── pages/              # Page components
│   ├── LandingPage.tsx
│   ├── ReportWizard.tsx
│   ├── MyReports.tsx
│   ├── ExplorePage.tsx
│   └── ...
├── services/           # Data and API services
│   ├── mockReports.ts
│   ├── api.ts
│   ├── encryption.ts
│   └── ...
├── types/              # TypeScript type definitions
└── App.tsx            # Main application component
```

## 🎯 Key Components

### ReportWizard
Multi-step form with:
- Smart validation and error handling
- Auto-save functionality
- Progress tracking
- Accessibility features

### Analytics Dashboard
Interactive charts showing:
- Incident trends over time
- Geographic distribution
- Category breakdowns
- Key insights and patterns

### Support Resources
Context-aware resource finder with:
- Location-based filtering
- Incident type matching
- Contact methods and information
- Integration with report timeline

## 🔒 Privacy & Security

This application is designed with privacy as a core principle:

- **Local Storage**: In prototype mode, all data stays in your browser
- **Anonymized Analytics**: Personal information is never included in aggregated data
- **Encryption Ready**: Built-in services for secure data handling in production
- **User Control**: Granular privacy settings and data control

## 🚧 Development Status

This is a **prototype/demonstration** application showcasing:
- Modern web development practices
- Accessibility-first design
- Privacy-conscious architecture
- Comprehensive feature set for incident reporting

### Current State
- ✅ Full frontend implementation
- ✅ Mock data and local storage
- ✅ All core features functional
- ✅ Responsive design
- ✅ Accessibility compliance

### Production Considerations
For production deployment, consider:
- Backend API integration
- Database setup
- Authentication system
- File storage service
- Security hardening
- Performance monitoring

## 🤝 Contributing

This project welcomes contributions! Areas for enhancement:

- Backend API development
- Additional chart types and analytics
- Enhanced accessibility features
- Mobile app development
- Internationalization
- Performance optimizations

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

Built with modern web technologies and a focus on:
- User privacy and security
- Accessibility and inclusion
- Community empowerment
- Social impact

---

**Note**: This is a prototype application designed to demonstrate modern web development practices and privacy-conscious design. For production use, additional security measures and backend infrastructure would be required.# seen
