package codezap.template.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import codezap.template.domain.Template;

public interface TemplateRepository {

    Template fetchById(Long id);

    boolean existsByCategoryId(Long categoryId);

    List<Template> findAll();

    Page<Template> searchBy(Long memberId, String keyword, Pageable pageable);

    Page<Template> searchBy(Long memberId, String keyword, List<Long> templateIds, Pageable pageable);

    Page<Template> searchBy(Long memberId, String keyword, Long categoryId, Pageable pageable);

    Page<Template> searchBy(Long memberId, String keyword, Long categoryId, List<Long> templateIds, Pageable pageable);

    long count();

    Template save(Template template);

    List<Template> saveAll(List<Template> templates);

    void deleteById(Long id);
}
