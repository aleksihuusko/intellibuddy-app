import Navbar from '@/components/navbar';
import Sidebar from '@/components/sidebar';
import { checkSubscription } from '@/lib/subscription';

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const isPro = await checkSubscription();

  return (
    <div className="h-full">
      <Navbar isPro={isPro} />
      <div className="hidden md:flex mt-16 w-20 flex-col fixed inset-y-0">
        <Sidebar isPro={isPro} />
      </div>
      <main className="h-full pt-16 md:pl-20">{children}</main>
    </div>
  );
};

export default RootLayout;
