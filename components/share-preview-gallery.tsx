import Image from "next/image";
import Link from "next/link";

const items = [
  {
    title: "Main social preview",
    detail: "The default branded preview image used when Stablelane pages are shared.",
    src: "/og/stablelane-og.png",
  },
  {
    title: "Dashboard share card",
    detail: "A second branded card for workspace and product progress updates.",
    src: "/og/stablelane-og-dashboard.png",
  },
  {
    title: "Escrow share card",
    detail: "A third branded card for payment and escrow related previews.",
    src: "/og/stablelane-og-escrow.png",
  },
];

export function SharePreviewGallery() {
  return (
    <section className="mx-auto w-[min(calc(100%-36px),1280px)] pb-2 pt-4">
      <div className="mb-8 grid items-end gap-6 lg:grid-cols-[.95fr_1.05fr]">
        <div>
          <div className="mb-3 inline-flex items-center text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[var(--accent)]">
            Brand sharing
          </div>
          <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2.4rem,4vw,3.6rem)] leading-[0.98] tracking-[-0.05em]">
            Sharable previews that match the product.
          </h2>
        </div>
        <p className="max-w-3xl text-[1rem] leading-8 text-[var(--muted)]">
          Stablelane now includes branded social preview graphics so progress screenshots, updates, and launch posts look consistent with the app itself.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.title}
            className="overflow-hidden rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(14,25,18,.84),rgba(10,18,13,.8))] shadow-[0_18px_60px_rgba(0,0,0,.26)]"
          >
            <div className="relative aspect-[1200/630] w-full">
              <Image src={item.src} alt={item.title} fill className="object-cover" />
            </div>
            <div className="p-5">
              <div className="mb-2 text-[1rem] font-semibold">{item.title}</div>
              <p className="mb-4 text-[0.84rem] leading-6 text-[var(--muted)]">{item.detail}</p>
              <Link href={item.src} target="_blank" className="text-[0.84rem] font-semibold text-[var(--accent)]">
                Open image
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
