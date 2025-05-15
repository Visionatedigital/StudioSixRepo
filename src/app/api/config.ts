// This configuration ensures that API routes are not statically generated
export const dynamic = 'force-dynamic' as const;
export const revalidate = 0;

// This configuration can be imported by all API routes that need to be dynamic
export const dynamicConfig = {
  // Use 'force-dynamic' if you need real-time data, or 'auto' for static optimization with revalidation
  dynamic: 'auto',
  // How often to revalidate the data (in seconds) - 60 seconds is a good balance
  revalidate: 60
} as const; 