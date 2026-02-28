import type { ReactNode } from 'react';

interface ChatContainerProps {
  children: ReactNode;
  bgGradient?: { from: string; to: string };
}

export function ChatContainer({
  children,
}: ChatContainerProps) {
  return (
    <div className="bg-white dark:bg-transparent overflow-hidden grid grid-rows-1 relative h-full min-h-0">
      {children}
    </div>
  );
}
