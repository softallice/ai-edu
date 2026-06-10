package com.aiedu.backend.task;

import com.aiedu.backend.common.ResourceNotFoundException;
import com.aiedu.backend.task.dto.TaskRequest;
import com.aiedu.backend.task.dto.TaskResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 작업 비즈니스 로직.
 *
 * <p>생성자 주입을 사용하며(필드 주입 금지), 트랜잭션 경계는 서비스 계층에 둡니다.
 * 조회는 {@code readOnly} 트랜잭션으로 처리합니다.
 */
@Service
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<TaskResponse> findAll() {
        return taskRepository.findAll().stream()
                .map(TaskResponse::from)
                .toList();
    }

    public TaskResponse findById(Long id) {
        Task task = getOrThrow(id);
        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse create(TaskRequest request) {
        Task task = Task.create(request.title(), request.status(), request.label(), request.priority());
        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse update(Long id, TaskRequest request) {
        Task task = getOrThrow(id);
        task.update(request.title(), request.status(), request.label(), request.priority());
        return TaskResponse.from(task);
    }

    @Transactional
    public void delete(Long id) {
        Task task = getOrThrow(id);
        taskRepository.delete(task);
    }

    private Task getOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("작업을 찾을 수 없습니다. id=" + id));
    }
}
