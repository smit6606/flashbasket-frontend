import { useState, useEffect } from 'react';

declare global {
    interface Window {
        google: any;
    }
}

export const useGoogleMaps = (apiKey: string) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState<Error | null>(null);

    useEffect(() => {
        if (window.google && window.google.maps) {
            setIsLoaded(true);
            return;
        }

        const existingScript = document.getElementById('googleMapsScript');
        if (existingScript) {
            existingScript.addEventListener('load', () => setIsLoaded(true));
            existingScript.addEventListener('error', (err) => setLoadError(err as any));
            return;
        }

        const script = document.createElement('script');
        script.id = 'googleMapsScript';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => setIsLoaded(true);
        script.onerror = (err) => setLoadError(err as any);

        document.head.appendChild(script);
    }, [apiKey]);

    return { isLoaded, loadError };
};
