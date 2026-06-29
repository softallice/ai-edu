// comMain.xfdl.js — NDS ERP 포털형 메인 화면 (레거시 메인 이관 데모)
(function()
{
    return function()
    {
        if (!this._is_form) return;
        var obj = null;
        var self = this;
        function S(id,l,t,w,h){ var o=new Static(id,String(l),String(t),String(w),String(h),null,null,null,null,null,null,self); self.addChild(id,o); o.show(); return o; }

        this.on_create = function()
        {
            this.set_name("comMain");
            this.set_titletext("홈");
            this.set_background("#ffffff");
            if (Form == this.constructor) { this._setFormPosition(1180, 900); }

            obj = new Dataset("ds_Stats", this);
            obj.addColumn("CUST_CNT","STRING",20); obj.addColumn("ACTIVE_CNT","STRING",20);
            obj.addColumn("PROG_CNT","STRING",20); obj.addColumn("TOTAL_PROG","STRING",20);
            this.addChild(obj.name, obj);

            // ===== 프로필 카드 (좌) =====
            S("p_card",24,24,360,250).set_background("#ffffff");
            this.p_card.set_border("1px solid #ECE3CC");
            var ph = S("p_photo",48,56,84,84); ph.set_background("#F2C94C"); ph.set_text("👤"); ph.set_font("40px"); ph.set_textAlign && ph.set_textAlign("center");
            S("p_name",150,64,210,30).set_text("사용자님"); this.p_name.set_font("bold 18px");
            S("p_dept",150,96,210,22).set_text("플랫폼개발실"); this.p_dept.set_color("#6b7280");
            var badge=S("p_badge",150,126,110,24); badge.set_text("휴가현황보기"); badge.set_background("#F7E9BE"); badge.set_color("#8a6d1f"); badge.set_font("12px");
            S("p_l1",48,170,200,22).set_text("연차휴가"); this.p_l1.set_color("#6b7280");
            S("p_v1",250,170,110,22).set_text("2일 / 22일");
            S("p_l2",48,196,200,22).set_text("휴일보상휴가"); this.p_l2.set_color("#6b7280");
            S("p_v2",250,196,110,22).set_text("0일 / 0일");
            var pbtn=new Button("p_btn","48","232","312","32",null,null,null,null,null,null,this);
            pbtn.set_text("개인정보상세보기"); pbtn.set_background("#F2C94C"); pbtn.set_color("#5b4708"); this.addChild("p_btn",pbtn); pbtn.show();

            // ===== NDS VISION 배너 (우) =====
            S("v_box",404,24,752,250).set_background("#FBF3E0");
            S("v_kicker",436,52,400,24).set_text("NDS VISION"); this.v_kicker.set_color("#9a8550"); this.v_kicker.set_font("bold 15px");
            S("v_title",436,82,700,44).set_text("Cloud 혁신으로 Data가 지배하는 미래를 함께 연다."); this.v_title.set_font("bold 26px"); this.v_title.set_color("#1f2937");
            S("v_sub",436,150,680,26).set_text("고객의 사업적 고민을 데이터 중심의 업무 혁신으로 해결합니다."); this.v_sub.set_color("#4b5563"); this.v_sub.set_font("16px");
            var arrow=S("v_arrow",980,150,150,100); arrow.set_text("📈 지속성장"); arrow.set_color("#C9A24B"); arrow.set_font("bold 16px");

            // ===== 퀵 메뉴 타일 =====
            var tiles=["업무일지","조직도","출퇴근현황","활동시간표","휴가계신청","연장근로신청","급여명세표","성과실적","근로소득","연말정산"];
            S("q_bar",24,290,1132,110).set_background("#ffffff"); this.q_bar.set_border("1px solid #eee");
            for (var i=0;i<tiles.length;i++){
                var x=40+i*111;
                var ic=S("q_ic"+i,x,310,90,40); ic.set_text("▣"); ic.set_font("26px"); ic.set_color("#C9A24B");
                var lb=S("q_lb"+i,x,356,100,34); lb.set_text(tiles[i]); lb.set_font("12px"); lb.set_color("#374151");
            }

            // ===== 나의메뉴 바 =====
            var mb=S("my_bar",24,410,1132,40); mb.set_background("#4b5563"); 
            S("my_lb",40,420,200,22).set_text("≡ 나의메뉴"); this.my_lb.set_color("#ffffff"); this.my_lb.set_font("bold 13px");

            // ===== 하단: 캘린더 / 일정 / 시스템안내 =====
            // 캘린더
            S("c_box",24,466,360,300).set_background("#ffffff"); this.c_box.set_border("1px solid #eee");
            S("c_title",150,480,120,26).set_text("2026.06"); this.c_title.set_font("bold 16px");
            var dow=["일","월","화","수","목","금","토"];
            for (var d=0;d<7;d++){ var dl=S("c_d"+d,40+d*46,512,40,22); dl.set_text(dow[d]); dl.set_font("12px"); dl.set_color(d==0?"#ef4444":(d==6?"#3b82f6":"#374151")); }
            // 6월 달력(2026-06-01=월). 간단 그리드
            var first=1; // 6/1 위치(월요일=col1)
            for (var day=1; day<=30; day++){ var idx=first+day-1; var row=Math.floor(idx/7); var col=idx%7;
                var cell=S("c_c"+day,40+col*46,540+row*38,40,30); cell.set_text(String(day)); cell.set_font("12px");
                if(col==0) cell.set_color("#ef4444"); else if(col==6) cell.set_color("#3b82f6");
            }
            // 일정
            S("s_box",404,466,372,300).set_background("#ffffff"); this.s_box.set_border("1px solid #eee");
            S("s_title",424,480,200,26).set_text("일정"); this.s_title.set_font("bold 16px");
            var sch=[["06월 03일 (수)","지방선거"],["06월 06일 (토)","현충일"],["06월 19일 (금)","가정의 날 단체반차"]];
            for (var j=0;j<sch.length;j++){ S("s_d"+j,424,516+j*34,150,22).set_text(sch[j][0]); var st=S("s_t"+j,584,516+j*34,180,22); st.set_text(sch[j][1]); st.set_color("#374151"); }
            // 시스템 안내
            S("n_box",796,466,360,300).set_background("#ffffff"); this.n_box.set_border("1px solid #eee");
            S("n_title",816,480,200,26).set_text("시스템 안내"); this.n_title.set_font("bold 16px");
            var notices=[["NDSERP 시스템 오픈","김남호","2022-05-24"],["NEBIS 시스템 안내","김남호","2022-05-24"],["NDS PC 셋팅 안내","김남호","2022-05-24"],["크롬/엣지 외부 로그인 해결","김남호","2022-08-11"],["직무성과급 인사제도 매뉴얼","남택윤","2022-11-29"]];
            for (var k=0;k<notices.length;k++){ S("n_t"+k,816,516+k*36,250,22).set_text((notices.length-k)+". "+notices[k][0]); var na=S("n_a"+k,1060,516+k*36,90,22); na.set_text(notices[k][1]); na.set_font("11px"); na.set_color("#6b7280"); }

            obj = new Layout("default","",1180,900,this,function(p){});
            this.addLayout(obj.name, obj);
        };

        this.loadPreloadList = function() {};

        this.registerScript("comMain.xfdl", function()
        {
            this.sPACKAGENAME = "comMain";
            this.fnc_TransactionCall = function(svcID, url, inDs, outDs, arg, cb) {
                nexacro.getApplication().gfn_transaction(this, svcID, url, inDs, outDs, arg, cb);
            };
            this.fn_FormLoad = function(obj, e)
            {
                var nm = nexacro.getApplication().gv_userNm;
                this.p_name.set_text((nm ? nm : "사용자") + "님");
            };
            // 퀵타일(거래처등록=조직도 자리 데모) 또는 업무일지 클릭 시 거래처등록 열기
            this.q_ic0_onclick = function(obj, e) { nexacro.getApplication().gfn_openWork("po::POVM0001.xfdl"); };
            this.q_lb0_onclick = function(obj, e) { nexacro.getApplication().gfn_openWork("po::POVM0001.xfdl"); };
        });

        this.on_initEvent = function()
        {
            this.addEventHandler("onload", this.fn_FormLoad, this);
            this.q_ic0.addEventHandler("onclick", this.q_ic0_onclick, this);
            this.q_lb0.addEventHandler("onclick", this.q_lb0_onclick, this);
        };

        this.loadPreloadList();
        obj = null;
    };
}
)();
