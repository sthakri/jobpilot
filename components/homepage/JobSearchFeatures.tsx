import Image from "next/image";

const searchFeatures = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 text-accent"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
    title: "Find jobs that actually fit",
    description:
      "Search by title and location or paste a job link. Get matched roles you can quickly scan.",
    highlight: true,
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 text-accent"
      >
        <path d="M6 22V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M12 11v.01" />
        <path d="M12 16v.01" />
        <path d="M16 11v.01" />
        <path d="M16 16v.01" />
        <path d="M8 11v.01" />
        <path d="M8 16v.01" />
      </svg>
    ),
    title: "Know the Company Before You Apply",
    description:
      "Stop guessing what a company is about. JobPilot browses their site and gives you everything you need to apply with confidence.",
    highlight: false,
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 text-accent"
      >
        <rect width="16" height="20" x="4" y="2" rx="2" />
        <path d="M9 16h.01" />
        <path d="M13 16h2" />
        <path d="M9 12h.01" />
        <path d="M13 12h2" />
        <path d="M9 8h.01" />
        <path d="M13 8h2" />
      </svg>
    ),
    title: "Keep track of every application",
    description:
      "Keep a clear view of every job you’ve found, tailored. Your activity and progress all stay in one simple place.",
    highlight: false,
  },
];

export function JobSearchFeatures() {
  return (
    <section className="bg-background py-20">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-8">
            <h2 className="text-4xl font-semibold text-text-primary leading-tight">
              Manage Your Job
              <br />
              Search With Ease
            </h2>

            {searchFeatures.map((feature, index) => (
              <div
                key={index}
                className={`pl-4 border-l-2 ${
                  feature.highlight ? "border-accent" : "border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  {feature.icon}
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface border border-border rounded-2xl p-3 shadow-card">
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-surface">
              <Image
                src="/images/jobs-lists.png"
                alt="Job matches list"
                fill
                className="object-contain"
                sizes="(max-width: 1440px) 50vw, 720px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
