// This configuration ensures that API routes are not statically generated
export const dynamic = 'force-dynamic' as const;
export const revalidate = 0;

// This configuration can be imported by all API routes that need to be dynamic
export const dynamicConfig = {
  dynamic,
  revalidate,
} as const; 