import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import AppRouter from './routes/AppRouter.jsx';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="relative min-h-screen flex flex-col bg-[#060913] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden">
          {/* Luces Ambientales Animadas (Aurora Mesh) */}
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="bg-cyber-grid absolute inset-0 opacity-60"></div>
            <div className="animate-aurora absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-emerald-500/15 blur-[130px]"></div>
            <div className="animate-aurora absolute top-1/3 -right-40 w-[480px] h-[480px] rounded-full bg-cyan-500/12 blur-[140px]" style={{ animationDelay: '3s' }}></div>
            <div className="animate-aurora absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[140px]" style={{ animationDelay: '6s' }}></div>
          </div>

          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <AppRouter />
            </main>
            <Footer />
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
