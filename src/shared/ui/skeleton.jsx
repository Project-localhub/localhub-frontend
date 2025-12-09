/* eslint-disable react/prop-types */
import { cn } from './utils';

function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

export { Skeleton };
