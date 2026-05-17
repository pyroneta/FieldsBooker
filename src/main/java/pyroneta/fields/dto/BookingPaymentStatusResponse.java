package pyroneta.fields.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class BookingPaymentStatusResponse {
    private BigDecimal total;
    private BigDecimal paid;
    private BigDecimal pending;
    private String status;
}