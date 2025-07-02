# JWT Auth Admin UI

Modern React-based admin interface for the JWT Authentication plugin.

## Features

- **Modern Stack**: Vite + React + TypeScript + Tailwind CSS
- **Shadcn Components**: Accessible, modern UI components
- **WordPress Integration**: Seamless WordPress REST API integration
- **Development Mode**: Hot module replacement for fast development
- **Prefixed CSS**: All Tailwind classes prefixed with "jwt-" to avoid conflicts

## Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   
   Then in your `wp-config.php`, add:
   ```php
   define('JWT_AUTH_DEV_MODE', true);
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## WordPress Integration

The plugin automatically detects the `JWT_AUTH_DEV_MODE` constant:

- **Development**: Loads assets from Vite dev server (localhost:5173)
- **Production**: Loads compiled assets from `dist/` directory

## File Structure

```
src/
├── main.tsx              # Entry point
├── App.tsx               # Main app component
├── components/
│   ├── ui/               # Shadcn UI components
│   │   ├── card.tsx
│   │   └── switch.tsx
│   └── DataSharingOptIn.tsx  # Main feature component
├── lib/
│   ├── utils.ts          # Utility functions
│   └── wordpress-api.ts  # WordPress REST API client
└── styles/
    └── globals.css       # Global styles with CSS variables
```

## Features

- **Data Sharing Opt-in**: Toggle for users to opt-in to anonymous data sharing
- **WordPress API Integration**: Uses WordPress REST API for settings persistence
- **Responsive Design**: Mobile-friendly interface
- **Loading States**: Proper loading and saving feedback
- **Error Handling**: Graceful error handling with fallbacks