import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Healthcare platform route
app.get('/health', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bluequee Healthcare Management</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 25%, #1e40af 50%, #1d4ed8 75%, #2563eb 100%);
            min-height: 100vh;
            color: white;
            overflow-x: hidden;
          }
          .container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 24px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }
          .logo { font-size: 3.5rem; margin-bottom: 16px; display: block; }
          .title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 12px;
            background: linear-gradient(90deg, #ffffff, #e0e7ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .subtitle { font-size: 1.25rem; margin-bottom: 32px; opacity: 0.9; color: #e0e7ff; }
          .status {
            background: linear-gradient(90deg, #10b981, #059669);
            padding: 12px 24px;
            border-radius: 50px;
            display: inline-block;
            font-weight: 600;
            margin-bottom: 32px;
            box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
          }
          .features {
            text-align: left;
            background: rgba(255, 255, 255, 0.05);
            padding: 24px;
            border-radius: 16px;
            margin-bottom: 24px;
          }
          .feature {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            font-size: 1.1rem;
          }
          .feature:last-child { margin-bottom: 0; }
          .feature-icon { margin-right: 12px; font-size: 1.2rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">🏥</div>
            <h1 class="title">Bluequee</h1>
            <p class="subtitle">Digital Healthcare Management Platform</p>
            
            <div class="status">✅ System Online & Ready</div>
            
            <div class="features">
              <div class="feature">
                <span class="feature-icon">👥</span>
                <span>Patient Management & Records</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🧪</span>
                <span>Laboratory Results & Orders</span>
              </div>
              <div class="feature">
                <span class="feature-icon">💊</span>
                <span>Pharmacy & Prescription Management</span>
              </div>
              <div class="feature">
                <span class="feature-icon">📊</span>
                <span>Analytics & Revenue Tracking</span>
              </div>
              <div class="feature">
                <span class="feature-icon">📱</span>
                <span>Mobile-First Responsive Design</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🔒</span>
                <span>Secure Multi-Tenant Architecture</span>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Simple test route
app.get('/test', (req, res) => {
  res.send(`
    <html>
      <head><title>Test</title></head>
      <body style="font-family: Arial; padding: 20px; background: #f0f8ff;">
        <h1 style="color: #2563eb;">🏥 Bluequee Test Page</h1>
        <p>Server is running correctly!</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      </body>
    </html>
  `);
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });



  // Serve the direct login page
  app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bluequee Healthcare - Login</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 25%, #1e40af 50%, #1d4ed8 75%, #2563eb 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .login-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 24px;
            padding: 40px;
            max-width: 400px;
            width: 100%;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .logo {
            font-size: 3rem;
            margin-bottom: 16px;
            display: block;
        }
        .title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 8px;
            color: white;
        }
        .subtitle {
            font-size: 1rem;
            margin-bottom: 32px;
            color: #e0e7ff;
            opacity: 0.9;
        }
        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }
        .form-label {
            display: block;
            margin-bottom: 8px;
            color: #e0e7ff;
            font-weight: 500;
        }
        .form-input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 16px;
            backdrop-filter: blur(10px);
        }
        .form-input::placeholder {
            color: rgba(224, 231, 255, 0.6);
        }
        .form-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        .login-button {
            width: 100%;
            padding: 12px 24px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 8px;
        }
        .login-button:hover {
            background: linear-gradient(135deg, #2563eb, #1e40af);
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
        }
        .login-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .demo-accounts {
            margin-top: 24px;
            padding: 16px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .demo-title {
            color: #e0e7ff;
            font-weight: 600;
            margin-bottom: 12px;
            font-size: 14px;
        }
        .demo-account {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 12px;
            color: #cbd5e1;
        }
        .error-message {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.4);
            color: #fecaca;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 16px;
            font-size: 14px;
            display: none;
        }
        .loading {
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">🏥</div>
        <h1 class="title">Bluequee</h1>
        <p class="subtitle">Healthcare Management Platform</p>
        
        <form id="loginForm">
            <div id="errorMessage" class="error-message"></div>
            
            <div class="form-group">
                <label for="username" class="form-label">Username</label>
                <input type="text" id="username" name="username" class="form-input" placeholder="Enter your username" required>
            </div>
            
            <div class="form-group">
                <label for="password" class="form-label">Password</label>
                <input type="password" id="password" name="password" class="form-input" placeholder="Enter your password" required>
            </div>
            
            <button type="submit" id="loginButton" class="login-button">
                <span id="buttonText">Access Dashboard</span>
            </button>
        </form>
        
        <div class="demo-accounts">
            <div class="demo-title">Demo Accounts</div>
            <div class="demo-account">
                <span>Administrator:</span>
                <span>admin / admin123</span>
            </div>
            <div class="demo-account">
                <span>Doctor:</span>
                <span>doctor / doctor123</span>
            </div>
            <div class="demo-account">
                <span>Nurse:</span>
                <span>nurse / nurse123</span>
            </div>
        </div>
    </div>

    <script>
        console.log('Healthcare login interface loaded successfully');
        
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('errorMessage');
            const button = document.getElementById('loginButton');
            const buttonText = document.getElementById('buttonText');
            
            // Clear previous errors
            errorDiv.style.display = 'none';
            
            // Show loading state
            button.disabled = true;
            button.classList.add('loading');
            buttonText.textContent = 'Signing in...';
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // Store authentication data
                    localStorage.setItem('clinic_token', data.token);
                    localStorage.setItem('clinic_user', JSON.stringify(data.user));
                    
                    // Redirect to main application
                    window.location.href = '/app';
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Invalid username or password');
                }
            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
            } finally {
                // Reset button state
                button.disabled = false;
                button.classList.remove('loading');
                buttonText.textContent = 'Access Dashboard';
            }
        });
    </script>
</body>
</html>`);
  });

  // Modern Healthcare Platform Gateway
  app.get('/app*', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bluequee | Modern Healthcare Management Platform</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #2563eb;
            --primary-dark: #1d4ed8;
            --secondary: #64748b;
            --accent: #10b981;
            --background: #ffffff;
            --surface: #f8fafc;
            --border: #e2e8f0;
            --text-primary: #0f172a;
            --text-secondary: #475569;
            --text-muted: #94a3b8;
            --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--surface);
            height: 100vh;
            overflow: hidden;
            color: var(--text-primary);
            line-height: 1.5;
        }
        .app-container {
            display: flex;
            height: 100vh;
            background: var(--background);
        }
        
        .sidebar {
            width: 280px;
            background: var(--background);
            border-right: 1px solid var(--border);
            padding: 24px 0;
            overflow-y: auto;
            box-shadow: var(--shadow);
        }
        
        .sidebar-content {
            padding: 0 24px;
        }
        .logo {
            display: flex;
            align-items: center;
            margin-bottom: 40px;
            padding: 0 24px;
        }
        
        .logo-icon {
            font-size: 28px;
            margin-right: 12px;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .logo-text {
            font-size: 20px;
            font-weight: 700;
            color: var(--text-primary);
        }
        
        .nav-section {
            margin-bottom: 32px;
        }
        
        .nav-title {
            font-size: 11px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 0 24px 12px;
        }
        
        .nav-item {
            display: flex;
            align-items: center;
            padding: 12px 24px;
            color: var(--text-secondary);
            text-decoration: none;
            border-radius: 8px;
            margin: 0 12px 4px;
            transition: all 0.2s ease;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
        }
        
        .nav-item:hover {
            background: var(--surface);
            color: var(--text-primary);
            transform: translateX(2px);
        }
        
        .nav-item.active {
            background: var(--primary);
            color: white;
        }
        
        .nav-icon {
            margin-right: 12px;
            font-size: 18px;
            opacity: 0.8;
        }

        .main-content {
            flex: 1;
            background: var(--background);
            overflow-y: auto;
        }
        
        .header {
            background: var(--background);
            border-bottom: 1px solid var(--border);
            padding: 20px 32px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: var(--shadow);
        }
        
        .header-title {
            font-size: 24px;
            font-weight: 700;
            color: var(--text-primary);
        }
        
        .header-actions {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        .user-profile {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 16px;
            border-radius: 8px;
            background: var(--surface);
            border: 1px solid var(--border);
        }
        
        .avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--primary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 14px;
        }
        
        .dashboard-grid {
            padding: 32px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
        }
        
        .dashboard-card {
            background: var(--background);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            box-shadow: var(--shadow);
            transition: all 0.2s ease;
        }
        
        .dashboard-card:hover {
            box-shadow: var(--shadow-lg);
            transform: translateY(-2px);
        }
        
        .card-header {
            display: flex;
            align-items: center;
            justify-content: between;
            margin-bottom: 16px;
        }
        
        .card-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            margin-bottom: 16px;
        }
        
        .card-title {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 8px;
        }
        
        .card-description {
            color: var(--text-secondary);
            font-size: 14px;
            line-height: 1.5;
        }
        
        .card-metrics {
            display: flex;
            gap: 24px;
            margin-top: 20px;
        }
        
        .metric {
            flex: 1;
        }
        
        .metric-value {
            font-size: 28px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 4px;
        }
        
        .metric-label {
            font-size: 12px;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }


        .nav-item.active {
            background: #3b82f6;
        }
        .nav-icon {
            margin-right: 12px;
            font-size: 16px;
        }
        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .top-bar {
            background: white;
            padding: 16px 24px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: between;
            align-items: center;
        }
        .page-title {
            font-size: 24px;
            font-weight: 700;
            color: #1e293b;
        }
        .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-left: auto;
        }
        .content-area {
            flex: 1;
            padding: 24px;
            overflow-y: auto;
            background: #f8fafc;
        }
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
            margin-bottom: 32px;
        }
        .stat-card {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }
        .stat-number {
            font-size: 32px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 8px;
        }
        .stat-label {
            color: #64748b;
            font-size: 14px;
        }
        .recent-section {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }
        .section-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #1e293b;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
        }
        .table th,
        .table td {
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
        }
        .table th {
            font-weight: 600;
            color: #64748b;
            font-size: 12px;
            text-transform: uppercase;
        }
        .badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }
        .badge-green {
            background: #dcfce7;
            color: #166534;
        }
        .badge-blue {
            background: #dbeafe;
            color: #1d4ed8;
        }
        .badge-yellow {
            background: #fef3c7;
            color: #d97706;
        }
    </style>
</head>
<body>
    <div class="app-container">
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="logo">
                <span class="logo-icon">🏥</span>
                <span class="logo-text">Bluequee</span>
            </div>
            
            <div class="nav-section">
                <div class="nav-title">Core</div>
                <div class="nav-item active">
                    <span class="nav-icon">📊</span>
                    <span>Dashboard</span>
                </div>
                <div class="nav-item">
                    <span class="nav-icon">👥</span>
                    <span>Patients</span>
                </div>
                <div class="nav-item">
                    <span class="nav-icon">📅</span>
                    <span>Appointments</span>
                </div>
                <div class="nav-item">
                    <span class="nav-icon">🧪</span>
                    <span>Lab Results</span>
                </div>
            </div>
            
            <div class="nav-section">
                <div class="nav-title">Clinical</div>
                <div class="nav-item">
                    <span class="nav-icon">💊</span>
                    <span>Pharmacy</span>
                </div>
                <div class="nav-item">
                    <span class="nav-icon">📋</span>
                    <span>Lab Orders</span>
                </div>
                <div class="nav-item">
                    <span class="nav-icon">📄</span>
                    <span>Documents</span>
                </div>
                <div class="nav-item">
                    <span class="nav-icon">🔄</span>
                    <span>Referrals</span>
                </div>
            </div>
            
            <div class="nav-section">
                <div class="nav-title">Management</div>
                <div class="nav-item">
                    <span class="nav-icon">💰</span>
                    <span>Billing</span>
                </div>
                <div class="nav-item">
                    <span class="nav-icon">📈</span>
                    <span>Analytics</span>
                </div>
                <div class="nav-item">
                    <span class="nav-icon">👤</span>
                    <span>User Management</span>
                </div>
                <div class="nav-item">
                    <span class="nav-icon">⚙️</span>
                    <span>Settings</span>
                </div>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="main-content">
            <!-- Top Bar -->
            <div class="top-bar">
                <h1 class="page-title">Healthcare Dashboard</h1>
                <div class="user-info">
                    <span>👨‍⚕️ Dr. Admin</span>
                    <span style="color: #64748b;">|</span>
                    <span style="color: #64748b;">General Hospital</span>
                </div>
            </div>
            
            <!-- Content Area -->
            <div class="content-area">
                <!-- Stats Grid -->
                <div class="dashboard-grid">
                    <div class="stat-card">
                        <div class="stat-number">247</div>
                        <div class="stat-label">Total Patients</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">18</div>
                        <div class="stat-label">Today's Appointments</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">12</div>
                        <div class="stat-label">Pending Lab Results</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">₦2.4M</div>
                        <div class="stat-label">Monthly Revenue</div>
                    </div>
                </div>
                
                <!-- Recent Activity -->
                <div class="recent-section">
                    <h2 class="section-title">Recent Patient Activity</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Doctor</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Sarah Johnson</td>
                                <td>Consultation</td>
                                <td><span class="badge badge-green">Completed</span></td>
                                <td>Today, 2:30 PM</td>
                                <td>Dr. Smith</td>
                            </tr>
                            <tr>
                                <td>Michael Chen</td>
                                <td>Lab Test</td>
                                <td><span class="badge badge-blue">In Progress</span></td>
                                <td>Today, 1:45 PM</td>
                                <td>Dr. Johnson</td>
                            </tr>
                            <tr>
                                <td>Emily Davis</td>
                                <td>Follow-up</td>
                                <td><span class="badge badge-yellow">Scheduled</span></td>
                                <td>Tomorrow, 10:00 AM</td>
                                <td>Dr. Brown</td>
                            </tr>
                            <tr>
                                <td>James Wilson</td>
                                <td>Emergency</td>
                                <td><span class="badge badge-green">Treated</span></td>
                                <td>Yesterday, 11:20 PM</td>
                                <td>Dr. Taylor</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script>
        console.log('Full Healthcare Application Interface Loaded');
        
        // Add click handlers for navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                const text = this.querySelector('span:last-child').textContent;
                document.querySelector('.page-title').textContent = text + ' Management';
            });
        });
    </script>
</body>
</html>`);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
