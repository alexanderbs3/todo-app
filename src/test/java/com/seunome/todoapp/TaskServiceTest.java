package com.seunome.todoapp;

import com.seunome.todoapp.model.Task;
import com.seunome.todoapp.repository.TaskRepository;
import com.seunome.todoapp.service.TaskService;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@SpringBootTest
public class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskService taskService;

    @Test
    public void testGetTaskById() {
        Task task = new Task("Teste", "Descrição", false);
        task.setId(1L);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        Optional<Task> result = taskService.getTaskById(1L);
        assertEquals("Teste", result.get().getTitle());
    }
}