import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PayFastButton } from '@/components/PayFastButton';

export const metadata: Metadata = {
  title: 'Test Payment | StudioSix',
  description: 'Test payment page for StudioSix',
};

export default async function TestPaymentPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/sign-in');
  }

  const creditPackages = [
    { id: 'basic', name: 'Basic Package', credits: 100, amount: 99.99 },
    { id: 'standard', name: 'Standard Package', credits: 500, amount: 399.99 },
    { id: 'premium', name: 'Premium Package', credits: 1000, amount: 699.99 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Test Payment Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {creditPackages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">{pkg.name}</h2>
            <p className="text-gray-600 mb-4">{pkg.credits} Credits</p>
            <p className="text-2xl font-bold mb-6">R {pkg.amount}</p>
            
            <PayFastButton
              amount={pkg.amount}
              itemName={pkg.name}
              itemDescription={`${pkg.credits} Credits Package`}
              email={session.user.email || ''}
              firstName={session.user.name?.split(' ')[0] || ''}
              lastName={session.user.name?.split(' ').slice(1).join(' ') || ''}
              metadata={{
                type: 'CREDITS',
                packageId: pkg.id,
                credits: pkg.credits,
                userId: session.user.id,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 