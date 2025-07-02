# Development Guide

## Admin UI Development

The admin UI has been migrated to a modern Vite + React + TypeScript setup with Tailwind CSS and Shadcn components.

### Quick Start

1. **Install dependencies**:
   ```bash
   cd admin/ui
   npm install
   ```

2. **Development Mode**:
   ```bash
   # Start Vite dev server
   cd admin/ui
   npm run dev
   ```
   
   Then add to your `wp-config.php`:
   ```php
   define('JWT_AUTH_DEV_MODE', true);
   ```

3. **Production Build**:
   ```bash
   cd admin/ui
   npm run build
   ```

### Development Workflow

#### Development Mode (JWT_AUTH_DEV_MODE = true)
- Vite dev server runs on `http://localhost:5173`
- Hot Module Replacement (HMR) for instant updates
- TypeScript error checking
- Source maps for debugging

#### Production Mode (default)
- Loads compiled assets from `admin/ui/dist/`
- Optimized and minified bundles
- Single `main.js` and `main.css` files

### Testing the Dev Server

You can test the dev server independently by:

1. Start the dev server: `npm run dev`
2. Open `admin/ui/test-dev-server.html` in your browser
3. You should see the React app running

### Architecture

- **Vite**: Modern build tool with HMR
- **React 18**: Latest React with modern hooks
- **TypeScript**: Type safety and better IDE support
- **Tailwind CSS**: Utility-first CSS with `jwt-` prefix to avoid conflicts
- **Shadcn**: Accessible, modern UI components
- **WordPress API**: Custom REST API client for WordPress integration

### File Structure

```
admin/ui/
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Root component
│   ├── components/
│   │   ├── ui/                     # Shadcn components
│   │   │   ├── card.tsx
│   │   │   └── switch.tsx
│   │   └── DataSharingOptIn.tsx    # Main feature
│   ├── lib/
│   │   ├── utils.ts                # Utilities
│   │   └── wordpress-api.ts        # WP API client
│   └── styles/
│       └── globals.css             # Global styles
├── dist/                           # Build output
├── package.json
├── vite.config.ts
├── tailwind.config.js              # Tailwind with jwt- prefix
└── tsconfig.json
```

### Troubleshooting

#### "Cannot use import statement outside a module"
- Make sure `JWT_AUTH_DEV_MODE` is set to `true` in wp-config.php
- Ensure Vite dev server is running on localhost:5173
- Check browser console for CORS errors

#### Styles not applying
- Verify Tailwind classes have `jwt-` prefix
- Check that globals.css is imported in main.tsx

#### WordPress API errors
- Check browser network tab for API request errors
- Verify WordPress nonce is being passed correctly
- Ensure user has proper permissions for settings API