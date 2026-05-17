'use client';

import { useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Translations from '@/layouts/components/Translations';

interface Props {
  text: string;
  collapsed: boolean;
}

const NavMenuText = ({ text, collapsed }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    if (collapsed) {
      textEl.style.removeProperty('--nav-scroll-dist');
      return;
    }

    const update = () => {
      const overflow = textEl.scrollWidth - container.clientWidth;
      textEl.style.setProperty('--nav-scroll-dist', overflow > 4 ? `-${overflow}px` : '0px');
    };

    const observer = new ResizeObserver(update);
    observer.observe(container);
    update();

    return () => observer.disconnect();
  }, [text, collapsed]);

  return (
    <Box ref={containerRef} sx={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
      <Box ref={textRef} component="span" className="nav-text-inner">
        <Translations text={text} />
      </Box>
    </Box>
  );
};

export default NavMenuText;
