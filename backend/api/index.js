import app from '../src/app.js';

export default (req, res) => {
    // Vercel serverless function entry point
    // Rewrites from /api/* land here.

    // 1. Strip the /api prefix so Express router matches correctly
    //    e.g. /api/auth/login -> /auth/login
    if (req.url.startsWith('/api')) {
        req.url = req.url.replace(/^\/api/, '');
    }

    // 2. Ensure URL starts with /
    if (req.url.length === 0 || !req.url.startsWith('/')) {
        req.url = '/' + req.url;
    }

    // 3. Debug headers (optional, check logs in Vercel)
    // console.log('Incoming request:', req.method, req.url);

    return app(req, res);
};
