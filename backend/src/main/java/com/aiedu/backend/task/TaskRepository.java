package com.aiedu.backend.task;

import org.springframework.data.jpa.repository.JpaRepository;

/** 작업 영속성 계층. Spring Data JPA가 구현체를 자동 생성합니다. */
public interface TaskRepository extends JpaRepository<Task, Long> {
}
