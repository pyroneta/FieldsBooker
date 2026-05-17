package pyroneta.fields.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import pyroneta.fields.dto.BookingResponse;
import pyroneta.fields.dto.CreateBookingRequest;
import pyroneta.fields.service.BookingService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    public List<BookingResponse> listAll() {
        return bookingService.listAll();
    }

    @GetMapping("/{id}")
    public BookingResponse findById(@PathVariable UUID id) {
        return bookingService.findById(id);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyBookings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UUID clientId)) {
            return ResponseEntity.status(401).body("Authentication required");
        }
        return ResponseEntity.ok(bookingService.getByClientId(clientId));
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody @Valid CreateBookingRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UUID clientId)) {
            return ResponseEntity.status(401).body("Authentication required");
        }
        return ResponseEntity.ok(bookingService.createBooking(request, clientId));
    }

    @PutMapping("/{id}")
    public BookingResponse updateBooking(@PathVariable UUID id,
                                         @RequestParam LocalDateTime dateStart,
                                         @RequestParam LocalDateTime dateEnd,
                                         @RequestParam(required = false) java.math.BigDecimal amount) {
        return bookingService.updateBooking(id, dateStart, dateEnd, amount);
    }

    @PutMapping("/{id}/cancel")
    public BookingResponse cancelBooking(@PathVariable UUID id) {
        return bookingService.cancelBooking(id);
    }

    @GetMapping("/{id}/payment-status")
    public Map<String, Object> paymentStatus(@PathVariable UUID id) {
        return bookingService.paymentStatus(id);
    }
}
