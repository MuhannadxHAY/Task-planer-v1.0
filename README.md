# HAY Productivity Dashboard - Enhanced

A professional productivity dashboard designed specifically for HAY's Marketing Director, featuring intelligent AI coaching and Google Calendar integration.

## ✅ Working Features

### 🤖 Gemini AI Integration
- **Intelligent coaching** with HAY business context
- **Context-aware responses** based on your marketing role
- **Task prioritization** and schedule optimization
- **HAY-specific insights** for neighborhood development marketing
- **Real-time chat** with strategic business advice

### 📋 Advanced Task Management
- **Priority levels**: Critical, Important, Strategic, Maintenance
- **Task editing** and archiving capabilities
- **Search and filtering** by priority and status
- **Progress tracking** with estimated hours
- **Professional task categories**

### 📅 Google Calendar Integration
- **OAuth 2.0 authentication** (ready for setup)
- **Calendar event synchronization**
- **Google Calendar-style interface**
- **Meeting scheduling assistance**

### 📊 Professional Dashboard
- **Real-time analytics** and progress tracking
- **HAY branding** throughout the interface
- **Responsive design** for all devices
- **Professional UI/UX** with modern components

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone [your-repository-url]
cd hay-productivity-dashboard
npm install
```

### 2. Environment Setup
```bash
# Copy the environment template
cp .env.example .env

# Add your API keys to .env file
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_API_KEY=your_google_api_key_here
```

### 3. Development
```bash
# Start development server
npm run dev

# Build for production
npm run build
```

## 🔧 API Setup

### Gemini AI Setup
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add to `.env` as `VITE_GEMINI_API_KEY`

### Google Calendar Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized JavaScript origins: `https://your-vercel-domain.vercel.app`
   - Authorized redirect URIs: `https://your-vercel-domain.vercel.app`
5. Create API Key (restrict to Calendar API)
6. Add credentials to `.env`

## 🌐 Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_GEMINI_API_KEY`
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_GOOGLE_API_KEY`
4. Deploy automatically

### Environment Variables in Vercel
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add each variable for Production, Preview, and Development
4. Redeploy after adding variables

## 🎯 Features Overview

### AI Coaching Capabilities
- **"Help me prioritize my tasks"** → Strategic task prioritization
- **"Optimize my schedule"** → Time-blocking recommendations
- **"Break down the August campaign"** → Project planning assistance
- **"When should I schedule meetings?"** → Optimal timing suggestions

### Task Management
- Create, edit, archive, and complete tasks
- Priority-based filtering and search
- Estimated hours tracking
- Category organization
- Progress analytics

### Calendar Integration
- Real-time Google Calendar sync
- Professional weekly view
- Meeting scheduling assistance
- Time-blocking suggestions

## 🏢 HAY-Specific Features

### Business Context
- **Neighborhood development** marketing insights
- **"Soft developer"** positioning guidance
- **Community-focused** campaign strategies
- **Human-centric** brand philosophy integration

### Marketing Director Tools
- **Campaign planning** assistance
- **Customer journey** optimization
- **Event planning** coordination
- **Performance analytics** tracking

## 🔒 Security

- Environment variables for API keys
- No sensitive data in client-side code
- OAuth 2.0 for Google Calendar authentication
- Secure API communication

## 📱 Responsive Design

- **Desktop**: Full-featured dashboard experience
- **Tablet**: Optimized layout with touch support
- **Mobile**: Streamlined interface for on-the-go access

## 🛠️ Tech Stack

- **React 18** with Vite
- **Tailwind CSS** for styling
- **Lucide Icons** for UI elements
- **Google Gemini AI** for intelligent coaching
- **Google Calendar API** for calendar integration
- **Modern JavaScript** (ES6+)

## 📞 Support

For issues or questions:
1. Check environment variables are properly set
2. Verify API keys are valid and have proper permissions
3. Ensure Vercel deployment has all required environment variables
4. Check browser console for any error messages

## 🎉 Success Indicators

When properly configured, you should see:
- ✅ "Gemini AI Connected" status in top right
- ✅ Intelligent AI responses in chat
- ✅ Google Calendar connection (if configured)
- ✅ All dashboard features functional

---

**Built specifically for HAY's Marketing Director role with intelligent AI coaching and professional productivity tools.**

