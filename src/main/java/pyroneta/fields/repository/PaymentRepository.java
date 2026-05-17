package pyroneta.fields.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pyroneta.fields.entity.Payment;
import pyroneta.fields.entity.Booking;

import java.util.UUID;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByBooking(Booking booking);
}
