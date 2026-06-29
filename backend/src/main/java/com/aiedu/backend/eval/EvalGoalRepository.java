package com.aiedu.backend.eval;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface EvalGoalRepository extends JpaRepository<EvalGoal, Long>, JpaSpecificationExecutor<EvalGoal> {
    boolean existsByCode(String code);
}
