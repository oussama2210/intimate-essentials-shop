import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PIXEL_ID = '1241120467874245';

export const FacebookPixel = () => {
    const location = useLocation();

    useEffect(() => {
        // Initialize Facebook Pixel
        const script = document.createElement('script');
        script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${PIXEL_ID}');
    `;
        document.head.appendChild(script);

        const noscript = document.createElement('noscript');
        noscript.innerHTML = `
      <img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1"
      />
    `;
        document.head.appendChild(noscript);

        return () => {
            // Cleanup if needed, though usually pixel scripts persist
            document.head.removeChild(script);
            document.head.removeChild(noscript);
        };
    }, []); // Only run once on mount

    useEffect(() => {
        // Track PageView on route change
        if (typeof window.fbq !== 'undefined') {
            window.fbq('track', 'PageView');
        }
    }, [location]);

    return null;
};

// Add type definition for fbq
declare global {
    interface Window {
        fbq: any;
        _fbq: any;
    }
}
