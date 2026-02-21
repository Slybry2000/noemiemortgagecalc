# Embed Instructions

This Mortgage Calculator is designed to be easily embedded into any website, including Keller Williams agent pages, via an `iframe`.

## Basic Embed

To embed the calculator, use the following HTML code:

```html
<iframe
  src="https://your-hosted-url.com"
  width="100%"
  height="800px"
  style="border: none; border-radius: 12px; overflow: hidden;"
  title="Noémie Piard - Mortgage Calculator"
></iframe>
```

*Note: Adjust the `height` as needed based on your layout. The calculator is fully responsive.*

## Query Parameters for Prefill

You can prefill the calculator with specific values by passing query parameters in the URL. This is useful if you want to link to the calculator from a specific property listing.

Available parameters:
- `price`: Home price (e.g., `500000`)
- `down`: Down payment in dollars (e.g., `100000`)
- `rate`: Interest rate percentage (e.g., `6.5`)
- `term`: Loan term in years (e.g., `30`)
- `tax`: Yearly property tax in dollars (e.g., `6000`)
- `hoa`: Monthly HOA fees in dollars (e.g., `250`)

**Example:**

```html
<iframe
  src="https://your-hosted-url.com?price=650000&down=130000&rate=6.25&hoa=300"
  width="100%"
  height="800px"
  style="border: none; border-radius: 12px; overflow: hidden;"
  title="Noémie Piard - Mortgage Calculator"
></iframe>
```

## Theme Parameter

You can force the calculator to display in light or dark mode by passing the `theme` parameter. If omitted, it will respect the user's system preference.

- `theme=light`
- `theme=dark`

**Example:**

```html
<iframe
  src="https://your-hosted-url.com?theme=dark"
  width="100%"
  height="800px"
  style="border: none; border-radius: 12px; overflow: hidden;"
  title="Noémie Piard - Mortgage Calculator"
></iframe>
```
