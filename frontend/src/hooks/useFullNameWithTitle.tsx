import { UserDataType } from '@/context/types';
import { useEffect, useState } from 'react';

type Props = {
  user: UserDataType;
};

const useGetFullNameWithTitle = (props: Props) => {
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    const { title, firstName, lastName } = props?.user?.account || {};
    setFullName(`${title ?? ''}${firstName ?? ''} ${lastName ?? ''}`.trim());

    return () => {
      setFullName('');
    };
  }, [props.user]);

  return { fullName };
};

export default useGetFullNameWithTitle;
