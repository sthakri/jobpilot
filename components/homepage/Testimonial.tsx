import Image from "next/image";

export function Testimonial() {
  return (
    <section className="bg-background py-20">
      <div className="max-w-[1440px] mx-auto px-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Success Stories
        </p>

        <blockquote className="mt-5 text-xl font-medium text-text-primary max-w-2xl mx-auto leading-relaxed">
          “I used to spend my evenings copy-pasting resumes. Now I open my
          dashboard to see interviews waiting. It feels like cheating. Had 3 offers
          on the table simultaneously.”
        </blockquote>

        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-surface-secondary">
            <Image
              src="/images/user-icon.png"
              alt="Tom Wilson"
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-text-primary">
              Tom Wilson
            </p>
            <p className="text-xs text-text-secondary">Junior Developer</p>
          </div>
        </div>
      </div>
    </section>
  );
}
