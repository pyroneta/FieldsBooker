package pyroneta.fields.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "sport")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sport {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id_sport")
    private UUID idSport;

    @Column(nullable = false)
    private String name;

    @Column(name = "image_url_sport")
    private String imageUrlSport;
}