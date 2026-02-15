export function requireAuth(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = auth.replace('Bearer ', '').trim();

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Attach user to request
  req.user = { userId };

  next();
}
