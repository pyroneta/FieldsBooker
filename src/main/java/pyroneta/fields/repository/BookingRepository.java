package pyroneta.fields.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pyroneta.fields.entity.Client;
import pyroneta.fields.entity.Booking;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    @Query("SELECT b FROM Booking b WHERE b.field.idField = :idField AND b.dateStart BETWEEN :start AND :end AND b.status != 'cancelled'")
    List<Booking> findByField_IdFieldAndDateStartBetween(
            @Param("idField") UUID idField,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("SELECT b FROM Booking b WHERE b.field.idField = :fieldId AND b.dateStart BETWEEN :start AND :end AND b.idBooking != :excludeId")
    List<Booking> findByFieldExcluding(
            @Param("fieldId") UUID fieldId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("excludeId") UUID excludeId
    );
    List<Booking> findByClient(Client cliente);
    List<Booking> findByClient_IdClient(UUID clientId);

    // Para verificar si una cancha está ocupada en un horario
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.field.idField = :idField " +
            "AND b.status != 'cancelled' AND b.dateStart < :dateEnd AND b.dateEnd > :dateStart")
    boolean existsOverlap(@Param("idField") UUID idField,
                          @Param("dateStart") LocalDateTime dateStart,
                          @Param("dateEnd") LocalDateTime dateEnd);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.field.idField = :idField " +
            "AND b.idBooking != :excludeId AND b.status != 'cancelled' AND b.dateStart < :dateEnd AND b.dateEnd > :dateStart")
    boolean existsOverlapExcluding(@Param("idField") UUID idField,
                                   @Param("dateStart") LocalDateTime dateStart,
                                   @Param("dateEnd") LocalDateTime dateEnd,
                                   @Param("excludeId") UUID excludeId);
}