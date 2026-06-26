package com.aiedu.backend.auth;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * 사용자(User) 엔티티 — 로그인 계정.
 *
 * <p>레거시 ERP(ndserp)의 {@code ComLogin}(TM_USERXM, USER_IDXX 기반 세션 로그인)을 모던 스택으로
 * 이관한 것입니다. 프론트엔드(shadcn-admin)의 인증 모델(email/role[])에 맞춰 이메일 로그인 +
 * 역할 집합으로 재설계했고, 비밀번호는 평문이 아닌 BCrypt 해시로 저장합니다.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 계정번호(레거시 사번/USER_IDXX 대응). 프론트 AuthUser.accountNo. */
    @Column(name = "account_no", nullable = false, unique = true, length = 30)
    private String accountNo;

    @Column(nullable = false, unique = true, length = 200)
    private String email;

    /** BCrypt 해시(평문 저장 금지). */
    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private boolean active = true;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role", length = 30)
    private Set<String> roles = new LinkedHashSet<>();

    protected User() {
        // JPA 전용
    }

    private User(String accountNo, String email, String passwordHash, String name,
            boolean active, Set<String> roles) {
        this.accountNo = accountNo;
        this.email = email;
        this.passwordHash = passwordHash;
        this.name = name;
        this.active = active;
        this.roles = new LinkedHashSet<>(roles);
    }

    /**
     * 새 사용자를 생성합니다.
     *
     * @param passwordHash 이미 인코딩된 비밀번호 해시(서비스에서 {@code PasswordEncoder} 로 인코딩)
     */
    public static User create(String accountNo, String email, String passwordHash, String name,
            Set<String> roles) {
        return new User(accountNo, email, passwordHash, name, true, roles);
    }

    public Long getId() {
        return id;
    }

    public String getAccountNo() {
        return accountNo;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getName() {
        return name;
    }

    public boolean isActive() {
        return active;
    }

    public Set<String> getRoles() {
        return Set.copyOf(roles);
    }
}
