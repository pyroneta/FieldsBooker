package pyroneta.fields.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CreateBookingRequest {

    @NotNull(message = "Field is required")
    @JsonProperty("id_field")
    private UUID idField;

@NotNull(message = "Start date is required")
    @Future(message = "Start date must be in the future")
    @JsonProperty("date_start")
    private LocalDateTime dateStart;

    @NotNull(message = "End date is required")
    @JsonProperty("date_end")
    private LocalDateTime dateEnd;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than 0")
    @JsonProperty("amount")
    private BigDecimal amountPaid;

    @NotNull(message = "Payment type is required")
    @JsonProperty("type_payment")
    private String paymentType;

    private String observations;
}