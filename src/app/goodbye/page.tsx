export default function GoodbyePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F6F8FA]">
      <h1 className="text-4xl font-bold mb-4">Goodbye from StudioSix!</h1>
      <p className="text-lg mb-6">Your account has been deleted. We're sad to see you go.</p>
      <p className="text-md text-gray-500 mb-8">If you have feedback or want to rejoin, please contact us or sign up again anytime.</p>
      <a href="/" className="px-6 py-3 bg-[#814ADA] text-white rounded-lg font-medium">Return to Home</a>
    </div>
  );
} 