package codezap.template.service;

import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import codezap.category.domain.Category;
import codezap.category.repository.CategoryRepository;
import codezap.template.domain.Snippet;
import codezap.template.domain.Tag;
import codezap.template.domain.Template;
import codezap.template.domain.TemplateTag;
import codezap.template.domain.ThumbnailSnippet;
import codezap.template.dto.request.CreateSnippetRequest;
import codezap.template.dto.request.CreateTemplateRequest;
import codezap.template.dto.request.UpdateSnippetRequest;
import codezap.template.dto.request.UpdateTemplateRequest;
import codezap.template.dto.response.FindAllTemplatesResponse;
import codezap.template.dto.response.FindTemplateByIdResponse;
import codezap.template.repository.SnippetRepository;
import codezap.template.repository.TagRepository;
import codezap.template.repository.TemplateRepository;
import codezap.template.repository.TemplateTagRepository;
import codezap.template.repository.ThumbnailSnippetRepository;

@Service
public class TemplateService {

    public static final int FIRST_ORDINAL = 1;

    private final ThumbnailSnippetRepository thumbnailSnippetRepository;
    private final TemplateRepository templateRepository;
    private final SnippetRepository snippetRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final TemplateTagRepository templateTagRepository;

    public TemplateService(ThumbnailSnippetRepository thumbnailSnippetRepository,
            TemplateRepository templateRepository, SnippetRepository snippetRepository,
            CategoryRepository categoryRepository, TagRepository tagRepository,
            TemplateTagRepository templateTagRepository
    ) {
        this.thumbnailSnippetRepository = thumbnailSnippetRepository;
        this.templateRepository = templateRepository;
        this.snippetRepository = snippetRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.templateTagRepository = templateTagRepository;
    }

    @Transactional
    public Long create(CreateTemplateRequest createTemplateRequest) {
        Category category = categoryRepository.fetchById(createTemplateRequest.categoryId());

        Template template = templateRepository.save(
                new Template(
                    createTemplateRequest.title(),
                    createTemplateRequest.description(),
                    category
                )
        );

        List<Tag> tags = createTemplateRequest.tags().stream()
                .map(Tag::new)
                .map(tagRepository::save)
                .toList();

        tags.forEach(tag -> templateTagRepository.save(new TemplateTag(template, tag)));

        createTemplateRequest.snippets()
                .forEach(createSnippetRequest -> createSnippet(createSnippetRequest, template));

        Snippet thumbnailSnippet = snippetRepository.findByTemplateAndOrdinal(template, FIRST_ORDINAL);
        thumbnailSnippetRepository.save(new ThumbnailSnippet(template, thumbnailSnippet));
        return template.getId();
    }

    public FindAllTemplatesResponse findAll() {
        return FindAllTemplatesResponse.from(thumbnailSnippetRepository.findAll());
    }

    public FindTemplateByIdResponse findById(Long id) {
        Template template = templateRepository.fetchById(id);
        List<Snippet> snippets = snippetRepository.findAllByTemplate(template);
        List<Tag> tags = templateTagRepository.findAllByTemplate(template).stream()
                .map(TemplateTag::getTag)
                .toList();
        return FindTemplateByIdResponse.of(template, snippets, tags);
    }

    @Transactional
    public void update(Long templateId, UpdateTemplateRequest updateTemplateRequest) {
        Category category = categoryRepository.fetchById(updateTemplateRequest.categoryId());
        Template template = templateRepository.fetchById(templateId);
        template.updateTemplate(updateTemplateRequest.title(), updateTemplateRequest.description(), category);

        updateTemplateRequest.updateSnippets().forEach(this::updateSnippet);
        updateTemplateRequest.createSnippets()
                .forEach(createSnippetRequest -> createSnippet(createSnippetRequest, template));

        ThumbnailSnippet thumbnailSnippet = thumbnailSnippetRepository.findByTemplate(template);

        if (isThumbnailSnippetDeleted(updateTemplateRequest, thumbnailSnippet)) {
            updateThumbnailSnippet(template, thumbnailSnippet);
        }

        updateTemplateRequest.deleteSnippetIds().forEach(snippetRepository::deleteById);

        templateTagRepository.deleteAllByTemplate(template);
        updateTemplateRequest.tags().stream()
                .map(Tag::new)
                .filter(tag -> !tagRepository.existsByName(tag.getName()))
                .forEach(tagRepository::save);

        List<Tag> tags = updateTemplateRequest.tags().stream()
                .map(tagRepository::findByName)
                .toList();
        tags.forEach(tag -> templateTagRepository.save(new TemplateTag(template, tag)));
    }

    @Transactional
    public void deleteById(Long id) {
        thumbnailSnippetRepository.deleteByTemplateId(id);
        snippetRepository.deleteByTemplateId(id);
        templateTagRepository.deleteAllByTemplateId(id);
        templateRepository.deleteById(id);
    }

    private static boolean isThumbnailSnippetDeleted(
            UpdateTemplateRequest updateTemplateRequest,
            ThumbnailSnippet thumbnailSnippet
    ) {
        return updateTemplateRequest.deleteSnippetIds().contains(thumbnailSnippet.getId());
    }

    private void updateThumbnailSnippet(Template template, ThumbnailSnippet thumbnailSnippet) {
        List<Snippet> snippets = snippetRepository.findAllByTemplateAndOrdinal(template, FIRST_ORDINAL);
        snippets.stream()
                .filter(snippet -> !Objects.equals(thumbnailSnippet.getSnippet().getId(), snippet.getId()))
                .findFirst()
                .ifPresent(thumbnailSnippet::updateThumbnailSnippet);
    }

    private void createSnippet(CreateSnippetRequest createSnippetRequest, Template template) {
        snippetRepository.save(
                new Snippet(
                        template, createSnippetRequest.filename(),
                        createSnippetRequest.content(),
                        createSnippetRequest.ordinal()
                )
        );
    }

    private void updateSnippet(UpdateSnippetRequest updateSnippetRequest) {
        Snippet snippet = snippetRepository.fetchById(updateSnippetRequest.id());
        snippet.updateSnippet(updateSnippetRequest.filename(), updateSnippetRequest.content(),
                updateSnippetRequest.ordinal());
    }
}
