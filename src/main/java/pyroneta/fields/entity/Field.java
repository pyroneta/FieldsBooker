package pyroneta.fields.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import pyroneta.fields.entity.enums.StatusField;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "field")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Field {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id_field")
    private UUID idField;

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "sport_id", nullable = false)
    private Sport sport;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "ubication")
    private String ubication;

    @Column(name = "price_hour", nullable = false)
    private BigDecimal priceHour;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private StatusField status = StatusField.available;

    @Column(name = "imagen_url")
    private String imagenUrl;

    @Column(name = "opening_time")
    private LocalTime openingTime;

    @Column(name = "closing_time")
    private LocalTime closingTime;
}