import chromium from '@sparticuz/chromium-min';

export default async function handler(req, res) {
  const path = await chromium.executablePath();
  res.status(200).json({ executablePath: path });
} 