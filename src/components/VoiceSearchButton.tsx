import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceSearchButtonProps {
  onTranscript: (query: string) => void;
  onNotification: (message: string, type: 'success' | 'info' | 'error') => void;
  className?: string;
  placeholderText?: string;
}

export default function VoiceSearchButton({
  onTranscript,
  onNotification,
  className = '',
  placeholderText = "Écoute en cours... Parlez maintenant",
}: VoiceSearchButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'fr-CI'; // Côte d'Ivoire / French locale

      rec.onstart = () => {
        setIsListening(true);
        onNotification("Microphone activé. Parlez bien en face de votre appareil...", "info");
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          onTranscript(transcript.trim());
          onNotification(`Recherche vocale captée : "${transcript.trim()}" !`, "success");
        } else {
          onNotification("Nous n'avons pas bien compris l'article. Veuillez réessayer.", "error");
        }
      };

      rec.onerror = (event: any) => {
        setIsListening(false);
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          onNotification("Accès au microphone refusé. Activez les permissions média dans votre navigateur.", "error");
        } else if (event.error === 'no-speech') {
          onNotification("Aucun son capté. Veuillez reparler à voix haute.", "info");
        } else {
          onNotification(`Erreur de détection vocale : ${event.error}`, "error");
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } catch (e) {
      console.error('Failed to initialize speech recognition', e);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [onTranscript, onNotification]);

  const toggleListening = () => {
    if (!isSupported) {
      onNotification(
        "La recherche vocale n'est pas supportée par votre navigateur actuel. Préférez Chrome, Safari ou Edge.",
        "error"
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error('Error starting recognition', e);
        // Retry reinstantiating if in bad state
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const rec = new SpeechRecognition();
          rec.continuous = false;
          rec.interimResults = false;
          rec.lang = 'fr-FR';
          rec.onstart = () => setIsListening(true);
          rec.onresult = (event: any) => {
            const trans = event.results[0][0].transcript;
            if (trans) {
              onTranscript(trans.trim());
              onNotification(`Recherche vocale captée : "${trans.trim()}" !`, "success");
            }
          };
          rec.onerror = () => setIsListening(false);
          rec.onend = () => setIsListening(false);
          recognitionRef.current = rec;
          rec.start();
        }
      }
    }
  };

  return (
    <div className="relative flex items-center">
      <button
        id="btn-voice-search"
        type="button"
        onClick={toggleListening}
        title={isSupported ? (isListening ? "Arrêter l'écoute" : "Recherche vocale") : "Microphone non supporté"}
        className={`relative p-2 rounded-xl transition-all flex items-center justify-center shrink-0 border cursor-pointer ${
          !isSupported
            ? 'bg-neutral-100 text-neutral-300 border-neutral-150 cursor-not-allowed opacity-50'
            : isListening
              ? 'bg-rose-500 text-white border-rose-600 shadow-md animate-pulse shadow-rose-200'
              : 'bg-orange-50 hover:bg-[#FED7AA]/35 text-vibrant-orange border-vibrant-border'
        } ${className}`}
      >
        {isListening ? (
          <Mic className="h-4 w-4 animate-bounce" />
        ) : (
          <Mic className="h-4 w-4" />
        )}

        {/* Live radar wave when active listening */}
        {isListening && (
          <span className="absolute -inset-1 rounded-xl bg-rose-500/35 animate-ping -z-10 pointer-events-none"></span>
        )}
      </button>

      {/* Floating status indicator bubble during listening */}
      {isListening && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-800 text-white text-[10px] px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap z-50 animate-fade-in font-medium">
          <Loader2 className="h-3 w-3 animate-spin text-vibrant-orange shrink-0" />
          <span>{placeholderText}</span>
        </div>
      )}
    </div>
  );
}
