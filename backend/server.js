require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

// --- ADDED FOR AUTH - START ---
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
// --- ADDED FOR AUTH - END ---

const Chemical = require('./models/chemical');

let swaggerDocument = {};
try {
  const swaggerPath = path.join(__dirname, 'swagger.json');
  const raw = fs.readFileSync(swaggerPath, 'utf8').replace(/^\uFEFF/, '').trim();
  swaggerDocument = JSON.parse(raw);
  console.log('✅ swagger.json loaded from', swaggerPath);
} catch(e) {
  console.log('⚠️ swagger.json error:', e.message);
  swaggerDocument = {
    swagger: "2.0",
    info: { title: "Chemicals API - 2 Collections", version: "1.0.0", description: "API with Chemicals and Suppliers collections" },
    host: "localhost:3000",
    basePath: "/",
    schemes: ["http"],
    tags: [{name:"Chemicals"}, {name:"Suppliers"}],
    paths: {}
  };
}

const app = express();
app.use(cors());
app.use(express.json());

// --- ADDED FOR AUTH - START ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done){
    return done(null, profile);
  }
));
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Auth routes - does not touch your other routes
app.get('/login', passport.authenticate('github'));
app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/api-docs' }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect('/');
  }
);
app.get('/logout', (req, res, next) => {
  req.logout(function(err){
    if(err){ return next(err); }
    req.session.destroy(() => res.redirect('/'));
  });
});
// --- ADDED FOR AUTH - END ---

// TWO COLLECTIONS - SAME AS YOURS
app.use('/api/chemicals', require('./routes/chemicals'));
app.use('/api/suppliers', require('./routes/suppliers'));

// FIXED - single line for docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// YOUR HOMEPAGE - NOT CHANGED (just added login/logout button)
app.get('/', async (req, res) => {
  try {
    const chemicals = await Chemical.find().sort({ createdAt: -1 }).limit(50);
    const cards = chemicals.map(c => `
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:16px;">
        <div style="display:flex; justify-content:space-between;"><b>${c.name}</b><span style="font-size:11px; background:#f1f5f9; padding:3px 8px; border-radius:10px;">${c.hazard_class || 'N/A'}</span></div>
        <div style="font-size:12px; color:#64748b; margin-top:6px;">${c.concentration} • ${c.batch_no || ''}</div>
        <div style="font-size:12px; color:#64748b;">📍 ${c.location || '-'} • ${c.quantity?? 0} ${c.unit || ''} • Supplier: ${c.supplier || '-'}</div>
      </div>
    `).join('');

    const loginStatus = req.session.user ? `Logged in as ${req.session.user.displayName} | <a href="/logout">Logout</a>` : `<a href="/login">Login with GitHub</a>`;
    
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:sans-serif;background:#f8fafc;margin:0;padding:20px}.header{background:#fff;padding:20px;border-radius:12px;text-align:center;margin-bottom:20px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;max-width:1100px;margin:auto}a.btn{display:inline-block;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600;margin:4px;font-size:13px}.primary{background:#0f172a;color:#fff}.secondary{background:#e2e8f0;color:#0f172a}</style></head><body><div class="header"><h2 style="margin:0">🧪 Chemicals API - ${chemicals.length} Items - 2 Collections</h2><p style="color:#64748b;margin:6px 0 12px">Collections: Chemicals & Suppliers - Live from MongoDB</p><p>${loginStatus}</p><a class="btn primary" href="/api-docs">API Docs</a><a class="btn secondary" href="/api/chemicals">Chemicals JSON</a><a class="btn secondary" href="/api/suppliers">Suppliers JSON</a></div><div class="grid">${cards || '<p>No chemicals yet</p>'}</div></body></html>`);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI)
 .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
  })
 .catch(err => console.error(err));