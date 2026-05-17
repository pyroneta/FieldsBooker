package pyroneta.fields.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import pyroneta.fields.entity.enums.StatusBooking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "booking")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id_booking")
    private UUID idBooking;

    @ManyToOne
    @JoinColumn(name = "id_field", nullable = false)
    private Field field;

    @ManyToOne
    @JoinColumn(name = "id_client", nullable = true)
    private Client client;

    @Column(name = "date_start", nullable = false)
    private LocalDateTime dateStart;

    @Column(name = "date_end", nullable = false)
    private LocalDateTime dateEnd;

    @Column(nullable = false)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private StatusBooking status = StatusBooking.pending;

    private String observations;

    @Column(name = "created_in")
    private LocalDateTime createdIn = LocalDateTime.now();
}