package com.beta.shoes.service;

import com.beta.shoes.dto.StudentDto;
import com.beta.shoes.entity.School;
import com.beta.shoes.entity.Student;
import com.beta.shoes.exception.BadRequestException;
import com.beta.shoes.exception.ResourceNotFoundException;
import com.beta.shoes.repository.SchoolRepository;
import com.beta.shoes.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentService {

    private final StudentRepository studentRepository;
    private final SchoolRepository schoolRepository;

    @Transactional
    public StudentDto.StudentResponse createStudent(StudentDto.StudentRequest request) {
        School school = schoolRepository.findById(request.getSchoolId())
            .orElseThrow(() -> new ResourceNotFoundException("School not found: " + request.getSchoolId()));

        String adm = request.getAdmissionNumber().trim().toUpperCase();
        if (studentRepository.existsBySchoolIdAndAdmissionNumber(school.getId(), adm)) {
            throw new BadRequestException("Student with admission ID " + adm + " already exists in " + school.getName());
        }

        Student student = Student.builder()
            .school(school)
            .admissionNumber(adm)
            .firstName(request.getFirstName().trim())
            .lastName(request.getLastName().trim())
            .gradeClass(request.getGradeClass().trim())
            .section(request.getSection() != null ? request.getSection().trim().toUpperCase() : null)
            .parentName(request.getParentName() != null ? request.getParentName().trim() : null)
            .parentPhone(request.getParentPhone() != null ? request.getParentPhone().trim() : null)
            .parentEmail(request.getParentEmail() != null ? request.getParentEmail().trim().toLowerCase() : null)
            .gender(request.getGender() != null ? request.getGender().trim().toUpperCase() : null)
            .isActive(request.getIsActive() != null ? request.getIsActive() : true)
            .build();

        Student saved = studentRepository.save(student);
        log.info("Created student: id={}, admission={}, school={}", saved.getId(), saved.getAdmissionNumber(), school.getCode());
        return mapToResponse(saved);
    }

    @Transactional
    public StudentDto.StudentResponse updateStudent(UUID id, StudentDto.StudentRequest request) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + id));

        String adm = request.getAdmissionNumber().trim().toUpperCase();
        if (studentRepository.existsBySchoolIdAndAdmissionNumberAndIdNot(student.getSchool().getId(), adm, id)) {
            throw new BadRequestException("Student with admission ID " + adm + " already exists in this school.");
        }

        student.setAdmissionNumber(adm);
        student.setFirstName(request.getFirstName().trim());
        student.setLastName(request.getLastName().trim());
        student.setGradeClass(request.getGradeClass().trim());
        student.setSection(request.getSection() != null ? request.getSection().trim().toUpperCase() : null);
        student.setParentName(request.getParentName() != null ? request.getParentName().trim() : null);
        student.setParentPhone(request.getParentPhone() != null ? request.getParentPhone().trim() : null);
        student.setParentEmail(request.getParentEmail() != null ? request.getParentEmail().trim().toLowerCase() : null);
        student.setGender(request.getGender() != null ? request.getGender().trim().toUpperCase() : null);
        if (request.getIsActive() != null) {
            student.setActive(request.getIsActive());
        }

        Student updated = studentRepository.save(student);
        log.info("Updated student: id={}, admission={}", updated.getId(), updated.getAdmissionNumber());
        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public StudentDto.StudentResponse getStudent(UUID id) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + id));
        return mapToResponse(student);
    }

    @Transactional(readOnly = true)
    public Page<StudentDto.StudentResponse> searchStudents(UUID schoolId, String search, String gradeClass,
                                                          String section, Boolean isActive, Pageable pageable) {
        return studentRepository.searchStudents(schoolId, search, gradeClass, section, isActive, pageable)
            .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<String> getSchoolClasses(UUID schoolId) {
        return studentRepository.findDistinctClasses(schoolId);
    }

    @Transactional(readOnly = true)
    public List<String> getSchoolSections(UUID schoolId) {
        return studentRepository.findDistinctSections(schoolId);
    }

    public StudentDto.StudentResponse mapToResponse(Student student) {
        return StudentDto.StudentResponse.builder()
            .id(student.getId())
            .schoolId(student.getSchool().getId())
            .schoolName(student.getSchool().getName())
            .admissionNumber(student.getAdmissionNumber())
            .firstName(student.getFirstName())
            .lastName(student.getLastName())
            .fullName(student.getFirstName() + " " + student.getLastName())
            .gradeClass(student.getGradeClass())
            .section(student.getSection())
            .parentName(student.getParentName())
            .parentPhone(student.getParentPhone())
            .parentEmail(student.getParentEmail())
            .gender(student.getGender())
            .isActive(student.isActive())
            .ordersCount(student.getOrders() != null ? student.getOrders().size() : 0)
            .createdAt(student.getCreatedAt())
            .updatedAt(student.getUpdatedAt())
            .build();
    }
}
