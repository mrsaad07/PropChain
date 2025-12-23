// HARDCODED SAFE CONVERSION FOR DEMO
// We set an extremely low exchange rate so users NEVER run out of ETH in the demo.

export const getEthPriceInTry = async () => {
  return 100000; // Mock display price: 1 ETH = 100,000 TL
};

export const calculateWeiFromTry = async (tryAmount) => {
  // ULTRA LOW DEMO RATE: 1 TL = 0.00000001 ETH
  // 1.000.000 TL = 0.01 ETH
  // 5.000.000 TL = 0.05 ETH
  // With 100 ETH balance, you can buy the whole city.
  
  const FIXED_RATE = 0.00000001; 
  
  const simulatedEthAmount = tryAmount * FIXED_RATE;
  
  // Real market value for display purposes only
  const realEthAmount = tryAmount / 100000; 

  return {
    ethPrice: 100000,
    realEthAmount,
    simulatedEthAmount
  };
};