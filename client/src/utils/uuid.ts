// Define global type for Node.js environment
declare const global: {
    crypto?: Crypto;
  } | undefined;
  
  
  // Get the crypto object from window or global scope
  const getCrypto = (): Crypto | undefined => {
    if (typeof window !== 'undefined' && window.crypto) {
      return window.crypto;
    }
    if (typeof global !== 'undefined' && global?.crypto) {
      return global.crypto;
    }
    return undefined;
  };
  
  // Check if crypto.randomUUID is available
  const cryptoAPI = getCrypto();
  const hasRandomUUID = cryptoAPI && typeof cryptoAPI.randomUUID === 'function';
  
  // Fallback UUID generator using crypto.getRandomValues if available
  const generateFallbackUUID = () => {
    const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    
    if (cryptoAPI && typeof cryptoAPI.getRandomValues === 'function') {
      // Use crypto.getRandomValues for better randomness
      return template.replace(/[xy]/g, function(c) {
        const r = cryptoAPI.getRandomValues(new Uint8Array(1))[0] & 15;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    
    // Pure Math.random fallback if no crypto API is available
    return template.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  // Export a unified UUID generator function
  export const generateUUID = (): string => {
    if (hasRandomUUID && cryptoAPI) {
      try {
        return cryptoAPI.randomUUID();
      } catch (e) {
        console.warn('crypto.randomUUID failed, falling back to manual generation');
      }
    }
    return generateFallbackUUID();
  }; 