package codezap.likes.repository;

import codezap.likes.domain.Likes;
import codezap.member.domain.Member;
import codezap.template.domain.Template;

public interface LikesRepository {
    Likes save(Likes likes);

    boolean existsByMemberAndTemplate(Member member, Template template);

    long countByTemplate(Template template);

    void deleteByMemberAndTemplate(Member member, Template template);
}