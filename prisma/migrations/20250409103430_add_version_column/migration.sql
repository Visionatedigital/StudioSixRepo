/*
  Warnings:

  - Made the column `canvasData` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "canvasData" SET NOT NULL,
ALTER COLUMN "canvasData" SET DEFAULT '{"elements":[],"canvasStack":[{"id":"root","name":"Root Canvas","elements":[],"parentId":null}]}';
