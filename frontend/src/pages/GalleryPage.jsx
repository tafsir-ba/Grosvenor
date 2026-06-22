import Hero from "@/components/shared/Hero";
import SectionHeading from "@/components/shared/SectionHeading";
import GalleryGrid from "@/components/shared/GalleryGrid";
import { GALLERY } from "@/lib/constants";

export default function GalleryPage() {
    return (
        <div data-testid="gallery-page">
            <Hero
                image="/gallery/homestaging-evening-terrace.png"
                height="min-h-[56vh]"
                overline="Gallery"
                title="A closer look"
                subtitle="Architecture, interiors and lifestyle at Grosvenor Vistas."
            />
            <section className="container-x py-24 md:py-32">
                <SectionHeading overline="Imagery" title="Spaces to inspire" className="mb-14" />
                <GalleryGrid items={GALLERY} />
            </section>
        </div>
    );
}
