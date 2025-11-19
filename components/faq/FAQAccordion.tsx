'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { FAQItem } from '@/lib/data/faq-data';

type FAQAccordionProps = {
  items: FAQItem[];
  category: string;
};

export function FAQAccordion({ items, category }: FAQAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item, index) => {
        const itemId = `${category}-${index}`;

        return (
          <AccordionItem key={itemId} value={itemId}>
            <AccordionTrigger className="text-left">
              {item.question}
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground whitespace-pre-line">
                {item.answer}
              </p>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
