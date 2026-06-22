import { MapPin, ExternalLink } from "lucide-react";
import { PROJECT } from "@/lib/constants";
import { trackClick } from "@/lib/tracking";
import { LEAD_TYPE } from "@/lib/constants";

export default function MapSection() {
    return (
        <div className="grid gap-0 overflow-hidden rounded-sm border border-border lg:grid-cols-2" data-testid="map-section">
            <div className="bg-brand-blue p-10 text-white md:p-12">
                <p className="overline text-brand-gold">Find Us</p>
                <h3 className="mt-4 font-display text-3xl">{PROJECT.location.split(" · ")[0]}</h3>
                <div className="mt-6 flex items-start gap-3 text-white/85">
                    <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" />
                    <p className="leading-relaxed">{PROJECT.contact.address}</p>
                </div>
                <a
                    href={PROJECT.contact.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="map-directions-link"
                    className="mt-8 inline-flex items-center gap-2 border-b border-brand-gold pb-1 text-sm uppercase tracking-[0.14em] text-brand-gold transition-opacity hover:opacity-80"
                >
                    Get Directions <ExternalLink className="h-4 w-4" />
                </a>
            </div>
            <div className="min-h-[340px]">
                <iframe
                    title="Grosvenor Vistas location"
                    src={PROJECT.contact.mapEmbed}
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </div>
        </div>
    );
}
