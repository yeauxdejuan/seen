package com.seen.report.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "incident_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentReport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private UUID userId;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String narrative;
    
    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "report_incident_types")
    private Set<IncidentType> incidentTypes;
    
    @ElementCollection
    @CollectionTable(name = "report_tags")
    private Set<String> tags;
    
    @Embedded
    private ReportLocation location;
    
    @Embedded
    private IncidentTiming timing;
    
    @Embedded
    private ImpactDetails impact;
    
    @Embedded
    private Demographics demographics;
    
    @Enumerated(EnumType.STRING)
    private ReportStatus status = ReportStatus.DRAFT;
    
    @Column(nullable = false)
    private Boolean openToContact = false;
    
    @Column
    private String contactEmail;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "reportId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ReportTimeline> timeline;
    
    @OneToMany(mappedBy = "reportId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ReportAttachment> attachments;
}

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportLocation {
    @Column(nullable = false)
    private String city;
    
    @Column(nullable = false)
    private String state;
    
    @Column(nullable = false)
    private String country = "United States";
    
    private Double latitude;
    private Double longitude;
}

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncidentTiming {
    @Column(nullable = false)
    private LocalDate date;
    
    @Enumerated(EnumType.STRING)
    private TimeOfDay timeLabel = TimeOfDay.AFTERNOON;
}

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImpactDetails {
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    private ReportedTo reportedTo;
    
    @Column(columnDefinition = "TEXT")
    private String reportedToDetails;
    
    @ElementCollection
    @CollectionTable(name = "report_support_desired")
    private Set<String> supportDesired;
}

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Demographics {
    @ElementCollection
    @CollectionTable(name = "report_demographics_race")
    private Set<String> race;
    
    private String ageRange;
    private String genderIdentity;
    
    @Column(nullable = false)
    private Boolean keepPrivate = false;
}

public enum IncidentType {
    WORKPLACE_BIAS, POLICE_ENCOUNTER, HOUSING_DISCRIMINATION, 
    PUBLIC_SPACE, EDUCATION, ONLINE, OTHER
}

public enum ReportStatus {
    DRAFT, SUBMITTED, UNDER_REVIEW, RESOLVED, ARCHIVED
}

public enum TimeOfDay {
    MORNING, AFTERNOON, EVENING, NIGHT
}

public enum ReportedTo {
    YES, NO
}