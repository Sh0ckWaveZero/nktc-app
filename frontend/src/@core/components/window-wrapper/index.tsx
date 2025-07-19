// ** React Imports
import { useState, useEffect, ReactNode } from 'react';

// ** Next Import
import { useRouter } from 'next/navigation';

interface Props {
  children: ReactNode;
}

const WindowWrapper = ({ children }: Props) => {
  // ** State
  const [windowReadyFlag, setWindowReadyFlag] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowReadyFlag(true);
    }
  }, [router]);

  if (windowReadyFlag) {
    return <>{children}</>;
  } else {
    return null;
  }
};

export default WindowWrapper;
