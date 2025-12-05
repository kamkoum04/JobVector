package com.example.jobvector.Dto;

import com.example.jobvector.Model.CvProcessingJob;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CvProcessingJobDto extends BaseResponseDto {
    private Long jobId;
    private String status;
    private String statusDetails;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private CvDto cvData; // Only populated when status is COMPLETED
    
    public static CvProcessingJobDto fromEntity(CvProcessingJob job) {
        CvProcessingJobDto dto = new CvProcessingJobDto();
        dto.setJobId(job.getId());
        dto.setStatus(job.getStatus().name());
        dto.setStatusDetails(job.getStatusDetails());
        dto.setErrorMessage(job.getErrorMessage());
        dto.setCreatedAt(job.getCreatedAt());
        dto.setCompletedAt(job.getCompletedAt());
        dto.setStatusCode(200);
        dto.setMessage("Job status retrieved successfully");
        return dto;
    }
}
