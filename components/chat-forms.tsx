'use client';

import { ChatRequestOptions } from 'ai';
import { ChangeEvent, FormEvent } from 'react';

interface ChatFormProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (
    e: FormEvent<HTMLFormElement>,
    ChatRequestOptions?: ChatRequestOptions | undefined
  ) => void;
}

const ChatForm = () => {
  return <div>Chat Form</div>;
};

export default ChatForm;
