import { useEffect } from "react";
import { useLocation } from "wouter";

const LAST_ROUTE_KEY = "student99_last_route";

/**
 * Custom hook to track and restore user's last visited route
 * 
 * Behavior:
 * - Saves current route to localStorage on every route change
 * - On app load, if user is at "/" and has a saved route, redirects to saved route
 * - Respects direct URL access (doesn't override deep links)
 * - Works after browser close/reopen and even after removing from recents
 */
export function useRouteTracking() {
    const [location, setLocation] = useLocation();

    useEffect(() => {
        // On mount, check if we should restore the last route
        const lastRoute = localStorage.getItem(LAST_ROUTE_KEY);

        // Only redirect if:
        // 1. User is currently at the homepage "/"
        // 2. There's a saved route in localStorage
        // 3. The saved route is different from current location
        if (location === "/" && lastRoute && lastRoute !== "/") {
            setLocation(lastRoute);
        }
    }, []); // Only run once on mount

    useEffect(() => {
        // Save the current route whenever it changes
        // This runs on every route change after the initial mount
        if (location) {
            localStorage.setItem(LAST_ROUTE_KEY, location);
        }
    }, [location]);
}
