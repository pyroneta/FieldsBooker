package pyroneta.fields.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pyroneta.fields.entity.Sport;

import java.util.UUID;


@Repository
public interface SportRepository extends JpaRepository<Sport, UUID> {
}