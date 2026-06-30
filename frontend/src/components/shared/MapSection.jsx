import { MapPin, ExternalLink } from "lucide-react";
import { PROJECT } from "@/lib/constants";
import { trackClick } from "@/lib/tracking";
import { LEAD_TYPE } from "@/lib/constants";

export default function MapSection() {
    return (
        <div className="grid gap-0 overflow-hidden rounded-sm border border-border lg:grid-cols-2" data-testid="map-section">
            <div className="bg-brand-blue p-10 text-white md:p-12">
                <h3 className="font-display text-4xl md:text-5xl">{PROJECT.location.split(" · ")[0]}</h3>
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
                <a
                    href={PROJECT.contact.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="map-image-link"
                    className="group relative block h-full min-h-[340px] w-full overflow-hidden"
                >
                    <img
                        src="/media/hero-aerial.png"
                        alt="Aerial view of Grosvenor Vistas, Manor Park, Kingston 8"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-brand-blue/85 px-5 py-2.5 text-sm uppercase tracking-[0.12em] text-white backdrop-blur transition-colors group-hover:bg-brand-gold">
                        <MapPin className="h-4 w-4" /> View on Map
                    </span>
                </a>
            </div>
        </div>
    );
}
