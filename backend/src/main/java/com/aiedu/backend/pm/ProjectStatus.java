package com.aiedu.backend.pm;

/** 프로젝트 진행 단계. koerp ProjectStage(테이블) 를 v1 에서는 enum 으로 단순화 이관. */
public enum ProjectStatus {
    PLANNED, IN_PROGRESS, ON_HOLD, DONE, CANCELLED
}
