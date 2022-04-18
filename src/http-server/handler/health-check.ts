import type { Handler } from 'express';

export function healthCheck(): Handler {
  const startTime = Date.now();

  return (req, res) => {
    res.json({ uptime: Date.now() - startTime });
  };
}
