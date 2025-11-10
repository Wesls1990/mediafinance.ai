export default function Footer(){
  const year = new Date().getFullYear()
  return (
    <footer className="mt-16 mb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card px-4 py-3 text-sm flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {year} MediaFinance.Ai™ — All rights reserved.</span>
          <span className="text-gray-300">Built for film & HETV finance.</span>
        </div>
      </div>
    </footer>
  )
}
