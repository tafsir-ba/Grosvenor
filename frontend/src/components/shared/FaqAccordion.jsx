import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FaqAccordion({ items }) {
    return (
        <Accordion type="single" collapsible className="w-full" data-testid="faq-accordion">
            {items.map((item, i) => (
                <AccordionItem key={item.q} value={`item-${i}`} data-testid={`faq-item-${i}`} className="border-border">
                    <AccordionTrigger className="text-left font-display text-lg text-brand-ink hover:text-brand-gold hover:no-underline">
                        {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                        {item.a}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
