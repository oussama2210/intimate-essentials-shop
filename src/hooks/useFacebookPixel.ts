import { useCallback } from 'react';

export const useFacebookPixel = () => {
    const trackEvent = useCallback((eventName: string, data?: any) => {
        if (typeof window.fbq !== 'undefined') {
            window.fbq('track', eventName, data);
        } else {
            console.warn('Facebook Pixel not initialized');
        }
    }, []);

    return { trackEvent };
};
