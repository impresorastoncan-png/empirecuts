import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import BookingWizard from './components/BookingWizard';

// Add your publishable key
const stripePromise = loadStripe('pk_test_51SjLLBDm4HjSV1Er8jJg7KvpCZbxaB3HSsQx8yfI2fXZnrxkxuSbsdzopQxR5kdAtdqBNWJgTp2LnVDXcAuUn9tO00HXopHWl4'); // Replace with your actual publishable key


const Header = () => (
  <header className="flex justify-between items-center p-4 max-w-md mx-auto w-full">
    <div>
      <h1 className="text-2xl font-bold tracking-wider text-white">EMPIRE</h1>
      <h2 className="text-lg font-bold text-amber-500 -mt-1">CUTS</h2>
    </div>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
  </header>
);

function App() {
  return (
    <div className="min-h-screen w-full font-sans antialiased">
      <div className="relative min-h-screen flex flex-col items-center justify-start py-4 sm:pt-10">
        
        {/* Mobile-First Container with Glassmorphism */}
        <div className="relative w-full max-w-md mx-auto backdrop-blur-xl bg-white/5 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden">
          <Header />
          <main className="p-4 sm:p-6">
            <Elements stripe={stripePromise}>
              <BookingWizard />
            </Elements>
          </main>
        </div>

        <footer className="text-center p-4 mt-4 text-xs text-slate-500">
          <p>Empire Cuts &copy; 2025. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;