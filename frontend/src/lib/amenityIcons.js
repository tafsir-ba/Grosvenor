import {
    Waves, Dumbbell, PartyPopper, ToyBrick, Trees,
    KeyRound, ArrowUpDown, Car, Fingerprint, Trash2,
    Power, Droplets, Filter, Sprout, ShieldCheck,
} from "lucide-react";

export const AMENITY_ICONS = {
    Waves,
    Dumbbell,
    PartyPopper,
    ToyBrick,
    Trees,
    KeyRound,
    ArrowUpDown,
    Car,
    Fingerprint,
    Trash2,
    Power,
    Droplets,
    Filter,
    Sprout,
    ShieldCheck,
};

export function resolveAmenityIcon(name) {
    return AMENITY_ICONS[name] || Waves;
}
