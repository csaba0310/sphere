import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setDeepLinkClickHandler } from '../utils/deepLinkHandler';

/**
 * Registers a global handler so that unicity-connect:// deep links
 * in DMs can open as iframe agents inside Sphere.
 */
export function useDeepLinkNavigation() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleDeepLink = (httpsUrl: string) => {
      try {
        new URL(httpsUrl); // validate
        navigate(`/agents/custom?url=${encodeURIComponent(httpsUrl)}`, { replace: false });
      } catch {
        // Invalid URL — open externally as fallback
        window.open(httpsUrl, '_blank', 'noopener,noreferrer');
      }
    };

    setDeepLinkClickHandler(handleDeepLink);
    return () => setDeepLinkClickHandler(null);
  }, [navigate]);
}
