package pyroneta.fields.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pyroneta.fields.entity.Bill;
import pyroneta.fields.entity.Booking;

import java.util.UUID;
import java.util.Optional;
@Repository
public interface BillRepository extends JpaRepository<Bill, UUID> {
    Optional<Bill> findByBooking(Booking booking);
}
