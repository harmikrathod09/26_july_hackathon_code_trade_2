

/**
 * HAMMER PATTERN - Bullish Reversal Signal
 * 
 * A hammer has:
 * - Small body (less than 30% of total range)
 * - Long lower shadow (more than 2x body size)
 * - Small upper shadow (less than body size)
 * 
 * @param {number} open - Opening price
 * @param {number} high - Highest price
 * @param {number} low - Lowest price
 * @param {number} close - Closing price
 * @returns {boolean} - True if hammer pattern detected
 */
export function isHammer(open, high, low, close) {
  // Calculate candle components
  const body = Math.abs(close - open);                    // Body size
  const lowerShadow = Math.min(open, close) - low;       // Lower shadow length
  const upperShadow = high - Math.max(open, close);      // Upper shadow length
  
  // Hammer conditions
  return (
    body < (high - low) * 0.3 &&    //  Small body (< 30% of total range)
    lowerShadow > body * 2 &&       //  Long lower shadow (> 2x body)
    upperShadow < body              //  Small upper shadow (< body)
  );
}

/**
 * DRAGONFLY DOJI PATTERN - Bullish Reversal Signal
 * 
 * A dragonfly doji has:
 * - Very small body (almost no difference between open/close)
 * - Long lower shadow (60% of total range)
 * - Minimal upper shadow (less than 10% of total range)
 * 
 * @param {number} open - Opening price
 * @param {number} high - Highest price
 * @param {number} low - Lowest price
 * @param {number} close - Closing price
 * @returns {boolean} - True if dragonfly doji pattern detected
 */
export function isDragonflyDoji(open, high, low, close) {
  // Calculate candle components
  const body = Math.abs(close - open);                    // Body size
  const lowerShadow = Math.min(open, close) - low;       // Lower shadow length
  const upperShadow = high - Math.max(open, close);      // Upper shadow length
  
  // Dragonfly Doji conditions
  return (
    body < (high - low) * 0.1 &&    //  Very small body (< 10% of total range)
    lowerShadow > (high - low) * 0.6 && //  Long lower shadow (> 60% of total range)
    upperShadow < (high - low) * 0.1    //  Very small upper shadow (< 10% of total range)
  );
}

/**
 * RISING WINDOW PATTERN - Bullish Continuation Signal
 * 
 * A rising window occurs when:
 * - Current candle's low is higher than previous candle's high
 * - Creates a gap up in the chart
 * 
 * @param {Array} data - Array of OHLC data objects
 * @param {number} index - Current candle index
 * @returns {boolean} - True if rising window pattern detected
 */
export function isRisingWindow(data, index) {
  // Check if we have enough data
  if (index === 0) return false;
  
  // Get current and previous candles
  const current = data[index];
  const previous = data[index - 1];
  
  // Rising window condition: Gap up
  return current.low > previous.high;  //  Current low > Previous high
}

/**
 * THREE WHITE SOLDIERS PATTERN - Strong Bullish Signal
 * 
 * Three consecutive bullish candles where:
 * - All three candles are bullish (close > open)
 * - Each opens within the previous candle's body
 * - Each closes higher than the previous candle
 * 
 * @param {Array} data - Array of OHLC data objects
 * @param {number} index - Current candle index (third candle)
 * @returns {boolean} - True if three white soldiers pattern detected
 */
export function isThreeWhiteSoldiers(data, index) {
  // Check if we have enough data (need 3 candles)
  if (index < 2) return false;
  
  // Get the three candles
  const first = data[index - 2];    // First soldier
  const second = data[index - 1];   // Second soldier
  const third = data[index];        // Third soldier
  
  // Condition 1: All three candles are bullish
  const allBullish = first.close > first.open && 
                     second.close > second.open && 
                     third.close > third.open;
  
  // Condition 2: Each opens within previous body
  const opensInBody = second.open > first.open && second.open < first.close &&
                     third.open > second.open && third.open < second.close;
  
  // Condition 3: Each closes higher than previous
  const closesHigher = second.close > first.close && 
                      third.close > second.close;
  
  // All conditions must be met
  return allBullish && opensInBody && closesHigher;
}


/**
 * DETECT PATTERNS - Main function to scan all candles for patterns
 * 
 * This function:
 * 1. Iterates through each candle in the dataset
 * 2. Applies all pattern detection functions
 * 3. Returns enhanced data with detected patterns
 * 
 * @param {Array} data - Array of OHLC data objects
 * @returns {Array} - Enhanced data with pattern information
 */
export function detectPatterns(data) {
  return data.map((d, i) => {
    const patterns = [];
    
    // 🔍 Check for HAMMER pattern
    if (isHammer(d.open, d.high, d.low, d.close)) {
      patterns.push("Hammer");
    }
    
    // 🔍 Check for DRAGONFLY DOJI pattern
    if (isDragonflyDoji(d.open, d.high, d.low, d.close)) {
      patterns.push("Dragonfly Doji");
    }
    
    // 🔍 Check for RISING WINDOW pattern
    if (isRisingWindow(data, i)) {
      patterns.push("Rising Window");
    }
    
    // 🔍 Check for THREE WHITE SOLDIERS pattern
    if (isThreeWhiteSoldiers(data, i)) {
      patterns.push("Three White Soldiers");
    }
    
    // Return enhanced data with pattern information
    return {
      ...d,                                    // Original OHLC data
      patterns: patterns.length > 0 ? patterns : null  // Detected patterns
    };
  });
} 