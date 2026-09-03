import './globals.css';

export const metadata = {
  title: 'BHOM AI - HVAC Lead Conversion Platform',
  description: 'AI-powered chat widget for HVAC businesses',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
