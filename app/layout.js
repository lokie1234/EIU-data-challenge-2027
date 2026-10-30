import './globals.css';
import { eventContent as siteContent } from '../data/eventContent';
export const metadata = {
  title: `${siteContent.name} 2027 — From data to intelligence`,
  description: siteContent.description,
  icons: { icon: '/images/mark.svg' },
};
export const viewport = { themeColor: siteContent.theme.background };
export default function RootLayout({ children }) {
  const theme = siteContent.theme;
  return <html lang="en"><body style={{ '--background': theme.background, '--surface': theme.surface, '--violet': theme.violet, '--cyan': theme.cyan, '--lime': theme.lime, '--text': theme.text, '--muted': theme.muted, '--coral': theme.coral }}>{children}</body></html>;
}
