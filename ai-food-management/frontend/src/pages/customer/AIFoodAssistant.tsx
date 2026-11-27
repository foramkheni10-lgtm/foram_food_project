import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  const [isSpeaking, setIsSpeaking] = useState(false);

  const navigate = useNavigate();
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "assistant",
      text: "Hello! Welcome to Smart FoodCourt. I'm your AI food assistant. Tell me what you would like to eat!",
    },
  ]);

  const addToCart = async (food: FoodRecommendation) => {
    const token = localStorage.getItem("smartfoodcourt_token");

    if (!token) {
      alert("Please login first to add items to your cart.");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/cart/items",
        { food_id: food.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`${food.name} added to cart successfully!`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.detail ||
            "Unable to add item to cart. Please try again."
        );
      } else {
        alert("Unable to add item to cart. Please try again.");
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
      requestControllerRef.current?.abort();

      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
        audioRef.current = null;
      }
    };
  }, []);

  const stopAudio = () => {
    window.speechSynthesis?.cancel();

    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }

    setIsSpeaking(false);
  };

  const speakResponse = async (text: string) => {
    if (!voiceEnabled) return;

    stopAudio();

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/ai-assistant/avatar/speak",
        { text },
        {
          responseType: "blob",
          timeout: 120000,
        }
      );

      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);

      audioRef.current = audio;
      setIsSpeaking(true);

      const cleanup = () => {
        if (audioRef.current === audio) {
          audioRef.current = null;
          setIsSpeaking(false);
        }

        URL.revokeObjectURL(audioUrl);
      };

      audio.onended = cleanup;
      audio.onerror = cleanup;

      await audio.play();
    } catch (error) {
      setIsSpeaking(false);
      console.error("AI assistant voice error:", error);
    }
  };

  const stopAIResponse = () => {
    requestIdRef.current += 1;
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;

    stopAudio();
    setIsLoading(false);
  };

  const sendMessage = async () => {
    const text = message.trim();

    if (!text) return;

    stopAudio();
    requestControllerRef.current?.abort();

    const currentRequestId = ++requestIdRef.current;
    const controller = new AbortController();

    requestControllerRef.current = controller;

    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        sender: "customer",
        text,
      },
    ]);

    setMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post<ChatResponse>(
        API_URL,
        { message: text },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 130000,
          signal: controller.signal,
        }
      );

      if (currentRequestId !== requestIdRef.current) return;

      const data = response.data;

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          sender: "assistant",
          text: data.reply,
          recommendations: data.recommendations || [],
        },
      ]);

      void speakResponse(data.reply);
    } catch (error: unknown) {
      if (axios.isCancel(error)) return;

      if (currentRequestId !== requestIdRef.current) return;

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
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
        requestControllerRef.current = null;
      }
    }
  };

  const startVoiceInput = () => {
    const speechWindow = window as SpeechWindow;

    const SpeechRecognition =
      speechWindow.SpeechRecognition ||
      speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported. Please use Google Chrome.");
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
        previous ? `${previous} ${transcript}` : transcript
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

  const closeAssistant = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;

    setIsListening(false);

    stopAudio();
    setIsOpen(false);
  };

  return (
    <>
      {/* AI Assistant button stays in the homepage header. */}
      <button
        className="sf-ai-button"
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-label="Toggle AI Assistant"
      >
        <span>✨</span>
        AI Assistant
      </button>

      {/* Portal prevents the chat window from being clipped by the header. */}
      {isOpen &&
        createPortal(
          <div
            className="ai-chat-window"
            role="dialog"
            aria-label="Smart Food Assistant"
          >
            {/* CHAT HEADER */}
            <div className="ai-chat-header">
              <div className="ai-header-info">
                <div className={`ai-avatar ${isSpeaking ? "speaking" : ""}`}>
                  <img
                    src="/images/male-ai-assistant.png"
                    alt="Male AI Assistant"
                  />
                  <span className="avatar-mouth"></span>
                </div>

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
                    setVoiceEnabled((previous) => {
                      const next = !previous;

                      if (!next) {
                        stopAudio();
                      }

                      return next;
                    });
                  }}
                  title={
                    voiceEnabled ? "Turn off AI voice" : "Turn on AI voice"
                  }
                  aria-label={
                    voiceEnabled ? "Turn off AI voice" : "Turn on AI voice"
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
                  <div className={`ai-message ${item.sender}`}>
                    {item.text}
                  </div>

                  {/* FOOD RECOMMENDATION CARDS */}
                  {item.recommendations &&
                    item.recommendations.length > 0 && (
                      <div className="ai-recommendations">
                        <h4>Recommended for you</h4>

                        {item.recommendations.map((food) => (
                          <div className="ai-food-card" key={food.id}>
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

                              <button
                                type="button"
                                className="ai-add-cart-button"
                                onClick={() => void addToCart(food)}
                              >
                                Add to Cart
                              </button>
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
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void sendMessage();
                  }
                }}
                disabled={isLoading}
                aria-label="Message for AI assistant"
              />

              <button
                type="button"
                className="ai-send-button"
                onClick={() => {
                  if (isLoading) {
                    stopAIResponse();
                  } else {
                    void sendMessage();
                  }
                }}
                disabled={!isLoading && !message.trim()}
                aria-label={isLoading ? "Stop AI response" : "Send message"}
              >
                {isLoading ? "■" : "➤"}
              </button>
            </div>

            <p className="ai-voice-hint">
              {isListening
                ? "Listening to your voice..."
                : "🎤 Speak your request or type your message"}
            </p>
          </div>,
          document.body
        )}
    </>
  );
}

export default AIFoodAssistant;