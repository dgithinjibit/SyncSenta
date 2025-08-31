import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Message } from '../types';
import type { Chat } from '@google/genai';
import { createTutorChat } from '../services/geminiService';
import { SparklesIcon } from './icons';

interface AiTutorProps {
  resourceLevel: 'high' | 'low';
}

export const AiTutor: React.FC<AiTutorProps> = ({ resourceLevel }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = useCallback(async () => {
    try {
      const resourceContext = resourceLevel === 'low'
        ? "The student's school has limited physical resources like textbooks. Adapt your teaching style to use storytelling, real-world examples, and imagination. Prioritize suggesting digital resources from Edusaathi's free library when appropriate."
        : "The student has access to all necessary school resources.";
      
      const chatSession = createTutorChat(resourceContext);
      setChat(chatSession);

      const welcomeMessage = resourceLevel === 'low'
        ? "Hello! I'm Mwalimu AI. I understand you might not have all the textbooks, but we can explore amazing topics together using stories and the world around us. What would you like to learn about today?"
        : "Hello! I'm Mwalimu AI, your personal Socratic tutor. What topic would you like to explore today?";

      setMessages([{ sender: 'ai', text: welcomeMessage }]);
    } catch (error) {
        console.error("Failed to initialize chat:", error);
        setMessages([
            { sender: 'ai', text: "Sorry, I'm having trouble connecting right now. Please check the API key configuration and refresh the page." },
        ]);
    } finally {
        setIsLoading(false);
    }
  }, [resourceLevel]);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  const sendMessage = async () => {
    if (!input.trim() || !chat) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chat.sendMessage({ message: input });
      const aiMessage: Message = { sender: 'ai', text: response.text };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = { sender: 'ai', text: 'I seem to be having trouble thinking. Please try again.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full bg-white rounded-lg shadow-md">
      <div className="p-4 border-b flex items-center">
        <SparklesIcon className="w-6 h-6 mr-2 text-indigo-500" />
        <h2 className="text-xl font-semibold text-slate-800">Mwalimu AI Tutor</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md lg:max-w-2xl px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-800'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && messages.length > 0 && (
           <div className="flex justify-start">
             <div className="max-w-md px-4 py-2 rounded-lg bg-slate-200 text-slate-800 flex items-center">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about anything..."
            className="flex-grow p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-slate-100"
            disabled={isLoading || !chat}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim() || !chat}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};