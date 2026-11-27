import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Stack;

public class CurrencyExchange implements CurrencyExchangeInterface {
    @Override
    public ArrayList<ExchangeRate> mostProfitableCurrencyConversion(
            CurrencyGraph graph, String fromCurrency, String toCurrency)
            throws CurrencyNotFoundException {
        int from = graph.getCurrencyNo(fromCurrency);
        int to = graph.getCurrencyNo(toCurrency);
        if (from == -1 || to == -1) {
            throw new CurrencyNotFoundException("Currency not found in the exchange graph");
        }

        BellmanFord result = new BellmanFord(graph, from);
        if (!result.cycle.isEmpty()) {
            throw new IllegalArgumentException("A reachable arbitrage cycle makes the conversion unbounded");
        }
        ArrayList<ExchangeRate> route = new ArrayList<>();
        for (int vertex = to; vertex != from;) {
            ExchangeRate edge = result.parents[vertex];
            if (edge == null) return null;
            route.add(edge);
            vertex = graph.getCurrencyNo(edge.fromCurrency);
        }
        Collections.reverse(route);
        return route;
    }

    @Override
    public Stack<ExchangeRate> findArbitrage(CurrencyGraph graph) {
        // Zero-initialization acts as a super-source, including disconnected components.
        List<ExchangeRate> cycle = new BellmanFord(graph, -1).cycle;
        Stack<ExchangeRate> result = new Stack<>();
        for (int i = cycle.size() - 1; i >= 0; i--) result.push(cycle.get(i));
        return result;
    }

    private static final class BellmanFord {
        private static final double EPSILON = 1e-12;
        final ExchangeRate[] parents;
        final List<ExchangeRate> cycle = new ArrayList<>();

        BellmanFord(CurrencyGraph graph, int source) {
            int size = graph.getCurrencies().size();
            double[] distances = new double[size];
            parents = new ExchangeRate[size];
            if (source >= 0) {
                Arrays.fill(distances, Double.POSITIVE_INFINITY);
                distances[source] = 0;
            }

            int changed = -1;
            for (int pass = 0; pass < size; pass++) {
                changed = -1;
                for (ExchangeRate edge : graph.edges()) {
                    int from = graph.getCurrencyNo(edge.fromCurrency);
                    int to = graph.getCurrencyNo(edge.toCurrency);
                    double candidate = distances[from] + edge.getNegativeLog();
                    if (candidate < distances[to] - EPSILON) {
                        distances[to] = candidate;
                        parents[to] = edge;
                        changed = to;
                    }
                }
                if (changed == -1) return;
            }

            if (changed == -1) return;
            int vertex = changed;
            // Following V predecessors enters the cycle even when the last update was downstream.
            for (int i = 0; i < size; i++) {
                vertex = graph.getCurrencyNo(parents[vertex].fromCurrency);
            }
            int start = vertex;
            do {
                ExchangeRate edge = parents[vertex];
                cycle.add(edge);
                vertex = graph.getCurrencyNo(edge.fromCurrency);
            } while (vertex != start);
            Collections.reverse(cycle);
        }
    }
}
