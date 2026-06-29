package com.aiedu.backend.sales;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProjectCollectionRepository
        extends JpaRepository<ProjectCollection, Long>, JpaSpecificationExecutor<ProjectCollection> {
    boolean existsByCode(String code);
}
