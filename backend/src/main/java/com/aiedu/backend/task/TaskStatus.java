package com.aiedu.backend.task;

/** 작업 진행 상태. 프론트엔드 {@code features/tasks} 의 status 값과 정렬됩니다. */
public enum TaskStatus {
    BACKLOG,
    TODO,
    IN_PROGRESS,
    DONE,
    CANCELED
}
