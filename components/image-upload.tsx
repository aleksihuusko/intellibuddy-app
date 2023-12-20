'use client';

import { useEffect, useState } from 'react';
import { CldUploadButton } from 'next-cloudinary';
import Image from 'next/image';

interface ImageUploadProps {
  value: string;
  onChange: (src: string) => void;
  disabled?: boolean;
}

export const ImageUpload = ({ value, onChange, disabled }: ImageUploadProps) => {
  // State to track if the component is mounted.
  const [isMounted, setIsMounted] = useState(false);

  // useEffect hook to set the isMounted state to true after the component mounts.
  // The empty dependency array makes this effect run only once, after initial render.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Conditional rendering: if the component is not mounted yet, return null (render nothing).
  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-4 w-full flex flex-col justify-center items-center">
      <CldUploadButton
        onUpload={(result: any) => onChange(result.info.secure_url)}
        options={{
          maxFiles: 1
        }}
        uploadPreset="xtj61abc"
      >
        <div className="p-4 border-4 border-dashed border-primary/10 rounded-lg hover:opacity-75 transition flex flex-col space-y-2 items-center justify-center">
          <div className="relative h-40 w-40">
            <Image
              fill
              alt="Upload"
              src={value || '/placeholder.svg'}
              className="rounded-lg object-cover"
            />
          </div>
        </div>
      </CldUploadButton>
    </div>
  );
};
