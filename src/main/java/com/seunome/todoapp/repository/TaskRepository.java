package com.seunome.todoapp.repository;

import com.seunome.todoapp.model.Task;
import org.springframework.data.domain.Page; // Import correto
import org.springframework.data.domain.Pageable; // Import correto
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
    Page<Task> findAll(Pageable pageable); // Usando Pageable do Spring Data
}