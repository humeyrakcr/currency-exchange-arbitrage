import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

public final class CurrencyGraph {
    private final Map<String, Integer> indices = new LinkedHashMap<>();
    private final List<ExchangeRate> exchangeRates = new ArrayList<>();

    public CurrencyGraph(Set<String> currencies) {
        for (String currency : currencies) indices.put(currency, indices.size());
    }

    public int getCurrencyNo(String currency) {
        return indices.getOrDefault(currency, -1);
    }

    public Set<String> getCurrencies() {
        return Collections.unmodifiableSet(indices.keySet());
    }

    public void addExchangeRate(ExchangeRate edge) {
        if (getCurrencyNo(edge.fromCurrency) == -1 || getCurrencyNo(edge.toCurrency) == -1) {
            throw new IllegalArgumentException("Both currencies must belong to the graph");
        }
        exchangeRates.add(edge);
    }

    List<ExchangeRate> edges() {
        return Collections.unmodifiableList(exchangeRates);
    }
}
