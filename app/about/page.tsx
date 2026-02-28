export default function About() {
    return (
        <div className="min-h-screen bg-[var(--bg)] px-6">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="pt-32 pb-24 border-b border-[var(--border)]">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--muted)] mb-5">About</p>
                    <h1 className="font-heading text-6xl md:text-8xl text-[var(--fg)] leading-none max-w-lg">
                        Wear the Vibe.
                    </h1>
                </div>

                {/* Body */}
                <div className="py-24 grid grid-cols-1 md:grid-cols-12 gap-16">

                    {/* Quote pull */}
                    <div className="md:col-span-4">
                        <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--muted)] mb-6">Our Philosophy</p>
                        <blockquote className="border-l border-[var(--gold)] pl-6">
                            <p className="font-heading text-2xl italic text-[var(--fg)] leading-relaxed">
                                "A statement. Not just clothing."
                            </p>
                        </blockquote>
                    </div>

                    {/* Story */}
                    <div className="md:col-span-8 space-y-6 text-[var(--muted)] text-sm leading-relaxed">
                        <p>
                            BroX is not just a clothing brand — it is a statement. Founded by{" "}
                            <span className="text-[var(--fg)] font-medium">Neeraj</span> and{" "}
                            <span className="text-[var(--fg)] font-medium">Abisheak</span>, BroX was born from a
                            vision to fuse modern streetwear, techwear, and futuristic style into a premium fashion
                            experience.
                        </p>
                        <p>
                            BroX empowers self-expression, celebrates uniqueness, and delivers streetwear that is not
                            just clothing, but an identity. Each piece is designed with intention — a deliberate
                            rejection of the ordinary in favour of the extraordinary.
                        </p>
                        <p>
                            Join the BroX movement. Own your identity.
                        </p>
                    </div>
                </div>

                {/* Founder tagline */}
                <div className="py-16 border-t border-[var(--border)] flex justify-between items-center flex-wrap gap-4">
                    <p className="font-heading text-xl italic text-[var(--fg)]">
                        "Wear the Vibe, Own the Identity."
                    </p>
                    <p className="text-xs tracking-widest uppercase text-[var(--muted)]">— Neeraj & Abisheak</p>
                </div>

            </div>
        </div>
    );
}
