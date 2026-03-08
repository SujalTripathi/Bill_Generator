import { useState, useRef, useCallback } from 'react';
import { FiMic } from 'react-icons/fi';

export default function AIInputBox({ onGenerate, loading }) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  const startRecording = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }
      if (transcript) {
        setText((prev) => {
          const separator = prev.trim() ? ' ' : '';
          return prev + separator + transcript;
        });
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleGenerate = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onGenerate(trimmed);
  };

  return (
    <div className="card space-y-4">
      <div>
        <label htmlFor="ai-input" className="label-text">
          Describe your bill in plain language
        </label>
        <div className="relative">
          <textarea
            id="ai-input"
            className="input-field resize-y"
            style={{ minHeight: '200px' }}
            placeholder="Describe your bill... e.g. 'Invoice for Mehta Traders, 5 fans ₹1200 each, 2 ACs ₹35000, 18% GST, buyer in Mumbai, add delivery date and signature'"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* Voice Input Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleRecording}
          disabled={loading}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            isRecording
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {isRecording ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
              </span>
              Listening...
            </>
          ) : (
            <>
              <FiMic className="w-4 h-4" />
              Voice Input
            </>
          )}
        </button>
        {isRecording && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Speak clearly. Click again to stop.
          </span>
        )}
      </div>

      {/* Generate Button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !text.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            AI is reading your bill...
          </>
        ) : (
          'Generate Bill'
        )}
      </button>
    </div>
  );
}
