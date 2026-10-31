package com.beta.shoes.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "bulk_enquiries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkEnquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "school_name", nullable = false)
    private String schoolName;

    @Column(name = "contact_person", nullable = false, length = 128)
    private String contactPerson;

    @Column(nullable = false, length = 32)
    private String phone;

    @Column(nullable = false, length = 128)
    private String email;

    @Column(name = "city_state", nullable = false, length = 128)
    private String cityState;

    @Column(name = "estimated_students")
    private Integer estimatedStudents;

    @Column(name = "shoe_models_requested", columnDefinition = "TEXT")
    private String shoeModelsRequested;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "NEW"; // NEW, IN_REVIEW, QUOTATION_SENT, CONVERTED, CLOSED

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
