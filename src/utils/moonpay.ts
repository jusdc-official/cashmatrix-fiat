// src/utils/moonpay.ts
const MOONPAY_SANDBOX_URL = "https://sandbox.moonpay.com";
const MOONPAY_API_KEY = "YOUR_SANDBOX_PUBLISHABLE_KEY"; // replace with your actual sandbox key

/**
 * Builds the MoonPay purchase URL for a specific token and wallet address
 */
export function getMoonPayUrl(tokenSymbol: string, walletAddress: string) {
  const baseUrl = `${MOONPAY_SANDBOX_URL}/buy`;
  const params = new URLSearchParams({
    apiKey: MOONPAY_API_KEY,
    currencyCode: tokenSymbol.toLowerCase(),
    walletAddress: walletAddress,
    redirectURL: "https://jusdc.io/success", // replace with your frontend callback URL
    colorCode: "#1A1A1A",
  });
  return `${baseUrl}?${params.toString()}`;
}
