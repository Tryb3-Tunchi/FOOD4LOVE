/**
 * Message filtering utilities to prevent off-app communication
 */

// Patterns to block in messages
const BLOCKED_PATTERNS = [
  // Phone numbers (various formats)
  /\b(?:\+?234|0)[0-9]{10,}\b/g, // Nigeria +234 or 0xxx
  /\b(?:\+?\d{1,3}[-.\s]?)?\d{3,}[-.\s]?\d{3,}[-.\s]?\d{4,}\b/g, // General phone
  
  // Common messaging apps
  /whatsapp/gi,
  /telegram/gi,
  /signal/gi,
  /viber/gi,
  /skype/gi,
  /discord/gi,
  /slack/gi,
  
  // Email patterns (partial block)
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  
  // URLs/Links
  /(https?|ftp):\/\/[^\s]+/g,
  /www\.[^\s]+/g,
  
  // Bank details patterns
  /(\baccount\s+(?:number|no\.?)|acct)/gi,
  /(\bbank\s+details|\btransfer\s+(?:to|details))/gi,
];

export type FilterResult = {
  isClean: boolean;
  violations: string[];
  cleanedMessage: string;
};

/**
 * Check if a message contains blocked patterns
 */
export function filterMessage(message: string): FilterResult {
  const violations: string[] = [];
  let cleanedMessage = message;
  
  // Check phone numbers (Nigeria specific)
  if (/\b(?:\+?234|0)[0-9]{10,}\b/.test(message)) {
    violations.push("Phone numbers not allowed - stay safe in Food4Love");
    cleanedMessage = cleanedMessage.replace(/\b(?:\+?234|0)[0-9]{10,}\b/g, "[number]");
  }
  
  // Check for messaging apps
  if (/whatsapp|telegram|signal|viber|skype|discord|slack/i.test(message)) {
    violations.push("Off-app messaging services not allowed - use Food4Love chat");
    cleanedMessage = cleanedMessage.replace(/whatsapp|telegram|signal|viber|skype|discord|slack/gi, "[app]");
  }
  
  // Check for URLs
  if (/(https?|ftp):\/\/[^\s]+|www\.[^\s]+/.test(message)) {
    violations.push("Links not allowed - please keep conversations in Food4Love");
    cleanedMessage = cleanedMessage.replace(/(https?|ftp):\/\/[^\s]+|www\.[^\s]+/g, "[link]");
  }
  
  // Check for bank account sharing
  if (/account\s+(?:number|no\.?)|bank\s+details|transfer\s+(?:to|details)/i.test(message)) {
    violations.push("Bank details should not be shared in chat - use secure payment");
    cleanedMessage = cleanedMessage.replace(/account\s+(?:number|no\.?)|bank\s+details|transfer\s+(?:to|details)/gi, "[payment info]");
  }
  
  return {
    isClean: violations.length === 0,
    violations,
    cleanedMessage: cleanedMessage.trim(),
  };
}

/**
 * Check if message would be blocked (for UI disable logic)
 */
export function wouldMessageBeBlocked(message: string): boolean {
  return !filterMessage(message).isClean;
}
