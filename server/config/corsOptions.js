// Server CORS configuration options
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://masterjiestates.in',
  'https://www.masterjiestates.in',
];

if (process.env.CLIENT_URL && !defaultAllowedOrigins.includes(process.env.CLIENT_URL)) {
  defaultAllowedOrigins.push(process.env.CLIENT_URL);
}

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
    if (!origin || defaultAllowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Blocked by Cross-Origin Resource Sharing (CORS) policy: Origin "${origin}" not allowed`));
    }
  },
  credentials: true, // Allow cookies and HTTP authentication headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'x-csrf-token',
  ],
  exposedHeaders: ['X-CSRF-Token', 'x-csrf-token'],
  optionsSuccessStatus: 200,
};
