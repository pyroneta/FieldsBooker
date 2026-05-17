package pyroneta.fields.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import pyroneta.fields.entity.Field;
import pyroneta.fields.service.AvailabilityResponse;
import pyroneta.fields.service.FieldService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/fields")
@RequiredArgsConstructor
public class FieldController {

    private final FieldService fieldService;

    @GetMapping
    public List<Field> listAll() {
        return fieldService.listAll();
    }

    @GetMapping("/{id}")
    public Field findById(@PathVariable UUID id) {
        return fieldService.findById(id);
    }

    @GetMapping("/available")
    public List<Field> listAvailable() {
        return fieldService.listAvailable();
    }

    @GetMapping("/{id}/availability")
    public List<AvailabilityResponse> getAvailability(
            @PathVariable UUID id,
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end,
            @RequestParam(required = false) UUID excludeBooking
    ) {
        return fieldService.getAvailability(id, start, end, excludeBooking);
    }
}