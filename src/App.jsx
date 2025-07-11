import React, { useState, useEffect } from 'react';
import './App.css';
import { Calendar, Clock, CheckCircle, AlertCircle, BarChart3, MessageSquare, Plus, Settings, User, Bell, Search, Filter, Archive, Edit, Trash2, X, Send, Bot, CalendarDays, Users, MapPin, Target, TrendingUp, Activity } from 'lucide-react';

// Environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// HAY Brand Colors
const HAY_COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  accent: '#f59e0b',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  critical: '#dc2626',
  important: '#f59e0b',
  strategic: '#8b5cf6',
  maintenance: '#6b7280'
};

// Sample HAY tasks data
const initialTasks = [
  {
    id: 1,
    title: 'Sales office customer journey',
    description: 'Design and map the complete customer journey for the sales office experience',
    priority: 'critical',
    deadline: '2 weeks',
    estimatedHours: 8,
    status: 'active',
    category: 'Customer Experience'
  },
  {
    id: 2,
    title: 'August digital campaign',
    description: 'Launch comprehensive digital marketing campaign for August neighborhood showcase',
    priority: 'critical',
    deadline: 'Aug 1-2',
    estimatedHours: 12,
    status: 'active',
    category: 'Marketing Campaign'
  },
  {
    id: 3,
    title: 'November event planning',
    description: 'Plan and coordinate the November community engagement event',
    priority: 'important',
    deadline: 'Oct 15',
    estimatedHours: 15,
    status: 'active',
    category: 'Event Management'
  },
  {
    id: 4,
    title: 'Q3 marketing analysis',
    description: 'Analyze Q3 marketing performance and prepare insights for Q4 planning',
    priority: 'strategic',
    deadline: 'Sep 30',
    estimatedHours: 6,
    status: 'active',
    category: 'Analytics'
  },
  {
    id: 5,
    title: 'Website enhancements',
    description: 'Implement user experience improvements and content updates',
    priority: 'maintenance',
    deadline: 'TBD',
    estimatedHours: 10,
    status: 'active',
    category: 'Development'
  }
];

// Sample calendar events
const sampleEvents = [
  { id: 1, title: 'JET Task List Session', time: '14:00 - 15:00', status: 'current' },
  { id: 2, title: 'August Campaign Brief', time: '15:00 - 16:00', status: 'upcoming' },
  { id: 3, title: 'Team Standup', time: '09:00 - 09:30', status: 'completed' },
  { id: 4, title: 'Client Review Meeting', time: '16:30 - 17:30', status: 'upcoming' }
];

// Gemini AI Service
class GeminiAIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  }

  async generateResponse(message, context = {}) {
    if (!this.apiKey) {
      return "I'm having trouble connecting right now. Please check if the Gemini API key is configured.";
    }

    try {
      const prompt = this.buildHAYContextPrompt(message, context);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble generating a response right now.";
    } catch (error) {
      console.error('Gemini AI Error:', error);
      return "I'm experiencing connection issues. Please try again in a moment.";
    }
  }

  buildHAYContextPrompt(message, context) {
    const hayContext = `
You are an AI productivity coach specifically for HAY, a neighborhood development company. 

HAY COMPANY CONTEXT:
- HAY is a "soft developer" focused on human-centric neighborhood development
- Core philosophy: Balance "hard elements" (infrastructure, buildings) with "soft elements" (community, culture, experiences)
- Target market: People seeking authentic, community-focused living experiences
- Brand positioning: Premium but approachable, innovative yet grounded in human values

USER CONTEXT:
- Role: Marketing Director at HAY
- Responsible for: Digital campaigns, community engagement, brand positioning, event planning
- Current priority projects: August digital campaign, sales office customer journey, November community event
- Focus areas: Neighborhood showcase marketing, customer experience design, community building

CURRENT TASKS: ${JSON.stringify(context.tasks || [])}
CALENDAR EVENTS: ${JSON.stringify(context.events || [])}

Provide specific, actionable advice that:
1. Understands HAY's unique positioning as a "soft developer"
2. Considers the user's role as Marketing Director
3. References actual projects and deadlines when relevant
4. Offers strategic marketing insights for neighborhood development
5. Balances business objectives with HAY's human-centric values

USER MESSAGE: ${message}

Respond as a knowledgeable productivity coach who understands both marketing strategy and HAY's specific business model.`;

    return hayContext;
  }
}

// Google Calendar Service
class GoogleCalendarService {
  constructor(clientId, apiKey) {
    this.clientId = clientId;
    this.apiKey = apiKey;
    this.isSignedIn = false;
    this.gapi = null;
  }

  async initialize() {
    if (!this.clientId || !this.apiKey) {
      console.warn('Google Calendar credentials not configured');
      return false;
    }

    try {
      // Load Google API
      await this.loadGoogleAPI();
      await this.gapi.load('auth2', () => {
        this.gapi.auth2.init({
          client_id: this.clientId,
        });
      });
      return true;
    } catch (error) {
      console.error('Google Calendar initialization failed:', error);
      return false;
    }
  }

  loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        this.gapi = window.gapi;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        this.gapi = window.gapi;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async signIn() {
    if (!this.gapi) return false;
    
    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      this.isSignedIn = true;
      return true;
    } catch (error) {
      console.error('Google Calendar sign-in failed:', error);
      return false;
    }
  }

  async getEvents() {
    if (!this.isSignedIn) return [];
    
    try {
      await this.gapi.client.load('calendar', 'v3');
      const response = await this.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
      });
      
      return response.result.items || [];
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      return [];
    }
  }
}

// Main App Component
function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState(initialTasks);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "👋 Hello! I'm your AI productivity coach. I understand your role as Marketing Director at HAY and your current projects. How can I help you optimize your productivity today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    gemini: false,
    calendar: false
  });
  const [calendarEvents, setCalendarEvents] = useState(sampleEvents);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');

  // Initialize services
  const [geminiService] = useState(() => new GeminiAIService(GEMINI_API_KEY));
  const [calendarService] = useState(() => new GoogleCalendarService(GOOGLE_CLIENT_ID, GOOGLE_API_KEY));

  useEffect(() => {
    // Check API connections on mount
    checkConnections();
  }, []);

  const checkConnections = async () => {
    // Check Gemini AI
    const geminiConnected = !!GEMINI_API_KEY;
    
    // Check Google Calendar
    const calendarConnected = !!(GOOGLE_CLIENT_ID && GOOGLE_API_KEY);
    
    setConnectionStatus({
      gemini: geminiConnected,
      calendar: calendarConnected
    });
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);

    try {
      const context = {
        tasks: tasks.filter(t => t.status === 'active'),
        events: calendarEvents
      };
      
      const response = await geminiService.generateResponse(chatInput, context);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm having trouble connecting right now. Please check if the Gemini API key is configured properly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectCalendar = async () => {
    try {
      const initialized = await calendarService.initialize();
      if (initialized) {
        const signedIn = await calendarService.signIn();
        if (signedIn) {
          const events = await calendarService.getEvents();
          setCalendarEvents(events);
          setConnectionStatus(prev => ({ ...prev, calendar: true }));
        }
      }
    } catch (error) {
      console.error('Calendar connection failed:', error);
    }
  };

  const addTask = (taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      status: 'active'
    };
    setTasks(prev => [...prev, newTask]);
    setShowAddTask(false);
  };

  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      
      return matchesSearch && matchesPriority && matchesStatus;
    });
  };

  const getTaskStats = () => {
    const activeTasks = tasks.filter(t => t.status === 'active');
    const criticalTasks = activeTasks.filter(t => t.priority === 'critical');
    const totalHours = activeTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    
    return {
      active: activeTasks.length,
      critical: criticalTasks.length,
      events: calendarEvents.length,
      hours: totalHours
    };
  };

  const stats = getTaskStats();
  const filteredTasks = getFilteredTasks();

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'text-red-600 bg-red-50 border-red-200',
      important: 'text-orange-600 bg-orange-50 border-orange-200',
      strategic: 'text-purple-600 bg-purple-50 border-purple-200',
      maintenance: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[priority] || colors.maintenance;
  };

  const getConnectionStatusDisplay = () => {
    if (connectionStatus.gemini && connectionStatus.calendar) {
      return { text: 'Fully Connected', color: 'text-green-600', icon: CheckCircle };
    } else if (connectionStatus.gemini) {
      return { text: 'Gemini AI Connected', color: 'text-blue-600', icon: Bot };
    } else {
      return { text: 'Offline Mode', color: 'text-gray-600', icon: AlertCircle };
    }
  };

  const connectionDisplay = getConnectionStatusDisplay();
  const ConnectionIcon = connectionDisplay.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">HAY</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Productivity Dashboard</h1>
                  <p className="text-sm text-gray-500">Enhanced with AI Coaching & Calendar Integration</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${connectionDisplay.color}`}>
                <ConnectionIcon className="w-4 h-4" />
                <span>{connectionDisplay.text}</span>
              </div>
              <div className="text-sm text-gray-600">
                <div className="font-medium">Friday, July 11, 2025</div>
                <div className="text-right">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'text-blue-600 border-blue-600' },
              { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'text-purple-600 border-purple-600' },
              { id: 'tasks', label: 'Tasks', icon: CheckCircle, color: 'text-orange-600 border-orange-600' },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'text-green-600 border-green-600' }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive 
                      ? tab.color 
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.id === 'dashboard' && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">1</span>}
                  {tab.id === 'calendar' && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">2</span>}
                  {tab.id === 'tasks' && <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">3</span>}
                  {tab.id === 'analytics' && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">4</span>}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Critical Items</p>
                    <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Calendar Events</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.events}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Est. Hours</p>
                    <p className="text-3xl font-bold text-green-600">{stats.hours}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Google Calendar Integration */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span>Google Calendar Integration</span>
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      connectionStatus.calendar 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {connectionStatus.calendar ? 'Connected' : 'Not Signed In'}
                    </span>
                    {!connectionStatus.calendar && (
                      <button
                        onClick={handleConnectCalendar}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        Connect Calendar
                      </button>
                    )}
                  </div>
                </div>
                
                {!connectionStatus.calendar && (
                  <p className="text-gray-600 mb-4">Please sign in to Google Calendar</p>
                )}
                
                {connectionStatus.calendar && (
                  <div className="space-y-2">
                    <p className="text-sm text-green-600 mb-4">✓ Calendar connected successfully</p>
                    <button
                      onClick={() => setShowCalendarModal(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Full Calendar →
                    </button>
                  </div>
                )}
              </div>

              {/* Priority Tasks */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    <span>Priority Tasks</span>
                  </h3>
                  <button
                    onClick={() => setShowAddTask(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Priority Task</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {tasks.filter(t => t.status === 'active').slice(0, 3).map(task => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{task.deadline}</span>
                            </span>
                            <span className="text-xs text-gray-500 flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{task.estimatedHours}h</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button className="p-1 text-gray-400 hover:text-blue-600">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-orange-600">
                            <Archive className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-green-600">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    View All Tasks
                  </button>
                  <button className="flex-1 bg-blue-100 text-blue-700 py-2 px-4 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                    Prioritize
                  </button>
                  <button className="flex-1 bg-purple-100 text-purple-700 py-2 px-4 rounded-lg text-sm hover:bg-purple-200 transition-colors">
                    Schedule
                  </button>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="flex-1 bg-green-100 text-green-700 py-2 px-4 rounded-lg text-sm hover:bg-green-200 transition-colors"
                  >
                    Open Coach Chat
                  </button>
                </div>
              </div>
            </div>

            {/* AI Coach Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-green-600" />
                  <span>AI Productivity Coach</span>
                  {connectionStatus.gemini && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Gemini AI</span>
                  )}
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Focus Reminder:</strong> You have {stats.critical} critical deadlines this week. Consider time-blocking your calendar for deep work sessions.
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>Progress Update:</strong> Great job completing the Lemonade agency meeting! Next up: JET task list preparation.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  Prioritize
                </button>
                <button className="bg-purple-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-purple-700 transition-colors">
                  Schedule
                </button>
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="bg-green-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  Open Coach Chat
                </button>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
                <button
                  onClick={() => setShowCalendarModal(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Full Calendar
                </button>
              </div>
              
              <div className="space-y-3">
                {calendarEvents.slice(0, 4).map(event => (
                  <div key={event.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      event.status === 'current' ? 'bg-green-500' :
                      event.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-400'
                    }`}></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.time}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      event.status === 'current' ? 'bg-green-100 text-green-800' :
                      event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Calendar View</h2>
              <p className="text-gray-600">Google Calendar-style weekly view</p>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500 py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Calendar Integration</h3>
                <p className="mb-4">Connect your Google Calendar to see your schedule here</p>
                {!connectionStatus.calendar && (
                  <button
                    onClick={handleConnectCalendar}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Connect Google Calendar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Task Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="important">Important</option>
                    <option value="strategic">Strategic</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                    <option value="all">All Status</option>
                  </select>
                </div>
                
                <button
                  onClick={() => setShowAddTask(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            {/* Tasks List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Tasks ({filteredTasks.length})
                </h2>
              </div>
              <div className="divide-y">
                {filteredTasks.map(task => (
                  <div key={task.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{task.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{task.deadline}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{task.estimatedHours}h</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Target className="w-4 h-4" />
                            <span>{task.category}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-6">
                        <button
                          onClick={() => updateTask(task.id, { status: 'completed' })}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Complete"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => updateTask(task.id, { status: 'archived' })}
                          className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                          title="Archive"
                        >
                          <Archive className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Productivity Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.active}</div>
                  <div className="text-sm text-gray-600">Active Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
                  <div className="text-sm text-gray-600">Critical Items</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.hours}h</div>
                  <div className="text-sm text-gray-600">Estimated Work</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">85%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
              </div>
              
              <div className="text-center text-gray-500 py-12">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                <p>Detailed productivity insights and charts coming soon</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-96 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">AI Productivity Coach</h3>
                {connectionStatus.gemini && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Gemini AI</span>
                )}
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map(message => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about priorities, scheduling, task breakdown, or more..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !chatInput.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Add New Task</h3>
              <button
                onClick={() => setShowAddTask(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              addTask({
                title: formData.get('title'),
                description: formData.get('description'),
                priority: formData.get('priority'),
                deadline: formData.get('deadline'),
                estimatedHours: parseInt(formData.get('estimatedHours')) || 0,
                category: formData.get('category')
              });
            }} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="strategic">Strategic</option>
                    <option value="important">Important</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Est. Hours</label>
                  <input
                    type="number"
                    name="estimatedHours"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    type="text"
                    name="deadline"
                    placeholder="e.g., Aug 15, 2 weeks"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    placeholder="e.g., Marketing"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-96">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Weekly Calendar View</h3>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center text-gray-500 py-12">
                <CalendarDays className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Google Calendar Integration</h3>
                <p className="mb-4">Connect your Google Calendar to see your full weekly schedule</p>
                {!connectionStatus.calendar && (
                  <button
                    onClick={handleConnectCalendar}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Connect Google Calendar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

