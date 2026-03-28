import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { X, Send, Image, Paperclip } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  senderName?: string;
  timestamp: Date;
  imageUrl?: string;
  userId: string;
  read: boolean;
}

const ChatModal = ({ isOpen, onClose, targetUserId }: ChatModalProps) => {
  const { currentUser, userData, isAdmin } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show notification for new messages with feature detection
  const showNotification = (message: Message) => {
    if (message.sender !== (isAdmin ? 'user' : 'support')) return;
    
    const senderName = message.senderName || (message.sender === 'support' ? 'Support Team' : 'User');
    
    // Browser notification with feature detection
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(`New message from ${senderName}`, {
        body: message.text.substring(0, 100) + (message.text.length > 100 ? '...' : ''),
        icon: '/favicon.ico'
      });
    }
    
    // Toast notification
    toast({
      title: `New message from ${senderName}`,
      description: message.text.substring(0, 100) + (message.text.length > 100 ? '...' : ''),
    });
  };

  // Request notification permission with feature detection
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (isOpen && currentUser) {
      const userId = targetUserId || currentUser.uid;
      
      const q = query(
        collection(db, 'supportChats'),
        where('userId', '==', userId),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const chatMessages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        })) as Message[];
        
        // Check for new messages and show notifications
        const newMessages = chatMessages.filter(msg => 
          !messages.find(existingMsg => existingMsg.id === msg.id)
        );
        
        newMessages.forEach(msg => {
          if (messages.length > 0) { // Only show notifications after initial load
            showNotification(msg);
          }
        });
        
        setMessages(chatMessages);
        
        // Mark messages as read
        chatMessages.forEach(async (msg) => {
          if (!msg.read && msg.sender !== (isAdmin ? 'support' : 'user')) {
            try {
              await updateDoc(doc(db, 'supportChats', msg.id), {
                read: true
              });
            } catch (error) {
              console.error('Error marking message as read:', error);
            }
          }
        });
      });

      return () => unsubscribe();
    }
  }, [isOpen, currentUser, targetUserId, isAdmin]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file.",
        variant: "destructive"
      });
      return;
    }

    setSelectedImage(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !currentUser) return;

    setLoading(true);

    try {
      const userId = targetUserId || currentUser.uid;
      const messageText = newMessage.trim();
      const isFromAdmin = targetUserId && isAdmin;
      const senderName = isFromAdmin ? 'Support Team' : userData?.firstName || 'User';
      
      let imageUrl = null;
      
      if (selectedImage) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          imageUrl = reader.result as string;
          
          await addDoc(collection(db, 'supportChats'), {
            userId: userId,
            text: messageText || '',
            sender: isFromAdmin ? 'support' : 'user',
            senderName: senderName,
            timestamp: Timestamp.now(),
            imageUrl: imageUrl,
            read: false
          });

          setNewMessage('');
          clearImage();
          setLoading(false);
          
          toast({
            title: "Message sent",
            description: "Your message has been sent successfully.",
          });
        };
        reader.readAsDataURL(selectedImage);
      } else {
        await addDoc(collection(db, 'supportChats'), {
          userId: userId,
          text: messageText,
          sender: isFromAdmin ? 'support' : 'user',
          senderName: senderName,
          timestamp: Timestamp.now(),
          read: false
        });

        setNewMessage('');
        setLoading(false);
        
        toast({
          title: "Message sent",
          description: "Your message has been sent successfully.",
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[500px] flex flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {targetUserId ? 'Customer Support Chat' : 'Customer Service'}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 border rounded-md bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500">
                <p>Welcome to Customer Service!</p>
                <p>How can we help you today?</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === (isAdmin ? 'support' : 'user') ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === (isAdmin ? 'support' : 'user')
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white border'
                    }`}
                  >
                    {message.imageUrl && (
                      <div className="mb-2">
                        <img 
                          src={message.imageUrl} 
                          alt="Shared image" 
                          className="max-w-full h-auto rounded-md"
                          style={{ maxHeight: '200px' }}
                        />
                      </div>
                    )}
                    {message.text && (
                      <p className="text-sm">{message.text}</p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                      <p className="text-xs opacity-70">
                        {message.senderName || (message.sender === 'support' ? 'Support' : 'You')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {imagePreview && (
            <div className="mt-2 p-2 border rounded-md bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Image to send:</span>
                <Button variant="ghost" size="sm" onClick={clearImage}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-w-full h-auto rounded-md"
                style={{ maxHeight: '100px' }}
              />
            </div>
          )}

          <form onSubmit={sendMessage} className="mt-4">
            <div className="flex gap-2 mb-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 min-h-[40px] max-h-[100px]"
                rows={1}
              />
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  <Image className="h-4 w-4" />
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={loading || (!newMessage.trim() && !selectedImage)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;
