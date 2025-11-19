import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FAQAccordion } from './FAQAccordion';
import type { FAQCategory } from '@/lib/data/faq-data';

type FAQSectionProps = {
  category: FAQCategory;
};

export function FAQSection({ category }: FAQSectionProps) {
  return (
    <Card id={category.title.toLowerCase().replace(/\s+/g, '-')}>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{category.icon}</span>
          <div>
            <CardTitle className="text-2xl">{category.title}</CardTitle>
            <CardDescription className="mt-1">{category.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <FAQAccordion items={category.items} category={category.title} />
      </CardContent>
    </Card>
  );
}
