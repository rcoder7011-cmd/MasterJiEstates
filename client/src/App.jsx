import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { muiCache, muiTheme } from './theme/theme.js';
import { AuthProvider } from './context/AuthContext.jsx';
import { FavouritesProvider } from './context/FavouritesContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  return (
    <CacheProvider value={muiCache}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <FavouritesProvider>
              <AppRoutes />
            </FavouritesProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </CacheProvider>
  );
}
