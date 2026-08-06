import Link from "next/link";

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-cardline mt-10">
      <div className="footer footer-center sm:footer-horizontal max-w-6xl mx-auto px-4 sm:px-6 py-5 text-chalk-300">
        <aside className="items-center">
          <Link href="/" className="font-display text-2xl tracking-wide text-chalk-100">
            SPORTS<span className="text-floodlight-500">WEEK</span>
          </Link>
          <p className="text-xs text-chalk-300">© {new Date().getFullYear()} ইউনিভার্সিটি স্পোর্টস উইক ফুটবল</p>
        </aside>
        <nav className="flex">
          Developed by
          <a
            href="https://www.linkedin.com/in/lavib-uddin-ashik"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-chalk-300 hover:text-floodlight-500 transition-colors"
          >
            <LinkedInIcon />
            <span className="text-floodlight-500 text-[15px]  hover:text-green-500"> Md. Lavib Uddin Ashik</span>
          </a>
        </nav>
      </div>
    </footer>
  );
}
