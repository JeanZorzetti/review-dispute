'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/src/components/ui/accordion'
import { FAQ, FAQ_TITLE } from './site-config'

export function Faq() {
  return (
    <section className="border-y border-line bg-surface px-5 py-16 md:px-10">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-extrabold uppercase md:text-3xl">{FAQ_TITLE}</h2>
        <Accordion type="single" collapsible className="mt-8">
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-line">
              <AccordionTrigger className="text-left text-base font-semibold hover:text-accent">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
