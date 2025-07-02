# Development Troubleshooting Guide

## React DevTools Error

If you see the React DevTools suggestion, this is normal for development. You can install the browser extension for better debugging.

## "Cannot use import statement outside a module"

**Symptoms:**
- Blank page in development mode
- Console error about import statements

**Solutions:**
1. Ensure `JWT_AUTH_DEV_MODE` is set to `true` in `wp-config.php`
2. Make sure Vite dev server is running: `npm run dev`
3. Check that the dev server is accessible at `http://localhost:5173`

## "@vitejs/plugin-react can't detect preamble"

**Symptoms:**
- Error in browser console about React preamble
- Hot reload not working

**Solutions:**
1. Restart the Vite dev server: `npm run dev`
2. Clear browser cache and refresh
3. Check that all React components have proper imports

## CORS Errors

**Symptoms:**
- Failed to load script from localhost:5173
- CORS policy errors

**Solutions:**
1. Make sure WordPress and Vite dev server are both running
2. Try accessing the dev server directly: `http://localhost:5173`
3. Check firewall/network settings

## Development Server Won't Start

**Symptoms:**
- `npm run dev` fails
- Port 5173 is busy

**Solutions:**
1. Check if port 5173 is already in use: `lsof -i :5173`
2. Kill existing process or change port in `vite.config.ts`
3. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Hot Reload Not Working

**Symptoms:**
- Changes don't appear automatically
- Need to manually refresh browser

**Solutions:**
1. Ensure all components are properly exported
2. Check that React imports are correct
3. Restart Vite dev server
4. Clear browser cache

## TypeScript Errors

**Symptoms:**
- Type errors in IDE
- Build warnings

**Solutions:**
1. Run `npm run lint` to check for issues
2. Ensure all types are properly imported
3. Check `tsconfig.json` configuration

## WordPress API Errors

**Symptoms:**
- Settings not saving
- API requests failing

**Solutions:**
1. Check browser network tab for 403/404 errors
2. Verify user has `manage_options` capability
3. Check WordPress nonce is valid
4. Ensure REST API is enabled

## Testing Checklist

Before reporting issues, please test:

1. **Standalone test**: Open `test-dev-server.html` in browser
2. **Production build**: `npm run build` and test with `JWT_AUTH_DEV_MODE = false`
3. **Network tab**: Check for failed HTTP requests
4. **Console**: Look for JavaScript errors
5. **WordPress logs**: Check for PHP errors

## Quick Reset

If everything seems broken:

```bash
# Stop all servers
# Kill any running Vite processes

# Clean reinstall
cd admin/ui
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev

# In wp-config.php
define('JWT_AUTH_DEV_MODE', true);

# Clear browser cache and refresh
```