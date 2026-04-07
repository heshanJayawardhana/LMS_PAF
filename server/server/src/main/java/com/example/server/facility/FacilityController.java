package com.example.server.facility;

import com.example.server.common.ApiResponse;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.validation.Valid;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/facilities")
public class FacilityController {
    private final FacilityService service;

    public FacilityController(FacilityService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<Facility>> getAllFacilities(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) FacilityType type,
            @RequestParam(required = false) FacilityStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity
    ) {
        return new ApiResponse<>(true, service.getAll(search, type, status, location, minCapacity), null);
    }

    @GetMapping("/{id}")
    public ApiResponse<Facility> getFacilityById(@PathVariable String id) {
        return new ApiResponse<>(true, service.getById(id), null);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Facility> createFacility(@Valid @RequestBody Facility facility) {
        return new ApiResponse<>(true, service.create(facility), "Facility created successfully");
    }

    @PutMapping("/{id}")
    public ApiResponse<Facility> updateFacility(@PathVariable String id, @Valid @RequestBody Facility facility) {
        return new ApiResponse<>(true, service.update(id, facility), "Facility updated successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteFacility(@PathVariable String id) {
        service.delete(id);
        return new ApiResponse<>(true, null, "Facility deleted successfully");
    }

    @GetMapping("/report")
    public ResponseEntity<byte[]> generateFacilitiesReport() {
        List<Facility> facilities = service.getAll(null, null, null, null, null);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.WHITE);
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(15, 23, 42));
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);

            Rectangle header = new Rectangle(0, 0);
            header.setBackgroundColor(new Color(30, 64, 175));

            Paragraph title = new Paragraph("Smart Campus - Facilities Catalogue", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph subtitle = new Paragraph("Full Facilities Details Report", normalFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20f);
            document.add(subtitle);

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(10f);
            table.setWidths(new float[]{2f, 1.5f, 1f, 2f, 1.5f, 2f, 2f});

            String[] headers = {"Name", "Type", "Capacity", "Location", "Status", "Availability", "Amenities"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, sectionFont));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setBackgroundColor(new Color(219, 234, 254));
                cell.setPadding(6f);
                table.addCell(cell);
            }

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

            for (Facility f : facilities) {
                table.addCell(new Phrase(f.getName(), normalFont));
                table.addCell(new Phrase(f.getType() != null ? f.getType().name() : "-", normalFont));
                table.addCell(new Phrase(String.valueOf(f.getCapacity()), normalFont));
                table.addCell(new Phrase(f.getLocation(), normalFont));

                Color statusColor = switch (f.getStatus()) {
                    case ACTIVE -> new Color(22, 163, 74);
                    case OUT_OF_SERVICE -> new Color(220, 38, 38);
                    case MAINTENANCE -> new Color(234, 179, 8);
                    default -> Color.DARK_GRAY;
                };
                PdfPCell statusCell = new PdfPCell(new Phrase(f.getStatus() != null ? f.getStatus().name() : "-", normalFont));
                statusCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                statusCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                statusCell.setBackgroundColor(new Color(
                        Math.min(statusColor.getRed() + 80, 255),
                        Math.min(statusColor.getGreen() + 80, 255),
                        Math.min(statusColor.getBlue() + 80, 255)
                ));
                table.addCell(statusCell);

                table.addCell(new Phrase(f.getAvailabilityWindow(), normalFont));

                String amenities = f.getAmenities() == null || f.getAmenities().isEmpty()
                        ? "-"
                        : String.join(", ", f.getAmenities());
                table.addCell(new Phrase(amenities, normalFont));
            }

            document.add(table);
            document.close();

            String filename = "facilities-report.pdf";
            HttpHeaders headersHttp = new HttpHeaders();
            headersHttp.setContentType(MediaType.APPLICATION_PDF);
            headersHttp.setContentDispositionFormData("attachment", filename);

            return new ResponseEntity<>(baos.toByteArray(), headersHttp, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
