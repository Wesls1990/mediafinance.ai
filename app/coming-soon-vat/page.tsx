export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight drop-shadow mb-4">
        VAT Checker
      </h1>
      <p className="text-gray-300 max-w-md mb-6">
        Automated VAT validation and MTD reconciliation for UK productions.  
        Built for accountants, approved by studios — coming soon.
      </p>
      <a href="/" className="button">Back to Home</a>
    </div>
  );
}
