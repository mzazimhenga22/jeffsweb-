
import { MainLayout } from '@/components/main-layout';
import { AccountNav } from './account-nav';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4 md:px-6">
        <h1 className="text-3xl font-bold tracking-tight font-headline mb-8">
          My Account
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <aside className="md:col-span-1">
            <AccountNav />
          </aside>
          <main className="md:col-span-3">{children}</main>
        </div>
      </div>
    </MainLayout>
  );
}
