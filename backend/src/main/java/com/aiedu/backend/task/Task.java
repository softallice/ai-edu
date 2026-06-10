package com.aiedu.backend.task;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * 작업(Task) 엔티티.
 *
 * <p>JPA 엔티티는 기본 생성자가 필요하므로 protected 기본 생성자를 둡니다.
 * 생성은 정적 팩터리 {@link #create} 를 사용하고, 수정은 도메인 메서드로 캡슐화합니다.
 */
@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    @Column(nullable = false)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskPriority priority;

    protected Task() {
        // JPA 전용
    }

    private Task(String title, TaskStatus status, String label, TaskPriority priority) {
        this.title = title;
        this.status = status;
        this.label = label;
        this.priority = priority;
    }

    public static Task create(String title, TaskStatus status, String label, TaskPriority priority) {
        return new Task(title, status, label, priority);
    }

    /** 전달된 값으로 작업 내용을 갱신합니다. */
    public void update(String title, TaskStatus status, String label, TaskPriority priority) {
        this.title = title;
        this.status = status;
        this.label = label;
        this.priority = priority;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public String getLabel() {
        return label;
    }

    public TaskPriority getPriority() {
        return priority;
    }
}
