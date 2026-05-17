package pyroneta.fields.service;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AvailabilityResponse {

    private LocalDateTime dateStart;

    private LocalDateTime dateEnd;

    private String status;
}