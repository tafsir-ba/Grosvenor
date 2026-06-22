// Brand logo — the supplied SVG set is the only logo source.
const FILES = {
    "blue-horizontal": "/brand/grosvenor_blue-horizontal.svg",
    "blue-wide": "/brand/grosvenor_blue-wide.svg",
    "gold-horizontal": "/brand/grosvenor_gold-horizontal.svg",
    "gold-wide": "/brand/grosvenor_gold-wide.svg",
    "white-horizontal": "/brand/grosvenor_white-horizontal.svg",
    "white-wide": "/brand/grosvenor_white-wide.svg",
    "ink-horizontal": "/brand/grosvenor_black-horizontal.svg",
    "ink-wide": "/brand/grosvenor_black-wide.svg",
};

export default function Logo({ color = "blue", layout = "horizontal", className = "", ...rest }) {
    const src = FILES[`${color}-${layout}`] || FILES["blue-horizontal"];
    return (
        <img
            src={src}
            alt="Grosvenor Vistas"
            className={className}
            data-testid="brand-logo"
            {...rest}
        />
    );
}
