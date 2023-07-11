import { useState, useEffect, useCallback } from "react";

export function useOnScreen(ref: React.RefObject<HTMLElement>): boolean {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const handleIntersection = useCallback(
    ([entry]: IntersectionObserverEntry[]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    },
    []
  );

  useEffect(() => {
    let element: HTMLElement | null = null;

    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver(handleIntersection, options);

    if (ref.current) {
      element = ref.current;
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
      observer.disconnect();
    };
  }, [ref.current, handleIntersection]);

  return isVisible;
}
