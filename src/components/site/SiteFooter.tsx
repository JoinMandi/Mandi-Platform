import Image from "next/image";
import Link from "next/link";

/** Footer shared by the public site. */
export default function SiteFooter({
  variant = "home",
}: {
  variant?: "home" | "page";
}) {
  return (
    <footer
      className={variant === "home" ? "bg-brown-warm text-peach" : "bg-brown text-[#FFF5E6]"}
    >
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-7 px-5 py-12 sm:px-10">
        <div className="flex items-center gap-4">
          <Image
            src="/brand/mandi-footer-logo.png"
            alt="Mandi"
            width={68}
            height={30}
            className="h-auto w-[64px]"
          />
          <p className="text-sm font-semibold">
            Talk to Mandi · Khuluma noMandi · Thetha noMandi · Praat met Mandi
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-5 text-sm">
          <Link
            href={variant === "home" ? "/doctors" : "/"}
            className="text-[#FFF5E6] no-underline hover:underline"
          >
            {variant === "home" ? "For doctors" : "Home"}
          </Link>
          <Link
            href={variant === "home" ? "/about" : "/doctors"}
            className="text-[#FFF5E6] no-underline hover:underline"
          >
            {variant === "home" ? "About" : "For doctors"}
          </Link>
          <a
            href="mailto:hello@joinmandi.com"
            className="text-[#FFF5E6] no-underline hover:underline"
          >
            hello@joinmandi.com
          </a>
        </nav>

        <p className="w-full text-xs text-[#E9CDB4]">
          {variant === "home" && "Need to talk now? SADAG 0800 567 567 · "}
          JOINMANDI (PTY) LTD 2026/805791/07 ·{" "}
          <Link href="/consent" className="underline">
            Privacy
          </Link>
        </p>
      </div>
    </footer>
  );
}
