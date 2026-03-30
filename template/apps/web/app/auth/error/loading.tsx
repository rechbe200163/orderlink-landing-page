import { Spinner } from '@workspace/ui/components/spinner';
import React from 'react';

const loading = () => {
  return (
    <div className='flex items-center justify-center h-full'>
      <Spinner />;
    </div>
  );
};

export default loading;
