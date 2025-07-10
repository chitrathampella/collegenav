// src/utils/speech.js
export const speakText = (text, onEndCallback, onErrorCallback) => {
  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure speech settings
    utterance.volume = 1.0;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Get available voices
    let voices = window.speechSynthesis.getVoices();
    
    // Find a suitable voice
    const englishVoice = voices.find(voice => 
      voice.lang.startsWith('en-') && 
      !voice.name.includes('Microsoft')
    ) || voices.find(voice => 
      voice.lang.startsWith('en-')
    );

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    // Set up error handling
    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      onErrorCallback?.(event);
      window.speechSynthesis.cancel();
    };

    // Set up completion handling
    utterance.onend = () => {
      console.log('Speech completed successfully');
      onEndCallback?.();
    };

    // Ensure speech synthesis is ready
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // Use a timeout to ensure voice is loaded
    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('Speak error:', err);
        onErrorCallback?.(err);
      }
    }, 100);

    return utterance;
  } catch (error) {
    console.error('Speech setup error:', error);
    onErrorCallback?.(error);
    return null;
  }
};

export const stopSpeech = () => {
  try {
    window.speechSynthesis.cancel();
  } catch (error) {
    console.error('Stop speech error:', error);
  }
};

// Add this new utility function
export const testSpeech = () => {
  return new Promise((resolve, reject) => {
    const test = new SpeechSynthesisUtterance('Test speech');
    test.onend = resolve;
    test.onerror = reject;
    window.speechSynthesis.speak(test);
  });
};