# Currency Exchange Arbitrage System

**Category** · Graph Algorithms · Software Engineering

## Portfolio description

Currency conversion rates can hide profitable round trips across multiple currencies. This project models hypothetical exchange rates as a directed graph and uses Bellman–Ford to detect negative cycles. In the interactive demo, visitors can change a rate, inspect the highlighted arbitrage loop, or compare the best conversion route in the balanced example. The illustrated loop turns a hypothetical 1,000 USD into 1,020.65 USD before fees.

**Preview alt text** · A directed USD, EUR, and GBP graph highlights an arbitrage loop returning 1,020.65 USD from a hypothetical 1,000 USD.

## Browser demo

Open [index.html](index.html) locally or serve the web files from a static host. The HTML, CSS, and JavaScript run without a build step. All exchange rates are hypothetical.

Use `currency-arbitrage-demo.mp4` as the primary preview, `currency-arbitrage-preview.webp` as its poster and reduced-motion alternative, and the GIF as an optional loop.

## Recovered Java implementation

The supplied Java file referenced supporting classes absent from the uploaded folder. The Java source files provide a runnable reconstruction that preserves the two public exchange operations and uses a super-source for arbitrage detection across disconnected components.

With JDK 17 or newer, from the extracted folder run:

```sh
mkdir -p classes
javac -d classes *.java
java -cp classes Demo
```

The Java and JavaScript examples both produce the 1,020.65 USD cycle and the balanced USD → EUR → GBP conversion worth 791.20 GBP. The browser demo uses its own JavaScript implementation.

[Download the complete portfolio kit](currency-arbitrage-portfolio-kit.zip).
