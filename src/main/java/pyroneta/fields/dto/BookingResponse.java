package pyroneta.fields.dto;

import lombok.Builder;
import lombok.Data;
import pyroneta.fields.entity.enums.StatusBooking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class BookingResponse {
    private UUID idBooking;
    private UUID idField;
    private String fieldName;
    private UUID idClient;
    private String clientName;
    private String clientEmail;
    private String clientPhone;
    private LocalDateTime dateStart;
    private LocalDateTime dateEnd;
    private BigDecimal total;
    private StatusBooking status;
    private String observations;
    private LocalDateTime createdIn;
    private BigDecimal amount;
    private String typePayment;
}
