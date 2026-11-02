
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./AIFoodAssistant.css";

interface FoodRecommendation {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number | null;
  spice_level: string | null;
}

interface Message {
  id: number;
  sender: "customer" | "assistant";
  text: string;
  recommendations?: FoodRecommendation[];
}

interface ChatResponse {
  reply: string;
  recommendations: FoodRecommendation[];
  budget?: number | null;
  people_count?: number;
}

interface SpeechResult {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechResult) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
}

const API_URL = "http://127.0.0.1:8000/api/ai-assistant/chat";

function AIFoodAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "assistant",
      text: "Hello! Welcome to Smart FoodCourt. I'm your AI food assistant. Tell me what you would like to eat!",
    },
  ]);

  // Automatically scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // Stop microphone and speech when component is removed
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Speak AI response
  const speakResponse = (text: string) => {
    if (!voiceEnabled || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-IN";
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  };

  // Send customer message to FastAPI backend
  const sendMessage = async () => {
    const text = message.trim();

    if (!text || isLoading) {
      return;
    }

    const customerMessage: Message = {
      id: Date.now(),
      sender: "customer",
      text,
    };

    setMessages((previous) => [
      ...previous,
      customerMessage,
    ]);

    setMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post<ChatResponse>(
        API_URL,
        {
          message: text,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 130000,
        }
      );

      const data = response.data;

      const assistantMessage: Message = {
        id: Date.now() + 1,
        sender: "assistant",
        text: data.reply,
        recommendations: data.recommendations || [],
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);

      // Speak the AI response
      speakResponse(data.reply);

    } catch (error) {
      console.error("AI Assistant Error:", error);

      let errorMessage =
        "Sorry, I couldn't connect to the AI assistant. Please try again.";

      if (axios.isAxiosError(error)) {
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.code === "ECONNABORTED") {
          errorMessage =
            "The AI is taking too long to respond. Please try again.";
        } else if (!error.response) {
          errorMessage =
            "Cannot connect to the backend. Please check whether FastAPI is running.";
        }
      }

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 2,
          sender: "assistant",
          text: errorMessage,
        },
      ]);

    } finally {
      setIsLoading(false);
    }
  };

  // Start voice input
  const startVoiceInput = () => {
    const speechWindow = window as SpeechWindow;

    const SpeechRecognition =
      speechWindow.SpeechRecognition ||
      speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported. Please use Google Chrome."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;

      setMessage((previous) =>
        previous
          ? `${previous} ${transcript}`
          : transcript
      );
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
      alert("Could not recognize your speech. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognitionRef.current = recognition;
      setIsListening(true);
      recognition.start();
    } catch (error) {
      console.error("Microphone Error:", error);
      setIsListening(false);
      recognitionRef.current = null;
      alert("Unable to start microphone. Please try again.");
    }
  };

  // Close chatbot
  const closeAssistant = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    window.speechSynthesis?.cancel();
    setIsOpen(false);
  };

  return (
    <>
      {/* AI ASSISTANT HEADER BUTTON */}
      <button
        className="sf-ai-button"
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <span>✨</span>
        AI Assistant
      </button>

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="ai-chat-window">

          {/* CHAT HEADER */}
          <div className="ai-chat-header">
            <div className="ai-header-info">
              <div className="ai-avatar">AI</div>

              <div>
                <h3>Smart Food Assistant</h3>
                <p>
                  <span className="ai-online-dot"></span>
                  Your personal food assistant
                </p>
              </div>
            </div>

            <div className="ai-header-actions">
              <button
                type="button"
                className={`ai-voice-toggle ${
                  voiceEnabled ? "active" : ""
                }`}
                onClick={() => {
                  setVoiceEnabled((previous) => !previous);
                  window.speechSynthesis?.cancel();
                }}
                title={
                  voiceEnabled
                    ? "Turn off AI voice"
                    : "Turn on AI voice"
                }
              >
                {voiceEnabled ? "🔊" : "🔇"}
              </button>

              <button
                className="ai-close-button"
                type="button"
                onClick={closeAssistant}
                aria-label="Close assistant"
              >
                ×
              </button>
            </div>
          </div>

          {/* CHAT MESSAGES */}
          <div className="ai-chat-messages">

            {messages.map((item) => (
              <div
                key={item.id}
                className={`ai-message-wrapper ${item.sender}`}
              >
                <div
                  className={`ai-message ${item.sender}`}
                >
                  {item.text}
                </div>

                {/* FOOD RECOMMENDATION CARDS */}
                {item.recommendations &&
                  item.recommendations.length > 0 && (
                    <div className="ai-recommendations">

                      <h4>Recommended for you</h4>

                      {item.recommendations.map((food) => (
                        <div
                          className="ai-food-card"
                          key={food.id}
                        >
                          <div className="ai-food-details">
                            <h5>{food.name}</h5>

                            <p className="ai-food-category">
                              {food.category}
                            </p>

                            <p className="ai-food-description">
                              {food.description}
                            </p>

                            <div className="ai-food-bottom">
                              <span className="ai-food-price">
                                {food.price !== null &&
                                food.price !== undefined
                                  ? `₹${food.price}`
                                  : "Price unavailable"}
                              </span>

                              {food.spice_level && (
                                <span className="ai-spice-level">
                                  {food.spice_level}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                    </div>
                  )}
              </div>
            ))}

            {/* LOADING INDICATOR */}
            {isLoading && (
              <div className="ai-message-wrapper assistant">
                <div className="ai-message assistant ai-loading">
                  <span></span>
                  <span></span>
                  <span></span>
                  <small>Finding delicious food...</small>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

          {/* INPUT AREA */}
          <div className="ai-chat-input">

            <button
              type="button"
              className={`ai-mic-button ${
                isListening ? "listening" : ""
              }`}
              onClick={startVoiceInput}
              title="Speak your message"
              aria-label="Start voice input"
              disabled={isLoading}
            >
              {isListening ? "🔴" : "🎤"}
            </button>

            <input
              type="text"
              value={message}
              placeholder={
                isListening
                  ? "Listening..."
                  : "Type or speak your food request..."
              }
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void sendMessage();
                }
              }}
              disabled={isLoading}
            />

            <button
              type="button"
              className="ai-send-button"
              onClick={() => void sendMessage()}
              disabled={!message.trim() || isLoading}
            >
              {isLoading ? "..." : "Send"}
            </button>

          </div>

          <p className="ai-voice-hint">
            {isListening
              ? "Listening to your voice..."
              : "🎤 Speak your request or type your message"}
          </p>

        </div>
      )}
    </>
  );
}

export default AIFoodAssistant;
