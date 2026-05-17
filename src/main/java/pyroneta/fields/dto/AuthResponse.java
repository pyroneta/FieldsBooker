package pyroneta.fields.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class AuthResponse {
    private UUID idClient;
    private String name;
    private String lastname;
    private String email;
    private String phoneNumber;
    private String token;
}
