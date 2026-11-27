import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

public class Demo {
    public static void main(String[] args) throws CurrencyNotFoundException {
        CurrencyExchange system = new CurrencyExchange();
        CurrencyGraph balanced = graph(1.24);
        List<ExchangeRate> route = system.mostProfitableCurrencyConversion(balanced, "USD", "GBP");
        System.out.printf(Locale.ROOT, "Balanced: 1,000.00 USD → %.2f GBP%n", converted(route));

        var cycle = system.findArbitrage(graph(1.29));
        double amount = 1000;
        String start = cycle.peek().fromCurrency;
        StringBuilder path = new StringBuilder(start);
        while (!cycle.empty()) {
            ExchangeRate edge = cycle.pop();
            path.append(" → ").append(edge.toCurrency);
            amount *= edge.rate;
        }
        System.out.printf(Locale.ROOT, "Arbitrage: %s | 1,000.00 %s → %,.2f %s%n",
                path, start, amount, start);
    }

    static CurrencyGraph graph(double poundsToDollars) {
        CurrencyGraph graph = new CurrencyGraph(new LinkedHashSet<>(List.of("USD", "EUR", "GBP")));
        graph.addExchangeRate(new ExchangeRate("USD", "EUR", .92));
        graph.addExchangeRate(new ExchangeRate("EUR", "USD", 1.075));
        graph.addExchangeRate(new ExchangeRate("EUR", "GBP", .86));
        graph.addExchangeRate(new ExchangeRate("GBP", "EUR", 1.14));
        graph.addExchangeRate(new ExchangeRate("GBP", "USD", poundsToDollars));
        graph.addExchangeRate(new ExchangeRate("USD", "GBP", .76));
        return graph;
    }

    private static double converted(List<ExchangeRate> route) {
        return route.stream().mapToDouble(edge -> edge.rate).reduce(1000, (a, b) -> a * b);
    }
}
