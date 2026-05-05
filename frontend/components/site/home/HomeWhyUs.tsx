import type { ReactElement } from "react";

import type { HomeWhyUsCard, HomeWhyUsIconId } from "@/components/site/home/home-sales-data";
import { homeWhyUs } from "@/components/site/home/home-sales-data";
import {
  WhyUsIconCustom,
  WhyUsIconDeploy,
  WhyUsIconSupport,
  WhyUsIconYears
} from "@/components/site/home/why-us-icons";

const ICON_COMPONENTS = {
  years: WhyUsIconYears,
  deploy: WhyUsIconDeploy,
  support: WhyUsIconSupport,
  custom: WhyUsIconCustom
} as const satisfies Record<HomeWhyUsIconId, (props: { className?: string }) => ReactElement>;

export function HomeWhyUs() {
  const cards: readonly HomeWhyUsCard[] = homeWhyUs;
  const iconClass = "h-7 w-7 text-corporate-accent";

  return (
    <section className="border-y border-slate-800 bg-slate-900/40">
      <div className="mx-auto max-w-6xl px-4 py-20 md:py-24">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-corporate-accent">Güven</h2>
        <p className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">Neden Arrow Bilişim?</p>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Cmp = ICON_COMPONENTS[card.icon];
            return (
              <li key={card.title}>
                <article className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-950/60 p-6 shadow-lg shadow-black/15 transition hover:border-blue-500/35 hover:bg-slate-950/80">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/25 bg-corporate-accent/10">
                    <Cmp className={iconClass} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-white">{card.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{card.explanation}</p>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
