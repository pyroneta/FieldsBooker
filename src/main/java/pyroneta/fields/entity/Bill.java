package pyroneta.fields.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import pyroneta.fields.entity.enums.StatusBill;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "bill")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id_bill")
    private UUID idBill;

    @OneToOne
    @JoinColumn(name = "id_booking", nullable = false, unique = true)
    private Booking booking;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "paid_amount", nullable = false)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private StatusBill status = StatusBill.partially_paid;

    @Column(name = "issue_date")
    private LocalDateTime issueDate = LocalDateTime.now();
}