-- Create the enum type
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'CANCELLED');

-- Update existing subscription status values to match the enum
UPDATE "User"
SET "subscriptionStatus" = CASE 
    WHEN "subscriptionStatus" = 'ACTIVE' THEN 'ACTIVE'
    WHEN "subscriptionStatus" = 'EXPIRED' THEN 'EXPIRED'
    WHEN "subscriptionStatus" = 'CANCELLED' THEN 'CANCELLED'
    ELSE 'INACTIVE'
END;

-- Alter the column type to use the enum
ALTER TABLE "User" 
    ALTER COLUMN "subscriptionStatus" TYPE "SubscriptionStatus" 
    USING "subscriptionStatus"::"SubscriptionStatus"; 