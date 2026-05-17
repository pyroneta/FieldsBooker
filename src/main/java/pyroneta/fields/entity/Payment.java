package pyroneta.fields.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import pyroneta.fields.entity.enums.TypePayment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id_pay")
    private UUID idPay;

    @ManyToOne
    @JoinColumn(name = "id_booking", nullable = false)
    private Booking booking;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "date_pay")
    private LocalDateTime datePay = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private TypePayment type;
}