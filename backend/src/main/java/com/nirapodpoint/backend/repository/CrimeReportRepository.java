package com.nirapodpoint.backend.repository;

import com.nirapodpoint.backend.model.CrimeReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CrimeReportRepository extends MongoRepository<CrimeReport, String> {
    // Custom query methods can be added here
    void deleteByReporter(String reporter);
    long countByReporter(String reporter);
} 