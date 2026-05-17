package pyroneta.fields.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pyroneta.fields.entity.Booking;
import pyroneta.fields.entity.Field;
import pyroneta.fields.entity.enums.StatusField;
import pyroneta.fields.repository.BookingRepository;
import pyroneta.fields.repository.FieldRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FieldService {

    private final FieldRepository fieldRepository;
    private final BookingRepository bookingRepository;

    public List<Field> listAll() {
        return fieldRepository.findAll();
    }

    public List<Field> listAvailable() {
        return fieldRepository.findByStatus(StatusField.available);
    }

    public Field findById(UUID id) {
        return fieldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Field not found"));
    }

    public List<AvailabilityResponse> getAvailability(
            UUID fieldId,
            LocalDateTime start,
            LocalDateTime end,
            UUID excludeBooking
    ) {

        List<Booking> bookings = excludeBooking != null
                ? bookingRepository.findByFieldExcluding(fieldId, start, end, excludeBooking)
                : bookingRepository.findByField_IdFieldAndDateStartBetween(fieldId, start, end);

        return bookings.stream()
                .map(b -> new AvailabilityResponse(
                        b.getDateStart(),
                        b.getDateEnd(),
                        b.getStatus().name()
                ))
                .toList();
    }
}