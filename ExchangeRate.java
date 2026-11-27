import java.util.Objects;

public final class ExchangeRate {
    public final String fromCurrency;
    public final String toCurrency;
    public final double rate;

    public ExchangeRate(String fromCurrency, String toCurrency, double rate) {
        if (!Double.isFinite(rate) || rate <= 0) {
            throw new IllegalArgumentException("Exchange rate must be positive and finite");
        }
        this.fromCurrency = Objects.requireNonNull(fromCurrency);
        this.toCurrency = Objects.requireNonNull(toCurrency);
        this.rate = rate;
    }

    public double getNegativeLog() {
        return -Math.log(rate);
    }
}
