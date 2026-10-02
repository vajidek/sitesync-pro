import { useState, useEffect } from 'react';

export interface DeviceProfile {
  width: number;
  height: number;
  isLandscape: boolean;
  isPortraitPhone: boolean;
  isLandscapePhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isMobile: boolean; // true if isPortraitPhone || isLandscapePhone
}

export function useDeviceProfile(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>(() => calculateProfile());

  function calculateProfile(): DeviceProfile {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;
    
    // Check landscape via orientation API or dimensions
    const isLandscape = typeof window !== 'undefined' 
      ? (window.matchMedia && window.matchMedia('(orientation: landscape)').matches) || width > height
      : true;

    // Phone Landscape: height < 520px OR (isLandscape && width < 960 && height < 600)
    const isLandscapePhone = isLandscape && (height < 520 || (width < 960 && height < 550));
    
    // Phone Portrait: width < 640 && !isLandscapePhone
    const isPortraitPhone = !isLandscapePhone && (width < 640 || (width < 768 && !isLandscape));

    const isMobile = isPortraitPhone || isLandscapePhone;
    const isTablet = !isMobile && width >= 640 && width <= 1024;
    const isDesktop = !isMobile && !isTablet && width > 1024;

    return {
      width,
      height,
      isLandscape,
      isPortraitPhone,
      isLandscapePhone,
      isTablet,
      isDesktop,
      isMobile,
    };
  }

  useEffect(() => {
    const handleResize = () => {
      setProfile(calculateProfile());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    let mql: MediaQueryList | null = null;
    if (typeof window !== 'undefined' && window.matchMedia) {
      mql = window.matchMedia('(orientation: landscape)');
      if (mql.addEventListener) {
        mql.addEventListener('change', handleResize);
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (mql && mql.removeEventListener) {
        mql.removeEventListener('change', handleResize);
      }
    };
  }, []);

  return profile;
}
