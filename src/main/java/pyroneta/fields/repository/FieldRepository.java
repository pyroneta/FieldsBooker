package pyroneta.fields.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pyroneta.fields.entity.Field;
import pyroneta.fields.entity.enums.StatusField;

import java.util.UUID;
import java.util.List;

@Repository
public interface FieldRepository extends JpaRepository<Field, UUID> {


    List<Field> findByStatus(StatusField status);
}