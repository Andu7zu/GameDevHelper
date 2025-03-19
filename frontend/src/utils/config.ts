const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
};

// Validate config
Object.entries(config).forEach(([key, value]) => {
  if (!value) {
    console.error(`Missing environment variable: ${key}`);
  }
});

export default config; 