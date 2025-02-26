import React, { useState, useEffect, useRef } from "react";
import "./ChatWindow.css";
import axios from "axios";
import { marked } from "marked";

function ChatWindow() {
  const initialMessage = {
    role: "assistant",
    content: "Hi, how can I help you today? You can start by choosing a topic:"
  };

  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [showTopics, setShowTopics] = useState(true); 
  const [showProductPrompt, setShowProductPrompt] = useState(false); 
  const [showQuestionPrompt, setShowQuestionPrompt] = useState(false); 

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (input) => {
    if (input.trim() !== "") {
      setMessages(prevMessages => [...prevMessages, { role: "user", content: input }]);
      setInput("");

      if (showProductPrompt) {
        const partUrl = `https://www.partselect.com/Models/${input}`;
        const newMessage = {
          role: "assistant",
          content: `Here is the link to the part: <a href="${partUrl}" target="_blank">${input}</a>`
        };
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          updatedMessages[updatedMessages.length - 1] = newMessage;
          return updatedMessages;
        });
      } else {
        const tempMessage = { role: "assistant", content: "Thinking..." };
        setMessages(prevMessages => [...prevMessages, tempMessage]);

        try {
          console.log("Sending message to backend:", input);
          const response = await axios.post("http://localhost:5001/api/message", { message: input });
          console.log("Response from backend:", response.data);
          const newMessage = response.data;

          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1] = newMessage;
            return updatedMessages;
          });
        } catch (error) {
          console.error("Error fetching AI message:", error);
          const errorMessage = {
            role: "assistant",
            content: "An error occurred while processing your request. Please try again."
          };
          setMessages(prevMessages => {
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1] = errorMessage;
            return updatedMessages;
          });
        }
      }
    }
  };

  const handleTopicSelection = (topic) => {
    if (topic === "parts") {
      setMessages(prevMessages => [...prevMessages, { role: "assistant", content: "I'd like to help! Please enter the part number." }]);
      setShowProductPrompt(true);
    } else if (topic === "others") {
      setMessages(prevMessages => [...prevMessages, { role: "assistant", content: "Please enter your question:" }]);
      setShowQuestionPrompt(true);
    }
    setShowTopics(false);
  };

  const handleMainMenu = () => {
    setShowTopics(true); 
    setShowProductPrompt(false); 
    setShowQuestionPrompt(false); 
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`${message.role}-message-container`}>
            {message.content && (
              <div className={`message ${message.role}-message`}>
                <div dangerouslySetInnerHTML={{ __html: marked(message.content).replace(/<p>|<\/p>/g, "") }}></div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
        {showTopics && (
          <div className="topic-buttons">
            <button className="topic-button" onClick={() => handleTopicSelection('parts')}>Looking for parts</button>
            <button className="topic-button" onClick={() => handleTopicSelection('others')}>Others</button>
          </div>
        )}
      </div>

      <div className="input-area">
        <button className="main-menu-button" onClick={handleMainMenu}>
          Main Menu
        </button>
        {(showProductPrompt || showQuestionPrompt) && (
          <>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={showProductPrompt ? "Type a part number..." : "Type your question..."}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  handleSend(input);
                  e.preventDefault();
                }
              }}
              rows="3"
            />
            <button className="send-button" onClick={() => handleSend(input)}>
              Send
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ChatWindow;