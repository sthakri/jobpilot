import Image from "next/image";

export function DashboardPreview() {
  return (
    <section className="bg-background pb-20">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="bg-surface border border-border rounded-2xl p-3 shadow-card max-w-5xl mx-auto">
          <div className="relative w-full aspect-[2/1] overflow-hidden rounded-xl bg-surface">
            <Image
              src="/images/dashboard-demo.png"
              alt="JobPilot dashboard preview"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 1440px) 100vw, 1440px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
