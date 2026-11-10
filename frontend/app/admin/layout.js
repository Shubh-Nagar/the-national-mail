import AdminShell from '@/components/admin/AdminShell';

export const metadata = {
  title: { default: 'Newsroom', template: '%s | Newsroom | The National Mail' },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
