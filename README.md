# Seen - Racial Discrimination Documentation Platform

A conceptual frontend-only application for documenting and visualizing racial discrimination and bias incidents.

## 🎯 Project Overview

**Seen** is a prototype web application designed to provide a safe, empathetic space where people can document experiences of racial discrimination and bias. The platform aims to:

- Validate individual experiences through collective data
- Make patterns of discrimination visible to communities
- Provide evidence for advocacy and policy discussions
- Create a historical record of discrimination
- Connect people with resources and support

**⚠️ Important:** This is a **prototype/demonstration application**. All data is stored locally in the browser and not transmitted to any servers. This is not intended for production use or real incident reporting.

## 🚀 Features

### Core Functionality

1. **Landing Page**
   - Clear mission statement and value proposition
   - "How It Works" section with 3-step visual guide
   - Privacy and impact messaging
   - Call-to-action buttons

2. **Multi-Step Report Wizard** (5 Steps)
   - **Step 1: Context** - Optional demographic information with privacy controls
   - **Step 2: Incident Details** - Type, title, narrative, and tags
   - **Step 3: Location & Timing** - Where and when the incident occurred
   - **Step 4: Impact & Follow-up** - Effects and desired support
   - **Step 5: Review** - Summary and submission

3. **My Reports Dashboard**
   - View all submitted reports (requires mock sign-in)
   - Detailed report view with all information
   - Empty state for new users
   - Success messaging after submission

4. **Explore/Analytics Page**
   - Interactive charts showing aggregated data:
     - Bar chart: Incidents by type
     - Line chart: Incidents over time
     - Horizontal bar chart: Top locations
   - Filter by incident type
   - Summary statistics
   - Key insights and impact messaging

5. **About/Safety Page**
   - Mission statement and values
   - Privacy and safety commitments
   - Comprehensive FAQ with accordion UI
   - Support resources and links
   - Prototype disclaimer

### Technical Features

- **Theme Toggle** - Light/dark mode with system preference detection
- **Mock Authentication** - Simple sign-in/sign-out for demonstration
- **Responsive Design** - Mobile-first approach, works on all screen sizes
- **Local Storage** - Reports persist in browser storage
- **Mock API Layer** - Simulates backend with delays for realistic UX
- **TypeScript** - Full type safety throughout the application
- **Accessible UI** - Keyboard navigation and ARIA labels

## 🛠️ Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **State Management:** React Context API + Hooks
- **Data Storage:** Browser LocalStorage (mock backend)

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ and npm

### Installation Steps

1. **Navigate to the project directory:**
   ```bash
   cd seen
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📁 Project Structure

```
seen/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Chip.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Footer.tsx
│   │   ├── Layout.tsx
│   │   ├── Navigation.tsx
│   │   └── Stepper.tsx
│   ├── context/            # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── pages/              # Main page components
│   │   ├── AboutPage.tsx
│   │   ├── ExplorePage.tsx
│   │   ├── LandingPage.tsx
│   │   ├── MyReports.tsx
│   │   └── ReportWizard.tsx
│   ├── services/           # Mock API services
│   │   └── mockReports.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles with Tailwind
├── public/                 # Static assets
├── index.html              # HTML template
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies and scripts
```

## 🎨 Design Principles

### UX/UI Guidelines

1. **Safe & Empathetic**
   - Warm color palette (muted golds and teals)
   - Supportive microcopy throughout
   - Clear privacy messaging
   - No blame or questioning language

2. **User Control**
   - All demographic fields optional
   - Privacy toggle for sensitive information
   - Clear data ownership messaging
   - Easy navigation and editing

3. **Accessible**
   - WCAG compliant color contrasts
   - Keyboard navigation support
   - Screen reader friendly
   - Clear focus states

4. **Responsive**
   - Mobile-first design
   - Collapsible navigation on small screens
   - Touch-friendly interactive elements
   - Optimized layouts for all screen sizes

## 🔐 Privacy & Security Notes

### Current Implementation (Prototype)

- All data stored in browser's LocalStorage
- No server communication
- No real authentication
- No encryption
- Data persists until browser storage is cleared

### Production Requirements

A production version would require:

- End-to-end encryption
- Secure authentication (OAuth, 2FA)
- Database with proper access controls
- Data anonymization pipelines
- Regular security audits
- GDPR/privacy law compliance
- Partnership with civil rights organizations
- Legal review and compliance
- Incident response procedures
- Data retention policies

## 🚧 Known Limitations

This is a **prototype** with the following limitations:

1. **No Real Backend** - All data is local only
2. **Mock Authentication** - No real user accounts or security
3. **Limited Data Validation** - Basic client-side validation only
4. **No Real Analytics** - Charts use hard-coded mock data
5. **No Map Integration** - Map visualization is a placeholder
6. **No Email/Notifications** - Contact features are conceptual
7. **No Legal Compliance** - Not reviewed for legal requirements
8. **No Production Security** - Not hardened for real-world use

## 🔮 Future Enhancements

For a production version, consider:

### Technical
- Real backend API with database
- User authentication and authorization
- Data encryption and security measures
- Real-time analytics processing
- Map integration (e.g., Mapbox, Google Maps)
- Email notifications and support
- Mobile app versions (React Native)
- Offline support with sync
- Multi-language support

### Features
- Advanced filtering and search
- Export reports (PDF, CSV)
- Community forums or support groups
- Resource directory
- Legal aid connections
- Advocate/organization accounts
- Data visualization dashboard for organizations
- Anonymous public story sharing (opt-in)
- Impact tracking and reporting

### Operational
- Partnership with civil rights organizations
- Legal review and compliance
- Privacy policy and terms of service
- Content moderation system
- Support team and resources
- Community guidelines
- Regular security audits
- Incident response procedures

## 📝 License

This is a prototype/demonstration project. For production use, appropriate licensing and legal review would be required.

## 🤝 Contributing

This is a demonstration project. For a production version, contributions would need to be coordinated with civil rights organizations and legal experts.

## 📧 Contact

This is a conceptual prototype created for demonstration purposes.

## 🙏 Acknowledgments

This project concept is inspired by the need for better tools to document and address systemic discrimination. It acknowledges the work of civil rights organizations, advocates, and communities fighting for justice and equity.

---

**Remember:** This is a prototype for demonstration purposes only. Do not use this for actual incident reporting that requires official documentation or legal action. If you've experienced discrimination, please contact appropriate authorities and support organizations.
