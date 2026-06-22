import { PROJECT, LEAD_TYPE } from "@/lib/constants";
import { trackClick } from "@/lib/tracking";

// Fixed WhatsApp button. Records a whatsapp_click event before opening.
export default function WhatsappFloatingButton() {
    const handleClick = () => trackClick(LEAD_TYPE.WHATSAPP_CLICK);
    return (
        <a
            href={PROJECT.contact.whatsapp}
            target="_blank"
            rel="noreferrer"
            onClick={handleClick}
            data-testid="whatsapp-float-button"
            aria-label="Chat on WhatsApp"
            className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-none bg-brand-green text-white shadow-lg transition-transform duration-300 hover:scale-110"
        >
            <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current" aria-hidden="true">
                <path d="M16 .5C7.4.5.5 7.4.5 16c0 2.8.7 5.4 2 7.7L.5 31.5l8-2.1c2.2 1.2 4.8 1.9 7.5 1.9 8.6 0 15.5-6.9 15.5-15.5S24.6.5 16 .5zm0 28c-2.4 0-4.7-.6-6.7-1.8l-.5-.3-4.7 1.2 1.3-4.6-.3-.5C3.6 20.1 3 18.1 3 16 3 8.8 8.8 3 16 3s13 5.8 13 13-5.8 12.5-13 12.5zm7.2-9.4c-.4-.2-2.3-1.1-2.7-1.3s-.6-.2-.9.2-1 1.3-1.2 1.5-.4.3-.8.1c-2.3-1.2-3.8-2.1-5.4-4.7-.4-.7.4-.6 1.1-2 .1-.3.1-.5 0-.7s-.9-2.1-1.2-2.9c-.3-.8-.6-.7-.9-.7h-.8c-.3 0-.7.1-1.1.5s-1.5 1.4-1.5 3.5 1.5 4.1 1.7 4.3c.2.3 3 4.6 7.3 6.4 2.7 1.2 3.8 1.3 5.1 1.1.8-.1 2.3-.9 2.6-1.9.3-.9.3-1.7.2-1.9-.1-.1-.3-.2-.7-.4z" />
            </svg>
        </a>
    );
}
