package com.aiedu.backend.hr;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {
    boolean existsByEmployeeNo(String employeeNo);
    boolean existsByEmployeeNoAndIdNot(String employeeNo, Long id);
    List<Employee> findByDepartmentId(Long departmentId);
}
