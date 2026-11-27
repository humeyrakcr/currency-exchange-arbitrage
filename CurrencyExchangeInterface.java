import java.util.ArrayList;
import java.util.Stack;

public interface CurrencyExchangeInterface {
    ArrayList<ExchangeRate> mostProfitableCurrencyConversion(
            CurrencyGraph graph, String fromCurrency, String toCurrency)
            throws CurrencyNotFoundException;

    // Pop entries in traversal order. An empty stack means no arbitrage was found.
    Stack<ExchangeRate> findArbitrage(CurrencyGraph graph);
}
