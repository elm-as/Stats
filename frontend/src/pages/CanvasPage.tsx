import React from 'react';
import CanvasFlow from '../components/canvas/CanvasFlow';

export default function CanvasPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden w-full m-[-20px] pb-[40px] md:m-[-20px] md:pb-[40px]">
      <CanvasFlow />
    </div>
  );
}
