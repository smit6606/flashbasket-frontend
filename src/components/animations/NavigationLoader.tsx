'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // When the route changes, start NProgress
    // However, in Next.js App Router, there's no way to know when it *completes*
    // easily without a more complex approach.
    // The most common pattern is to start on link click (captured globally)
    // or just let the API interceptor handle the bulk of loading.
    
    // For manual page navigation, we can just finish NProgress here
    // since this component re-renders on route change completion.
    NProgress.done();
    
    return () => {
      // Small delay on unmount (navigation start)
      // Note: This is a hacky way since Next.js doesn't provide transition hooks yet.
      // A better way is to intercept all <a> tags.
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    // Global click listener to start NProgress on internal link clicks
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLAnchorElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.href && anchor.href.startsWith(window.location.origin) && !anchor.target) {
          // Internal link
          const currentUrl = window.location.href;
          const newUrl = anchor.href;
          
          if (currentUrl !== newUrl) {
              NProgress.start();
          }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return null;
}
