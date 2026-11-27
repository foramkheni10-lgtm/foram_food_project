import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  defaultTheme,
  getTheme,
  type RestaurantTheme,
} from "./RestaurantTheme";

const API = "http://127.0.0.1:8000";

type ThemeContextType = {
  theme: RestaurantTheme;
  setRestaurantTheme: (theme: RestaurantTheme) => void;
  loadingTheme: boolean;
};

const RestaurantThemeContext =
  createContext<ThemeContextType | undefined>(undefined);

function getRestaurantThemeKey(restaurantId: string) {
  return `restaurantTheme_${restaurantId}`;
}

export function RestaurantThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const location = useLocation();
  const [theme, setTheme] = useState<RestaurantTheme>(defaultTheme);
  const [loadingTheme, setLoadingTheme] = useState(false);

  const setRestaurantTheme = (newTheme: RestaurantTheme) => {
    const safeTheme = getTheme(newTheme);
    setTheme(safeTheme);

    const restaurantId = localStorage.getItem("restaurantId");
    if (restaurantId) {
      localStorage.setItem(
        getRestaurantThemeKey(restaurantId),
        JSON.stringify(safeTheme)
      );
    }
  };

  useEffect(() => {
    let active = true;
    const isAuthPage =
  location.pathname === "/restaurant/login" ||
  location.pathname === "/restaurant/register";

    if (isAuthPage) {
      setTheme(defaultTheme);
      setLoadingTheme(false);
      return () => {
        active = false;
      };
    }

    const restaurantId = localStorage.getItem("restaurantId");

    if (!restaurantId) {
      setTheme(defaultTheme);
      setLoadingTheme(false);
      return () => {
        active = false;
      };
    }

    const storageKey = getRestaurantThemeKey(restaurantId);
    const cachedTheme = localStorage.getItem(storageKey);

    if (cachedTheme) {
      try {
        setTheme(getTheme(JSON.parse(cachedTheme)));
      } catch {
        setTheme(defaultTheme);
      }
    } else {
      setTheme(defaultTheme);
    }

    const loadTheme = async () => {
      setLoadingTheme(true);

      try {
const token = localStorage.getItem("token");

if (!token) {
  console.error("Restaurant authentication token missing");
  return;
}

const response = await axios.get(
  `${API}/api/restaurants/${restaurantId}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

        if (!active) return;

        const savedTheme = getTheme(response.data?.theme);
        setTheme(savedTheme);
        localStorage.setItem(storageKey, JSON.stringify(savedTheme));
      } catch (error) {
        console.error("Unable to load restaurant theme:", error);
      } finally {
        if (active) setLoadingTheme(false);
      }
    };

    loadTheme();

    return () => {
      active = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty("--theme-primary", theme.primaryColor);
    root.style.setProperty("--theme-secondary", theme.secondaryColor);
    root.style.setProperty("--theme-background", theme.backgroundColor);
    root.style.setProperty("--theme-card", theme.cardColor);
    root.style.setProperty("--theme-text", theme.textColor);
    root.style.setProperty(
      "--theme-border",
      `color-mix(in srgb, ${theme.primaryColor} 22%, transparent)`
    );
    root.style.setProperty(
      "--theme-primary-soft",
      `color-mix(in srgb, ${theme.primaryColor} 12%, transparent)`
    );
    root.dataset.restaurantTheme = theme.themeName;
  }, [theme]);

  return (
    <RestaurantThemeContext.Provider
      value={{ theme, setRestaurantTheme, loadingTheme }}
    >
      {children}
    </RestaurantThemeContext.Provider>
  );
}

export function useRestaurantTheme() {
  const context = useContext(RestaurantThemeContext);

  if (!context) {
    throw new Error(
      "useRestaurantTheme must be used inside RestaurantThemeProvider"
    );
  }

  return context;
}