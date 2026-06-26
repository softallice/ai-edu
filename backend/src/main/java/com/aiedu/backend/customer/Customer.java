package com.aiedu.backend.customer;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * 거래처(Customer) 엔티티 — 애그리거트 루트.
 *
 * <p>레거시 ERP(ndserp)의 {@code NDSPMS.BE01C}(거래처 마스터) 테이블을 모던 JPA 엔티티로
 * 이관한 것입니다. 레거시의 암호 같은 컬럼명(CUST_NM, SAUP_NO, TRAN_EN_YN …)과 코드성
 * 문자열(Y/N, 날짜 YYYYMMDD 문자열)을 의미가 드러나는 필드명·타입({@link LocalDate},
 * {@code boolean}, {@link TradeType})으로 재설계했습니다.
 *
 * <p>거래처 담당자({@link CustomerContact}, 레거시 {@code BE10C})를 자식으로 두는 애그리거트로,
 * 담당자 목록의 생애주기는 거래처를 통해서만 관리합니다(cascade + orphanRemoval).
 *
 * <p>JPA 는 기본 생성자가 필요하므로 protected 기본 생성자를 두고, 생성은 정적 팩터리
 * {@link #create}, 수정은 도메인 메서드로 캡슐화합니다.
 */
@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 거래처코드(레거시 CUST_CODE). 6자리 0-패딩 업무 키. 서비스에서 채번합니다. */
    @Column(nullable = false, unique = true, length = 20)
    private String code;

    /** 사업자등록번호 또는 주민등록번호(레거시 SAUP_NO). */
    @Column(name = "business_reg_no", nullable = false, unique = true, length = 20)
    private String businessRegNo;

    /** 거래처 상호명 또는 성명(레거시 CUST_NM). */
    @Column(nullable = false, length = 200)
    private String name;

    /** 거래처 약칭(레거시 CUST_SHOT_NM). */
    @Column(name = "short_name", length = 100)
    private String shortName;

    /** 매입/매출 구분(레거시 BUY_SALE_GB). */
    @Enumerated(EnumType.STRING)
    @Column(name = "trade_type", nullable = false, length = 10)
    private TradeType tradeType;

    /** 대표자 성명(레거시 REPRESENT_NM). */
    @Column(name = "representative_name", length = 100)
    private String representativeName;

    /** 법인등록번호(레거시 CORP_NO). */
    @Column(name = "corporate_reg_no", length = 20)
    private String corporateRegNo;

    /** 업태(레거시 BUSI_COND). */
    @Column(name = "business_condition", length = 200)
    private String businessCondition;

    /** 종목(레거시 BUSI_ITEM). */
    @Column(name = "business_item", length = 200)
    private String businessItem;

    /** 우편번호(레거시 POST_NO). */
    @Column(name = "post_no", length = 10)
    private String postNo;

    /** 주소1(레거시 ADD1). */
    @Column(length = 300)
    private String address1;

    /** 주소2(레거시 ADD2). */
    @Column(length = 300)
    private String address2;

    /** 대표 전화(레거시 REPRESENT_TEL_NO). */
    @Column(name = "tel_no", length = 30)
    private String telNo;

    /** 팩스 번호(레거시 FAX_NO). */
    @Column(name = "fax_no", length = 30)
    private String faxNo;

    /** 거래처 대표 이메일(레거시 CUST_EMAIL). */
    @Column(length = 200)
    private String email;

    /** 과세구분(레거시 TAX_GUBUN). */
    @Column(name = "tax_type", length = 10)
    private String taxType;

    /** 설립일자(레거시 FOUND_YMD, YYYYMMDD 문자열 → LocalDate). */
    @Column(name = "found_date")
    private LocalDate foundDate;

    /** 최초 거래 시작일자(레거시 TRAN_ST_YMD). */
    @Column(name = "trade_start_date")
    private LocalDate tradeStartDate;

    /** 거래 종료일자(레거시 TRAN_EN_YMD). */
    @Column(name = "trade_end_date")
    private LocalDate tradeEndDate;

    /** 사용 여부(레거시 TRAN_EN_YN, 'Y'/'N' → boolean). */
    @Column(nullable = false)
    private boolean active = true;

    /** 전자계약 대상 여부(레거시 ECONT_YN). */
    @Column(name = "electronic_contract", nullable = false)
    private boolean electronicContract = false;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id asc")
    private List<CustomerContact> contacts = new ArrayList<>();

    protected Customer() {
        // JPA 전용
    }

    private Customer(String code, String businessRegNo, String name, String shortName, TradeType tradeType,
            String representativeName, String corporateRegNo, String businessCondition, String businessItem,
            String postNo, String address1, String address2, String telNo, String faxNo, String email,
            String taxType, LocalDate foundDate, LocalDate tradeStartDate, LocalDate tradeEndDate,
            boolean active, boolean electronicContract) {
        this.code = code;
        this.businessRegNo = businessRegNo;
        this.name = name;
        this.shortName = shortName;
        this.tradeType = tradeType;
        this.representativeName = representativeName;
        this.corporateRegNo = corporateRegNo;
        this.businessCondition = businessCondition;
        this.businessItem = businessItem;
        this.postNo = postNo;
        this.address1 = address1;
        this.address2 = address2;
        this.telNo = telNo;
        this.faxNo = faxNo;
        this.email = email;
        this.taxType = taxType;
        this.foundDate = foundDate;
        this.tradeStartDate = tradeStartDate;
        this.tradeEndDate = tradeEndDate;
        this.active = active;
        this.electronicContract = electronicContract;
    }

    /** 새 거래처를 생성합니다. {@code code} 는 서비스에서 채번하여 전달합니다. */
    public static Customer create(String code, String businessRegNo, String name, String shortName,
            TradeType tradeType, String representativeName, String corporateRegNo, String businessCondition,
            String businessItem, String postNo, String address1, String address2, String telNo, String faxNo,
            String email, String taxType, LocalDate foundDate, LocalDate tradeStartDate, LocalDate tradeEndDate,
            boolean active, boolean electronicContract) {
        return new Customer(code, businessRegNo, name, shortName, tradeType, representativeName, corporateRegNo,
                businessCondition, businessItem, postNo, address1, address2, telNo, faxNo, email, taxType,
                foundDate, tradeStartDate, tradeEndDate, active, electronicContract);
    }

    /** 거래처 기본정보를 갱신합니다(코드는 불변). */
    public void update(String businessRegNo, String name, String shortName, TradeType tradeType,
            String representativeName, String corporateRegNo, String businessCondition, String businessItem,
            String postNo, String address1, String address2, String telNo, String faxNo, String email,
            String taxType, LocalDate foundDate, LocalDate tradeStartDate, LocalDate tradeEndDate,
            boolean active, boolean electronicContract) {
        this.businessRegNo = businessRegNo;
        this.name = name;
        this.shortName = shortName;
        this.tradeType = tradeType;
        this.representativeName = representativeName;
        this.corporateRegNo = corporateRegNo;
        this.businessCondition = businessCondition;
        this.businessItem = businessItem;
        this.postNo = postNo;
        this.address1 = address1;
        this.address2 = address2;
        this.telNo = telNo;
        this.faxNo = faxNo;
        this.email = email;
        this.taxType = taxType;
        this.foundDate = foundDate;
        this.tradeStartDate = tradeStartDate;
        this.tradeEndDate = tradeEndDate;
        this.active = active;
        this.electronicContract = electronicContract;
    }

    /** 담당자 한 명을 추가하고 양방향 연관관계를 맞춥니다. */
    public void addContact(CustomerContact contact) {
        contacts.add(contact);
        contact.assignTo(this);
    }

    /** 기존 담당자를 모두 비우고 새 목록으로 교체합니다(저장 시 동기화 용). */
    public void replaceContacts(List<CustomerContact> newContacts) {
        contacts.clear();
        for (CustomerContact contact : newContacts) {
            addContact(contact);
        }
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getBusinessRegNo() {
        return businessRegNo;
    }

    public String getName() {
        return name;
    }

    public String getShortName() {
        return shortName;
    }

    public TradeType getTradeType() {
        return tradeType;
    }

    public String getRepresentativeName() {
        return representativeName;
    }

    public String getCorporateRegNo() {
        return corporateRegNo;
    }

    public String getBusinessCondition() {
        return businessCondition;
    }

    public String getBusinessItem() {
        return businessItem;
    }

    public String getPostNo() {
        return postNo;
    }

    public String getAddress1() {
        return address1;
    }

    public String getAddress2() {
        return address2;
    }

    public String getTelNo() {
        return telNo;
    }

    public String getFaxNo() {
        return faxNo;
    }

    public String getEmail() {
        return email;
    }

    public String getTaxType() {
        return taxType;
    }

    public LocalDate getFoundDate() {
        return foundDate;
    }

    public LocalDate getTradeStartDate() {
        return tradeStartDate;
    }

    public LocalDate getTradeEndDate() {
        return tradeEndDate;
    }

    public boolean isActive() {
        return active;
    }

    public boolean isElectronicContract() {
        return electronicContract;
    }

    /** 불변 스냅샷을 반환합니다. 담당자 변경은 {@link #addContact}/{@link #replaceContacts} 로만. */
    public List<CustomerContact> getContacts() {
        return List.copyOf(contacts);
    }
}
