package pyroneta.fields.service;

import pyroneta.fields.dto.BookingResponse;
import pyroneta.fields.dto.CreateBookingRequest;
import pyroneta.fields.entity.*;
import pyroneta.fields.entity.enums.StatusBill;
import pyroneta.fields.entity.enums.StatusBooking;
import pyroneta.fields.entity.enums.StatusField;
import pyroneta.fields.entity.enums.TypePayment;
import pyroneta.fields.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FieldRepository fieldRepository;
    private final ClientRepository clientRepository;
    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;

    public BookingResponse createBooking(CreateBookingRequest request, UUID clientId) {

        // 1. Find field and client
        Field field = fieldRepository.findById(request.getIdField())
                .orElseThrow(() -> new RuntimeException("Cancah no encontrada"));

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        // 2. Verify field availability
        if (field.getStatus() == StatusField.not_available) {
            throw new RuntimeException("ESta cancha no esta disponible");
        }

        // 3. Verify overlapping schedules
        boolean overlap = bookingRepository.existsOverlap(
                field.getIdField(),
                request.getDateStart(),
                request.getDateEnd()
        );

        if (overlap) {
            throw new RuntimeException("The field is already booked for that time");
        }

        // 4. Calculate total
        long hours = ChronoUnit.HOURS.between(
                request.getDateStart(),
                request.getDateEnd()
        );

        BigDecimal total = field.getPriceHour()
                .multiply(BigDecimal.valueOf(hours));

        // 5. Validate minimum payment (50%)
        BigDecimal minimumRequired = total.multiply(BigDecimal.valueOf(0.5));

        if (request.getAmountPaid().compareTo(minimumRequired) < 0) {
            throw new RuntimeException(
                    "El pago minimo es 50%. Debes pagar por lo menos " +
                            minimumRequired + " Bs"
            );
        }


        Booking booking = new Booking();
        booking.setField(field);
        booking.setClient(client);
        booking.setDateStart(request.getDateStart());
        booking.setDateEnd(request.getDateEnd());
        booking.setTotal(total);
        booking.setStatus(StatusBooking.confirmed);
        booking.setObservations(request.getObservations());

        bookingRepository.save(booking);

        // 7. Register payment
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(request.getAmountPaid());
        payment.setType(TypePayment.valueOf(request.getPaymentType()));

        paymentRepository.save(payment);

        // 8. Generate bill
        StatusBill billStatus = request.getAmountPaid().compareTo(total) >= 0
                ? StatusBill.paid
                : StatusBill.partially_paid;

        Bill bill = new Bill();
        bill.setBooking(booking);
        bill.setTotalAmount(total);
        bill.setPaidAmount(request.getAmountPaid());
        bill.setStatus(billStatus);

        billRepository.save(bill);

        return toResponse(booking, payment);
    }

    public BookingResponse updateBooking(UUID idBooking, LocalDateTime dateStart, LocalDateTime dateEnd, BigDecimal additionalAmount) {

        Booking booking = bookingRepository.findById(idBooking)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        if (booking.getStatus() == StatusBooking.cancelled) {
            throw new RuntimeException("No puedes editar una reserva cancelada");
        }

        if (LocalDateTime.now().isAfter(booking.getDateStart())) {
            throw new RuntimeException("No puedes editar una reserva q ya empezo");
        }

        boolean overlap = bookingRepository.existsOverlapExcluding(
                booking.getField().getIdField(), dateStart, dateEnd, idBooking);

        if (overlap) {
            throw new RuntimeException("La cancha ya esta reservada pa esa hora");
        }

        long hours = ChronoUnit.HOURS.between(dateStart, dateEnd);
        BigDecimal newTotal = booking.getField().getPriceHour().multiply(BigDecimal.valueOf(hours));

        booking.setDateStart(dateStart);
        booking.setDateEnd(dateEnd);
        booking.setTotal(newTotal);
        bookingRepository.save(booking);

        if (additionalAmount != null && additionalAmount.compareTo(BigDecimal.ZERO) > 0) {
            TypePayment originalType = paymentRepository.findByBooking(booking).stream()
                    .findFirst()
                    .map(Payment::getType)
                    .orElse(TypePayment.cash);
            Payment extra = new Payment();
            extra.setBooking(booking);
            extra.setAmount(additionalAmount);
            extra.setType(originalType);
            paymentRepository.save(extra);
        }

        billRepository.findByBooking(booking).ifPresent(bill -> {
            BigDecimal totalPaid = paymentRepository.findByBooking(booking).stream()
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            StatusBill billStatus = totalPaid.compareTo(newTotal) >= 0 ? StatusBill.paid : StatusBill.partially_paid;
            bill.setTotalAmount(newTotal);
            bill.setPaidAmount(totalPaid);
            bill.setStatus(billStatus);
            billRepository.save(bill);
        });

        return toResponseWithPayment(booking);
    }

    public BookingResponse cancelBooking(UUID idBooking) {

        Booking booking = bookingRepository.findById(idBooking)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        // Validate at least 1 hour before
        if (LocalDateTime.now().isAfter(booking.getDateStart().minusHours(1))) {
            throw new RuntimeException(
                    "No puedes cancelar antes de 1 hora de la reserva"
            );
        }

        booking.setStatus(StatusBooking.cancelled);
        bookingRepository.save(booking);

        // Update bill
        billRepository.findByBooking(booking).ifPresent(bill -> {
            bill.setStatus(StatusBill.cancelled);
            billRepository.save(bill);
        });

        Payment payment = paymentRepository.findByBooking(booking).stream().findFirst().orElse(null);
        return toResponse(booking, payment);
    }

    public List<BookingResponse> listAll() {
        return bookingRepository.findAll().stream().map(this::toResponseWithPayment).toList();
    }

    public List<BookingResponse> getByClientId(UUID clientId) {
        return bookingRepository.findByClient_IdClient(clientId).stream().map(this::toResponseWithPayment).toList();
    }

    public BookingResponse findById(UUID idBooking) {
        Booking booking = bookingRepository.findById(idBooking)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        return toResponseWithPayment(booking);
    }

    private BookingResponse toResponseWithPayment(Booking booking) {
        Payment payment = paymentRepository.findByBooking(booking).stream().findFirst().orElse(null);
        return toResponse(booking, payment);
    }

    private BookingResponse toResponse(Booking booking, Payment payment) {
        return BookingResponse.builder()
                .idBooking(booking.getIdBooking())
                .idField(booking.getField().getIdField())
                .fieldName(booking.getField().getName())
                .idClient(booking.getClient() != null ? booking.getClient().getIdClient() : null)
                .clientName(booking.getClient() != null ? booking.getClient().getName() + " " + booking.getClient().getLastname() : null)
                .clientEmail(booking.getClient() != null ? booking.getClient().getEmail() : null)
                .clientPhone(booking.getClient() != null ? booking.getClient().getPhoneNumber() : null)
                .dateStart(booking.getDateStart())
                .dateEnd(booking.getDateEnd())
                .total(booking.getTotal())
                .status(booking.getStatus())
                .observations(booking.getObservations())
                .createdIn(booking.getCreatedIn())
                .amount(payment != null ? payment.getAmount() : null)
                .typePayment(payment != null && payment.getType() != null ? payment.getType().name() : null)
                .build();
    }

    public Map<String, Object> paymentStatus(UUID idBooking) {

        Booking booking = bookingRepository.findById(idBooking)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        BigDecimal paid = paymentRepository.findByBooking(booking)
                .stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pending = booking.getTotal().subtract(paid);

        return Map.of(
                "total", booking.getTotal(),
                "paid", paid,
                "pending", pending,
                "status", booking.getStatus()
        );
    }
}