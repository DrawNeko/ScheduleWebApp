/**
 * scheduleWebApp/app/server/middleware/sessionAuth.js
 */

const crypto = require("crypto");

const sessions = new Map();

/**
 * parseCookies の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map(v => v.trim())
    .filter(Boolean)
    .reduce((acc, pair) => {
      const idx = pair.indexOf("=");
      if (idx < 0) return acc;
      acc[pair.slice(0, idx)] = decodeURIComponent(pair.slice(idx + 1));
      return acc;
    }, {});
}

/**
 * sessionMiddleware の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.sessionMiddleware = (req, res, next) => {
  const cookies = parseCookies(req.headers.cookie || "");
  const sid = cookies.sid;

  if (sid && sessions.has(sid)) {
    req.session = sessions.get(sid);
  } else {
    req.session = {};
  }

  req.session.destroy = (cb) => {
    const currentSid = req.session.id;
    if (currentSid) sessions.delete(currentSid);
    req.session = {};
    if (cb) cb();
  };

  const originalJson = res.json.bind(res);
  res.json = (payload) => {
    if (req.session.user) {
      if (!req.session.id) {
        req.session.id = crypto.randomBytes(24).toString("hex");
      }
      sessions.set(req.session.id, req.session);
      res.setHeader("Set-Cookie", `sid=${req.session.id}; Path=/; HttpOnly; SameSite=Lax`);
    }
    return originalJson(payload);
  };

  res.clearCookie = (name) => {
    res.setHeader("Set-Cookie", `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
  };

  next();
};

/**
 * requireAuthForApi の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.requireAuthForApi = (req, res, next) => {
  // API 以外（静的ファイル等）はここで認証しない
  if (!req.path.startsWith('/api/')) return next();

  // 認証 API は未ログインでもアクセス可能
  if (req.path.startsWith('/api/auth/login')) return next();
  if (req.path.startsWith('/api/auth/logout')) return next();

  // 以降の API はログイン必須
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
};

/**
 * requireAuthForPage の処理。
 * 入力値を受け取り、必要な整形・検証・副作用（API 呼び出しや DOM 更新など）を実行します。
 */
exports.requireAuthForPage = (req, res, next) => {
  const openPaths = new Set(['/login.html', '/assets/css/login.css', '/assets/js/login.js']);

  if (req.path === '/') {
    return req.session.user ? res.redirect('/index.html') : res.redirect('/login.html');
  }

  if (openPaths.has(req.path)) {
    return next();
  }

  if (req.path.endsWith('.html') && !req.session.user) {
    return res.redirect('/login.html');
  }

  return next();
};
