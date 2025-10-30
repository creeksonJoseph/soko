import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Send, Paperclip, Image as ImageIcon, Loader, Check, CheckCheck, Download } from 'lucide-react'
import DashboardNavbar from '../Components/Layout/DashboardNavbar'
import BuyerSidebar from '../Components/Layout/BuyerSidebar'
import { api } from '../services/api'
import { uploadToCloudinary } from '../services/cloudinary'
import { useAuth } from '../context/AuthContext'

const MessagesPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [messageText, setMessageText] = useState('')
  const [selectedConversation, setSelectedConversation] = useState(id ? parseInt(id) : null)
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
    }
  }, [selectedConversation])

  // Mark messages as delivered when conversation is opened
  useEffect(() => {
    if (messages.length > 0) {
      const undeliveredMessages = messages
        .filter(msg => msg.sender !== 'buyer' && msg.status === 'sent')
        .map(msg => msg.id)
      
      if (undeliveredMessages.length > 0) {
        api.notifications.markMessagesAsDelivered(undeliveredMessages)
      }
    }
  }, [messages])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const data = await api.messages.getConversations()
      setConversations(Array.isArray(data) ? data : [])
      
      if (!data || data.length === 0) {
        setSelectedConversation(null)
      } else if (!selectedConversation) {
        setSelectedConversation(data[0].id)
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
      setError('Failed to load conversations')
      setConversations(mockConversations)
      if (!selectedConversation && mockConversations.length > 0) {
        setSelectedConversation(mockConversations[0].id)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId) => {
    try {
      const data = await api.messages.getMessages(conversationId)
      setMessages(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load messages:', error)
      const mockConv = mockConversations.find(c => c.id === conversationId)
      setMessages(mockConv ? mockConv.messages : [])
    }
  }

  const mockConversations = [
    {
      id: 1,
      artisan: {
        id: 1,
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        online: true
      },
      lastMessage: 'Thank you for your purchase!',
      lastMessageTime: '2 hours ago',
      unread: 2,
      messages: [
        {
          id: 1,
          sender: 'artisan',
          text: 'Hi! Thank you for your interest in my ceramic vase.',
          time: '10:30 AM'
        },
        {
          id: 2,
          sender: 'buyer',
          text: 'Hello! Can you tell me more about the glaze used?',
          time: '10:35 AM'
        },
        {
          id: 3,
          sender: 'artisan',
          text: 'Of course! I use a food-safe glaze that I mix myself. It creates that unique blue-green color you see in the photos.',
          time: '10:40 AM'
        },
        {
          id: 4,
          sender: 'buyer',
          text: 'That sounds perfect! I\'ll take it.',
          time: '10:45 AM'
        },
        {
          id: 5,
          sender: 'artisan',
          text: 'Thank you for your purchase! I\'ll ship it out tomorrow.',
          time: '11:00 AM'
        }
      ]
    },
    {
      id: 2,
      artisan: {
        id: 2,
        name: 'John Smith',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        online: false
      },
      lastMessage: 'Your order has been shipped!',
      lastMessageTime: '1 day ago',
      unread: 0,
      messages: [
        {
          id: 1,
          sender: 'buyer',
          text: 'Hi! When will my order ship?',
          time: 'Yesterday 3:00 PM'
        },
        {
          id: 2,
          sender: 'artisan',
          text: 'Your order has been shipped! Tracking number: 1Z999AA10123456784',
          time: 'Yesterday 4:30 PM'
        }
      ]
    }
  ]

  const currentConversation = conversations.find(c => c.id === selectedConversation)
  
  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => 
    conv.artisan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Filter messages based on search
  const filteredMessages = searchQuery ? 
    messages.filter(msg => 
      msg.text.toLowerCase().includes(searchQuery.toLowerCase())
    ) : messages

  const handleFileSelect = (file, type) => {
    setSelectedFile(file)
    if (type === 'image' && file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const clearAttachment = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if ((!messageText.trim() && !selectedFile) || !currentConversation) return
    
    try {
      setSending(true)
      const receiverId = currentConversation.artisan?.id || currentConversation.user_id
      
      let attachmentUrl = null
      if (selectedFile) {
        attachmentUrl = await uploadToCloudinary(selectedFile)
      }
      
      const messageData = {
        receiver_id: receiverId,
        message: messageText.trim() || `Sent ${selectedFile?.type.startsWith('image/') ? 'image' : 'file'}`,
        message_type: selectedFile ? (selectedFile.type.startsWith('image/') ? 'image' : 'file') : 'text',
        attachment_url: attachmentUrl,
        attachment_name: selectedFile?.name
      }
      
      const result = await api.messages.send(receiverId, messageData.message)
      
      const newMessage = {
        id: result.message_data?.id || Date.now(),
        sender: 'buyer',
        text: messageData.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message_type: messageData.message_type,
        attachment_url: attachmentUrl,
        attachment_name: selectedFile?.name,
        status: 'sent'
      }
      setMessages(prev => [...prev, newMessage])
      setMessageText('')
      clearAttachment()
      
      setTimeout(() => loadMessages(selectedConversation), 1000)
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your messages.</p>
          <Link to="/login" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardNavbar />
      <div className="flex flex-col lg:flex-row">
        <BuyerSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-[600px] md:h-[calc(100vh-200px)]">
              <div className="flex h-full flex-col md:flex-row">
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col max-h-48 md:max-h-none">
              <div className="p-4 border-b border-gray-200 space-y-3">
                <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto hidden md:block">
                {loading ? (
                  <div className="p-4 text-center">
                    <Loader className="w-6 h-6 text-primary mx-auto mb-2 animate-spin" />
                    <p className="text-sm text-gray-600">Loading conversations...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-gray-600">No conversations yet</p>
                    <Link to="/explore" className="text-primary hover:text-primary-700 text-sm">
                      Browse products to start chatting with artisans
                    </Link>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`w-full p-3 md:p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                        selectedConversation === conversation.id ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="relative">
                        <img 
                          src={conversation.artisan.avatar} 
                          alt={conversation.artisan.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {conversation.artisan.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-gray-900">{conversation.artisan.name}</p>
                          {conversation.unread > 0 && (
                            <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        <p className="text-xs text-gray-500 mt-1">{conversation.lastMessageTime}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {currentConversation ? (
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={currentConversation.artisan.avatar} 
                      alt={currentConversation.artisan.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <Link 
                        to={`/artisan/${currentConversation.artisan.id}`}
                        className="font-bold text-gray-900 hover:text-primary"
                      >
                        {currentConversation.artisan.name}
                      </Link>
                      <p className="text-sm text-gray-600">
                        {currentConversation.artisan.online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <Link 
                    to={`/artisan/${currentConversation.artisan.id}`}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    View Profile
                  </Link>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {searchQuery && (
                    <div className="text-center py-2">
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {filteredMessages.length} message(s) found
                      </span>
                    </div>
                  )}
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-md ${message.sender === 'buyer' ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            message.sender === 'buyer'
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {message.message_type === 'image' && message.attachment_url ? (
                            <div className="space-y-2">
                              <img 
                                src={message.attachment_url} 
                                alt={message.attachment_name || 'Image'}
                                className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90"
                                onClick={() => window.open(message.attachment_url, '_blank')}
                              />
                              {message.text && message.text !== 'Sent image' && (
                                <p>{message.text}</p>
                              )}
                            </div>
                          ) : message.message_type === 'file' && message.attachment_url ? (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 p-2 bg-black/10 rounded-lg">
                                <Paperclip className="w-4 h-4" />
                                <span className="text-sm truncate">{message.attachment_name}</span>
                                <a 
                                  href={message.attachment_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ml-auto"
                                >
                                  <Download className="w-4 h-4 hover:scale-110 transition-transform" />
                                </a>
                              </div>
                              {message.text && message.text !== 'Sent file' && (
                                <p>{message.text}</p>
                              )}
                            </div>
                          ) : (
                            <p>{message.text}</p>
                          )}
                        </div>
                        <div className={`flex items-center space-x-1 mt-1 ${message.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}>
                          <p className="text-xs text-gray-500">{message.time}</p>
                          {message.sender === 'buyer' && (
                            <div className="text-xs text-gray-500">
                              {message.status === 'read' || message.is_read ? (
                                <CheckCheck className="w-3 h-3 text-blue-500" />
                              ) : message.status === 'delivered' ? (
                                <CheckCheck className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-200">
                  {/* File Preview */}
                  {(selectedFile || previewUrl) && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Attachment:</span>
                        <button
                          onClick={clearAttachment}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="max-w-32 h-auto rounded" />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Paperclip className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{selectedFile?.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                    <div className="flex space-x-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files[0], 'file')}
                      />
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files[0], 'image')}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Attach file"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Attach image"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder={selectedFile ? "Add a caption (optional)..." : "Type your message..."}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage(e)
                          }
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={(!messageText.trim() && !selectedFile) || sending}
                      className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </form>
                  <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default MessagesPage