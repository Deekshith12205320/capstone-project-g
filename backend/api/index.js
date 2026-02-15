import app from '../src/app.js';

export default (req, res) => {
    // Strip /api prefix from the URL so Express matches routes correctly
    // e.g., /api/auth/login -> /auth/login
    if (req.url.startsWith('/api')) {
        req.url = req.url.replace(/^\/api/, '');
    }
    // If the URL becomes empty or just query params, ensure it starts with /
    if (!req.url.startsWith('/')) {
        req.url = '/' + req.url;
    }

    return app(req, res);
};
