import { createRoot } from 'react-dom/client'
import './index.css';
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from './App.jsx';
import store from './store/store.js';
import { Toaster } from "@/components/ui/toaster.jsx";
import { ThemeProvider } from './contexts/theme-context';
import { WishlistProvider } from './contexts/wishlist-context';

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <ThemeProvider>
        <WishlistProvider>
          <App />
          <Toaster />
        </WishlistProvider>
      </ThemeProvider>
    </Provider>
  </BrowserRouter>
)

