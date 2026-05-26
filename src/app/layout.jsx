// src/app/layout.jsx
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata = {
  title: 'PromptVault — AI Prompt Gallery',
  description: 'Discover and unlock the best AI image prompts',
  other: {
    monetag: '5c650e731a48698e3bee3415969744ed',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
