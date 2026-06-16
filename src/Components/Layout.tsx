import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden relative font-sans">
      {/* Living Animated Mesh Background */}
      <div className="absolute inset-0 bg-[#f4ebd8] z-0 overflow-hidden">
        {/* Soft Latte Blob */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#e8d5bc] opacity-60 blur-3xl mix-blend-multiply animate-blob pointer-events-none"></div>
        {/* Peach Blob */}
        <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#fbdca9] opacity-40 blur-3xl mix-blend-multiply animate-blob animate-delay-200 pointer-events-none"></div>
        {/* Warm Sand Blob */}
        <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-[#e3cda4] opacity-50 blur-3xl mix-blend-multiply animate-blob animate-delay-300 pointer-events-none"></div>
        {/* Terracotta Hint Blob */}
        <div className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-[#d8a48b] opacity-30 blur-3xl mix-blend-multiply animate-blob animate-delay-100 pointer-events-none"></div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#4a3f35]/20 backdrop-blur-md md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform md:hidden transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <Sidebar />
      </div>

      <div className="z-10 hidden md:flex p-4">
        <Sidebar />
      </div>
      
      <div className="flex flex-col flex-1 w-full min-w-0 z-10 h-full relative">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in custom-scrollbar">
          <div className="mx-auto max-w-7xl h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
