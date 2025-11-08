export const CONTRACTS = {
  TOKEN: '0x7Cfa80f3aAa0FB7880A951eF5B39B930A8DA7e51',
  ESCROW: '0x1431d20901AecF05A8192498E0A7D635F4ca76ea',
  CHAIN_ID: 84532, // Base Sepolia
  CHAIN_ID_HEX: '0x14A34',
  RPC_URL: 'https://sepolia.base.org',
  EXPLORER_URL: 'https://sepolia.basescan.org'
};

export const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)"
];

export const ESCROW_ABI = [
  "function createOrder(address supplier, address validator, uint256 amount) external returns (uint256)",
  "function confirmDelivery(uint256 orderId) external",
  "function withdrawFunds(uint256 orderId) external",
  "function cancelOrder(uint256 orderId) external",
  "function getOrder(uint256 orderId) external view returns (tuple(address purchaser, address supplier, address validator, uint256 amount, uint8 state))",
  "function nextOrderId() external view returns (uint256)",
  "function orders(uint256) external view returns (address purchaser, address supplier, address validator, uint256 amount, uint8 state)",
  "event OrderCreated(uint256 indexed orderId, address indexed purchaser, address indexed supplier, uint256 amount)",
  "event DeliveryConfirmed(uint256 indexed orderId, address indexed validator)",
  "event FundsWithdrawn(uint256 indexed orderId, address indexed supplier, uint256 amount)",
  "event OrderCanceled(uint256 indexed orderId)"
];