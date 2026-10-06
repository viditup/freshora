// Set HOST for where the FastAPI backend runs:
//   Android emulator -> '10.0.2.2'   | iOS simulator -> 'localhost'
//   Real phone       -> your PC's IPv4 from `ipconfig` (same Wi-Fi), e.g. '192.168.x.x'
export const HOST = '10.224.92.215'; // PC's Wi-Fi IPv4 (real phone). Emulator: '10.0.2.2'. Run `ipconfig` if your IP changed.
export const API_URL = `http://${HOST}:8000/api`;

// F1: company / support details used by Help, Contact and the share button. Replace with your real details.
export const SUPPORT_EMAIL = 'support@freshora.com';
export const SUPPORT_PHONE = '+91 00000 00000';
export const COMPANY_ADDRESS = 'Freshora, Your Street, Your City, India';
export const APP_SHARE_TEXT = 'Shop fresh groceries on Freshora - everyday essentials, in minutes.';
