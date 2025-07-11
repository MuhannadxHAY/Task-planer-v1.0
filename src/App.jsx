import React, { useState, useEffect } from 'react';
import './App.css';

// Simple Button Component
const Button = ({ children, onClick, className = "", variant = "default", ...props }) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// Simple Card Component
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
    {children}
  </div>
);

// Simple Input Component
const Input = ({ className = "", ...props }) => (
  <input 
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    {...props}
  />
);

// Gemini AI Integration
const useGeminiAI = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    setIsConnected(!!apiKey);
  }, []);

  const sendMessage = async (message) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return "Please configure your Gemini API key in environment variables.";
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI productivity coach for HAY's Marketing Director. HAY is a neighborhood development company focused on human-centric, community-oriented projects. Current projects include:

1. August digital campaign (critical deadline Aug 1-2) - comprehensive digital marketing for neighborhood showcase
2. Sales office customer journey (critical, 2 weeks) - design complete customer experience
3. November event planning (important, Oct 15) - community engagement event

Context: You understand HAY's "soft developer" positioning, focusing on community building rather than just construction. Provide strategic, actionable advice for marketing and productivity.

User message: ${message}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        return "I'm having trouble generating a response right now. Please try again.";
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      return "I'm having trouble connecting to the AI service. Please check your internet connection and try again.";
    } finally {
      setIsLoading(false);
    }
  };

  return { isConnected, isLoading, sendMessage };
};

// Main App Component
function App() {
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const { isConnected, isLoading, sendMessage } = useGeminiAI();

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = currentMessage;
    setCurrentMessage('');
    
    // Add user message
    setChatMessages(prev => [...prev, {
      type: 'user',
      content: userMessage,
      timestamp: new Date().toLocaleTimeString()
    }]);

    // Get AI response
    const aiResponse = await sendMessage(userMessage);
    
    // Add AI response
    setChatMessages(prev => [...prev, {
      type: 'ai',
      content: aiResponse,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">HAY</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Productivity Dashboard</h1>
                <p className="text-sm text-gray-500">Enhanced with AI Coaching</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{isConnected ? 'Gemini AI Connected' : 'AI Offline'}</span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-3xl font-bold text-gray-900">5</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Items</p>
                <p className="text-3xl font-bold text-red-600">2</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Calendar Events</p>
                <p className="text-3xl font-bold text-purple-600">4</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Est. Hours</p>
                <p className="text-3xl font-bold text-green-600">51h</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Priority Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Priority Tasks</h2>
              <Button variant="outline" className="text-sm">Add Task</Button>
            </div>
            
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4 py-2">
                <h3 className="font-medium text-gray-900">Sales office customer journey</h3>
                <p className="text-sm text-gray-600 mt-1">Design and map the complete customer journey for the sales office experience</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">critical</span>
                  <span className="text-xs text-gray-500">2 weeks</span>
                  <span className="text-xs text-gray-500">8h</span>
                </div>
              </div>

              <div className="border-l-4 border-red-500 pl-4 py-2">
                <h3 className="font-medium text-gray-900">August digital campaign</h3>
                <p className="text-sm text-gray-600 mt-1">Launch comprehensive digital marketing campaign for August neighborhood showcase</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">critical</span>
                  <span className="text-xs text-gray-500">Aug 1-2</span>
                  <span className="text-xs text-gray-500">12h</span>
                </div>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <h3 className="font-medium text-gray-900">November event planning</h3>
                <p className="text-sm text-gray-600 mt-1">Plan and coordinate the November community engagement event</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">important</span>
                  <span className="text-xs text-gray-500">Oct 15</span>
                  <span className="text-xs text-gray-500">15h</span>
                </div>
              </div>
            </div>
          </Card>

          {/* AI Coach */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-gray-900">AI Productivity Coach</h2>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Gemini AI</span>
              </div>
              <Button onClick={() => setShowChat(!showChat)}>
                {showChat ? 'Close Chat' : 'Open Chat'}
              </Button>
            </div>

            {!showChat ? (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Focus Reminder:</strong> You have 2 critical deadlines this week. Consider time-blocking your calendar for deep work sessions.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>Progress Update:</strong> Great job completing the Lemonade agency meeting! Next up: JET task list preparation.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Chat Messages */}
                <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>👋 Hello! I'm your AI productivity coach.</p>
                      <p className="text-sm mt-2">I understand your role as Marketing Director at HAY and your current projects. How can I help you optimize your productivity today?</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs opacity-75 mt-1">{msg.timestamp}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                        <p className="text-sm">Thinking...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex space-x-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about priorities, scheduling, task breakdown..."
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !currentMessage.trim()}
                  >
                    Send
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
            <Button variant="outline">View Full Calendar</Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Team Standup</h3>
                <p className="text-sm text-gray-600">09:00 - 09:30</p>
              </div>
              <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">completed</span>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">JET Task List Session</h3>
                <p className="text-sm text-gray-600">14:00 - 15:00</p>
              </div>
              <span className="px-2 py-1 bg-blue-200 text-blue-700 text-xs rounded-full">current</span>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">August Campaign Brief</h3>
                <p className="text-sm text-gray-600">15:00 - 16:00</p>
              </div>
              <span className="px-2 py-1 bg-yellow-200 text-yellow-700 text-xs rounded-full">upcoming</span>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Client Review Meeting</h3>
                <p className="text-sm text-gray-600">16:30 - 17:30</p>
              </div>
              <span className="px-2 py-1 bg-yellow-200 text-yellow-700 text-xs rounded-full">upcoming</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

export default App;

