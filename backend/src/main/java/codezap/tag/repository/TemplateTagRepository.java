package codezap.tag.repository;

import java.util.List;

import codezap.template.domain.Template;
import codezap.template.domain.TemplateTag;

public interface TemplateTagRepository {

    List<TemplateTag> findAllByTemplate(Template template);

    List<TemplateTag> findAllByTemplateId(Long templateId);

    List<Long> findDistinctByTemplateIn(List<Long> templateIds);

    List<TemplateTag> findAllByTemplateIdsIn(List<Long> templateIds);

    TemplateTag save(TemplateTag templateTag);

    <S extends TemplateTag> List<S> saveAll(Iterable<S> entities);

    void deleteAllByTemplateId(Long id);
}
