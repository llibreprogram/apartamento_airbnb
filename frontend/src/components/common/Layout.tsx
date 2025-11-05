import React from 'react';
import { Header } from './Header';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <Header />
      <main className="main-content">{children}</main>
    </div>
  );
}
