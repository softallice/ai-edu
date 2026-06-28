package com.aiedu.backend.nexacro;

import com.aiedu.backend.customer.CustomerService;
import com.aiedu.backend.customer.TradeType;
import com.aiedu.backend.customer.dto.CustomerContactRequest;
import com.aiedu.backend.customer.dto.CustomerRequest;
import com.aiedu.backend.customer.dto.CustomerResponse;
import com.aiedu.backend.customer.dto.CustomerSummaryResponse;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Nexacro 연동 어댑터 — 거래처(POVM0001).
 *
 * <p>레거시 {@code ComLogin}/{@code POVM0001Controller} 의 {@code *.do} + Nexacro 데이터셋
 * 통신을 JSON 으로 모던화했습니다. 요청/응답 데이터셋은 레거시 컬럼명(CUST_CODE, CUST_NM …)을
 * 그대로 사용해 Nexacro 폼이 인식하도록 하고, 실제 처리는 모던 {@link CustomerService} 에 위임합니다.
 *
 * <p>키는 surrogate {@code ID}(Long)를 사용합니다(레거시 CUST_CODE 는 표시·채번용).
 *
 * <p>프로토콜(JSON):
 * <pre>
 *  요청  : { "ds_Search": [ {"CUST_CD_AND_NM":"엔디", "BUY_SALE_GB":"", "TRAN_EN_YN":""} ] }
 *  응답  : { "ErrorCode":0, "ErrorMsg":"SUCC", "ds_List":[ {...}, ... ] }
 * </pre>
 */
@RestController
@RequestMapping("/nexacro/erp/po")
public class NexacroCustomerController {

    private final CustomerService customerService;

    public NexacroCustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    /** 거래처 목록 조회. 레거시 POVM0001_SEARCH00.do */
    @PostMapping("/POVM0001_SEARCH00.do")
    public Map<String, Object> search00(@RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> p = firstRow(body, "ds_Search");
        String keyword = str(p.get("CUST_CD_AND_NM"));
        String buySaleGb = str(p.get("BUY_SALE_GB"));
        String tranEnYn = str(p.get("TRAN_EN_YN"));

        Boolean active = tranEnYn.isBlank() ? null : "Y".equalsIgnoreCase(tranEnYn);
        TradeType tradeType = buySaleGb.isBlank() ? null : TradeType.valueOf(buySaleGb);

        List<Map<String, Object>> rows = customerService
                .search(keyword.isBlank() ? null : keyword, active, tradeType)
                .stream()
                .map(NexacroCustomerController::summaryToRow)
                .toList();

        Map<String, Object> res = NexacroResponse.ok();
        res.put("ds_List", rows);
        return res;
    }

    /** 거래처 상세 + 담당자 조회. 레거시 POVM0001_SEARCH01.do */
    @PostMapping("/POVM0001_SEARCH01.do")
    public Map<String, Object> search01(@RequestBody Map<String, Object> body) {
        Map<String, Object> p = firstRow(body, "ds_Search");
        long id = asLong(p.get("ID"));
        CustomerResponse c = customerService.findById(id);

        Map<String, Object> res = NexacroResponse.ok();
        res.put("ds_CustInfo", List.of(detailToRow(c)));
        List<Map<String, Object>> contacts = new ArrayList<>();
        c.contacts().forEach((ct) -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("DEPT_NM", ct.department());
            row.put("EMP_NM", ct.name());
            row.put("TEL_NO", nz(ct.telNo()));
            row.put("EMAIL", nz(ct.email()));
            contacts.add(row);
        });
        res.put("ds_CustMngr", contacts);
        return res;
    }

    /** 거래처 + 담당자 저장(신규/수정). 레거시 POVM0001_SAVE00.do */
    @PostMapping("/POVM0001_SAVE00.do")
    public Map<String, Object> save00(@RequestBody Map<String, Object> body) {
        Map<String, Object> info = firstRow(body, "ds_CustInfo");
        List<CustomerContactRequest> contacts = rows(body, "ds_CustMngr").stream()
                .map((r) -> new CustomerContactRequest(
                        str(r.get("DEPT_NM")), str(r.get("EMP_NM")),
                        str(r.get("TEL_NO")), blankToNull(str(r.get("EMAIL")))))
                .toList();

        CustomerRequest req = new CustomerRequest(
                str(info.get("SAUP_NO")),
                str(info.get("CUST_NM")),
                str(info.get("CUST_SHOT_NM")),
                info.get("BUY_SALE_GB") == null || str(info.get("BUY_SALE_GB")).isBlank()
                        ? TradeType.BUY
                        : TradeType.valueOf(str(info.get("BUY_SALE_GB"))),
                str(info.get("REPRESENT_NM")), str(info.get("CORP_NO")),
                str(info.get("BUSI_COND")), str(info.get("BUSI_ITEM")),
                str(info.get("POST_NO")), str(info.get("ADD1")), str(info.get("ADD2")),
                str(info.get("REPRESENT_TEL_NO")), str(info.get("FAX_NO")),
                blankToNull(str(info.get("CUST_EMAIL"))), str(info.get("TAX_GUBUN")),
                null, null, null,
                !"N".equalsIgnoreCase(str(info.get("TRAN_EN_YN"))),
                "Y".equalsIgnoreCase(str(info.get("ECONT_YN"))),
                contacts);

        String idStr = str(info.get("ID"));
        CustomerResponse saved = idStr.isBlank()
                ? customerService.create(req)
                : customerService.update(Long.parseLong(idStr), req);

        Map<String, Object> res = NexacroResponse.ok();
        res.put("ds_CustInfo", List.of(detailToRow(saved)));
        return res;
    }

    /** 거래처 삭제. 레거시 POVM0001_DELETE00.do */
    @PostMapping("/POVM0001_DELETE00.do")
    public Map<String, Object> delete00(@RequestBody Map<String, Object> body) {
        Map<String, Object> p = firstRow(body, "ds_Search");
        customerService.delete(asLong(p.get("ID")));
        return NexacroResponse.ok();
    }

    // ---- 레거시 컬럼 ↔ 모던 DTO 매핑 ----

    private static Map<String, Object> summaryToRow(CustomerSummaryResponse c) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("ID", c.id());
        row.put("CUST_CODE", c.code());
        row.put("CUST_NM", c.name());
        row.put("BUY_SALE_GB", c.tradeType().name());
        row.put("REPRESENT_NM", nz(c.representativeName()));
        row.put("SAUP_NO", c.businessRegNo());
        row.put("TRAN_EN_YN", c.active() ? "Y" : "N");
        return row;
    }

    private static Map<String, Object> detailToRow(CustomerResponse c) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("ID", c.id());
        row.put("CUST_CODE", c.code());
        row.put("SAUP_NO", c.businessRegNo());
        row.put("CUST_NM", c.name());
        row.put("CUST_SHOT_NM", nz(c.shortName()));
        row.put("BUY_SALE_GB", c.tradeType().name());
        row.put("REPRESENT_NM", nz(c.representativeName()));
        row.put("CORP_NO", nz(c.corporateRegNo()));
        row.put("BUSI_COND", nz(c.businessCondition()));
        row.put("BUSI_ITEM", nz(c.businessItem()));
        row.put("POST_NO", nz(c.postNo()));
        row.put("ADD1", nz(c.address1()));
        row.put("ADD2", nz(c.address2()));
        row.put("REPRESENT_TEL_NO", nz(c.telNo()));
        row.put("FAX_NO", nz(c.faxNo()));
        row.put("CUST_EMAIL", nz(c.email()));
        row.put("TAX_GUBUN", nz(c.taxType()));
        row.put("TRAN_EN_YN", c.active() ? "Y" : "N");
        row.put("ECONT_YN", c.electronicContract() ? "Y" : "N");
        return row;
    }

    // ---- JSON 데이터셋 유틸 ----

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> rows(Map<String, Object> body, String dataset) {
        if (body == null) {
            return List.of();
        }
        Object ds = body.get(dataset);
        if (ds instanceof List<?> list) {
            List<Map<String, Object>> out = new ArrayList<>();
            for (Object o : list) {
                if (o instanceof Map<?, ?> m) {
                    out.add((Map<String, Object>) m);
                }
            }
            return out;
        }
        if (ds instanceof Map<?, ?> m) {
            return List.of((Map<String, Object>) m);
        }
        return List.of();
    }

    private static Map<String, Object> firstRow(Map<String, Object> body, String dataset) {
        List<Map<String, Object>> rows = rows(body, dataset);
        return rows.isEmpty() ? Map.of() : rows.get(0);
    }

    private static String str(Object v) {
        return v == null ? "" : String.valueOf(v);
    }

    private static String nz(String v) {
        return v == null ? "" : v;
    }

    private static String blankToNull(String v) {
        return (v == null || v.isBlank()) ? null : v;
    }

    private static long asLong(Object v) {
        if (v instanceof Number n) {
            return n.longValue();
        }
        return Long.parseLong(str(v));
    }
}
