#!/bin/bash

# Remove existing client directory if it exists
rm -rf client

# Create React app with TypeScript template
npx create-react-app client --template typescript

# Navigate to client directory
cd client

# Remove existing package-lock.json and node_modules
rm -f package-lock.json
rm -rf node_modules

# Install core dependencies first
npm install --save \
  react@latest \
  react-dom@latest \
  @types/react@latest \
  @types/react-dom@latest \
  @types/node@latest \
  typescript@latest

# Install additional dependencies
npm install --save \
  @heroicons/react \
  react-router-dom \
  @types/react-router-dom \
  axios

# Install dev dependencies
npm install --save-dev \
  tailwindcss \
  postcss \
  autoprefixer

# Initialize Tailwind CSS
npx tailwindcss init -p

# Create necessary directories
mkdir -p src/components/Layout src/components/Navbar src/components/Sidebar src/pages src/routes

# Create tsconfig.json with proper settings
cat > tsconfig.json << EOL
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
EOL

# Create source files
cat > src/react-app-env.d.ts << EOL
/// <reference types="react-scripts" />
EOL

# Create source files
cat > src/App.tsx << EOL
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Layout from './components/Layout';
import AppRoutes from './routes';

function App() {
  return (
    <Router>
      <Layout>
        <AppRoutes />
      </Layout>
    </Router>
  );
}

export default App;
EOL

cat > src/index.tsx << EOL
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOL

cat > src/components/Layout/index.tsx << EOL
import React from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
EOL

cat > src/components/Navbar/index.tsx << EOL
import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">RPG Life</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
EOL

cat > src/components/Sidebar/index.tsx << EOL
import React from 'react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow">
      <div className="h-full px-3 py-4">
        <h2 className="text-lg font-semibold">Navigation</h2>
      </div>
    </aside>
  );
};

export default Sidebar;
EOL

cat > src/routes/index.tsx << EOL
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default AppRoutes;
EOL

cat > src/pages/Dashboard.tsx << EOL
import React from 'react';

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
};

export default Dashboard;
EOL

cat > src/pages/Login.tsx << EOL
import React from 'react';

const Login = () => {
  return (
    <div>
      <h1>Login</h1>
    </div>
  );
};

export default Login;
EOL

cat > src/pages/Register.tsx << EOL
import React from 'react';

const Register = () => {
  return (
    <div>
      <h1>Register</h1>
    </div>
  );
};

export default Register;
EOL

cat > src/index.css << EOL
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-md font-medium transition-colors;
  }
  
  .btn-primary {
    @apply bg-primary-600 text-white hover:bg-primary-700;
  }
}
EOL

# Update package.json scripts
npm pkg set scripts.start="WATCHPACK_POLLING=true react-scripts start"

# Create an empty .env file
touch .env

# Make the script executable
chmod +x scripts/setup-client.sh 