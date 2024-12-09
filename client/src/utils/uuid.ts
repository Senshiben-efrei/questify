// Check if crypto.randomUUID is available
const hasRandomUUID = typeof crypto !== 'undefined' && 
  typeof crypto.randomUUID === 'function';

// Fallback UUID generator
const generateFallbackUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Export a unified UUID generator function
export const generateUUID = (): string => {
  if (hasRandomUUID) {
    return crypto.randomUUID();
  }
  return generateFallbackUUID();
}; 