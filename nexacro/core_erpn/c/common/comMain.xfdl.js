// comMain.xfdl.js — NDS ERP 포털형 메인 (실제 comMainNDS_2025 구조 기반: 데이터 바인딩 그리드 + 퀵버튼)
(function()
{
    return function()
    {
        if (!this._is_form) return;
        var obj = null; var self = this;
        function S(id,l,t,w,h){ var o=new Static(id,String(l),String(t),String(w),String(h),null,null,null,null,null,null,self); self.addChild(id,o); o.show(); return o; }

        this.on_create = function()
        {
            this.set_name("comMain"); this.set_titletext("홈"); this.set_background("#ffffff");
            if (Form == this.constructor) { this._setFormPosition(1180, 900); }

            // 데이터셋 (레거시 dsTM_NOTICE / dsTM_SCHDXM 대응)
            obj=new Dataset("ds_Notice",this); obj.addColumn("NO","STRING",6); obj.addColumn("TITLE","STRING",200); obj.addColumn("WRITER","STRING",30); obj.addColumn("REG_DT","STRING",20); this.addChild(obj.name,obj);
            obj=new Dataset("ds_Schedule",this); obj.addColumn("SCH_DT","STRING",30); obj.addColumn("SCH_NM","STRING",100); this.addChild(obj.name,obj);

            // ===== 프로필 카드 =====
            S("p_card",24,24,360,250).set_background("#ffffff"); this.p_card.set_border("1px solid #ECE3CC");
            var ph=S("p_photo",48,56,84,84); ph.set_background("#F2C94C"); ph.set_text("👤"); ph.set_font("40px");
            S("p_name",150,64,210,30).set_text("사용자님"); this.p_name.set_font("bold 18px");
            S("p_dept",150,96,210,22).set_text("플랫폼개발실"); this.p_dept.set_color("#6b7280");
            var bd=S("p_badge",150,126,110,24); bd.set_text("휴가현황보기"); bd.set_background("#F7E9BE"); bd.set_color("#8a6d1f"); bd.set_font("12px");
            S("p_l1",48,170,200,22).set_text("연차휴가"); this.p_l1.set_color("#6b7280");
            S("p_v1",250,170,110,22).set_text("2일 / 22일");
            S("p_l2",48,196,200,22).set_text("휴일보상휴가"); this.p_l2.set_color("#6b7280");
            S("p_v2",250,196,110,22).set_text("0일 / 0일");
            var pb=new Button("p_btn","48","232","312","32",null,null,null,null,null,null,this); pb.set_text("개인정보상세보기"); pb.set_background("#F2C94C"); pb.set_color("#5b4708"); this.addChild("p_btn",pb); pb.show();

            // ===== NDS VISION 배너 =====
            S("v_box",404,24,752,250).set_background("#FBF3E0");
            S("v_kicker",436,52,400,24).set_text("NDS VISION"); this.v_kicker.set_color("#9a8550"); this.v_kicker.set_font("bold 15px");
            S("v_title",436,82,700,44).set_text("Cloud 혁신으로 Data가 지배하는 미래를 함께 연다."); this.v_title.set_font("bold 26px"); this.v_title.set_color("#1f2937");
            S("v_sub",436,150,680,26).set_text("고객의 사업적 고민을 데이터 중심의 업무 혁신으로 해결합니다."); this.v_sub.set_color("#4b5563"); this.v_sub.set_font("16px");
            S("v_arrow",980,150,150,100).set_text("📈 지속성장"); this.v_arrow.set_color("#C9A24B"); this.v_arrow.set_font("bold 16px");

            // ===== 퀵 메뉴 (버튼 — 클릭 가능) =====
            S("q_bar",24,290,1132,110).set_background("#ffffff"); this.q_bar.set_border("1px solid #eee");
            var tiles=["업무일지","조직도","출퇴근현황","활동시간표","휴가계신청","연장근로신청","급여명세표","성과실적","근로소득","연말정산"];
            var paths=["po::POVM0001.xfdl","","","","","","","","",""];
            this._qpaths=paths;
            for (var i=0;i<tiles.length;i++){
                var x=40+i*111;
                S("q_ic"+i,x,310,90,40).set_text("▣"); this["q_ic"+i].set_font("26px"); this["q_ic"+i].set_color("#C9A24B");
                var btn=new Button("q_btn"+i,String(x),"352","100","36",null,null,null,null,null,null,this);
                btn.set_text(tiles[i]); btn.set_cssclass(""); btn.set_background("#ffffff"); btn.set_border("0px none"); btn.set_color("#374151"); btn.set_font("12px");
                this.addChild("q_btn"+i,btn); btn.show();
            }

            // ===== 나의메뉴 바 =====
            S("my_bar",24,410,1132,40).set_background("#4b5563");
            S("my_lb",40,420,200,22).set_text("≡ 나의메뉴"); this.my_lb.set_color("#ffffff"); this.my_lb.set_font("bold 13px");

            // ===== 캘린더(정적) =====
            S("c_box",24,466,360,310).set_background("#ffffff"); this.c_box.set_border("1px solid #eee");
            S("c_title",150,480,120,26).set_text("2026.06"); this.c_title.set_font("bold 16px");
            var dow=["일","월","화","수","목","금","토"];
            for (var d=0;d<7;d++){ var dl=S("c_d"+d,40+d*46,512,40,22); dl.set_text(dow[d]); dl.set_font("12px"); dl.set_color(d==0?"#ef4444":(d==6?"#3b82f6":"#374151")); }
            for (var day=1;day<=30;day++){ var idx=day-1; var row=Math.floor(idx/7); var col=idx%7;
                var cl=S("c_c"+day,40+col*46,540+row*38,40,30); cl.set_text(String(day)); cl.set_font("12px");
                if(col==0) cl.set_color("#ef4444"); else if(col==6) cl.set_color("#3b82f6"); }

            // ===== 일정(그리드 — 데이터 바인딩) =====
            S("s_title",424,480,200,26).set_text("일정"); this.s_title.set_font("bold 16px");
            var gs=new Grid("grd_Schedule","404","510","372","266",null,null,null,null,null,null,this);
            gs.set_binddataset("ds_Schedule");
            gs._setContents('<Formats><Format id="default"><Columns><Column size="150"/><Column size="222"/></Columns><Rows><Row size="0" band="head"/><Row size="32"/></Rows><Band id="body"><Cell text="bind:SCH_DT" color="#2563eb"/><Cell col="1" text="bind:SCH_NM" align="left"/></Band></Format></Formats>');
            this.addChild("grd_Schedule",gs); gs.show();

            // ===== 시스템 안내(그리드 — 데이터 바인딩) =====
            S("n_title",816,480,200,26).set_text("시스템 안내"); this.n_title.set_font("bold 16px");
            var gn=new Grid("grd_Notice","796","510","360","266",null,null,null,null,null,null,this);
            gn.set_binddataset("ds_Notice");
            gn._setContents('<Formats><Format id="default"><Columns><Column size="24"/><Column size="230"/><Column size="60"/><Column size="80"/></Columns><Rows><Row size="0" band="head"/><Row size="30"/></Rows><Band id="body"><Cell text="bind:NO" color="#9ca3af"/><Cell col="1" text="bind:TITLE" align="left"/><Cell col="2" text="bind:WRITER" color="#6b7280"/><Cell col="3" text="bind:REG_DT" color="#9ca3af" font="11px"/></Band></Format></Formats>');
            this.addChild("grd_Notice",gn); gn.show();

            obj = new Layout("default","",1180,900,this,function(p){}); this.addLayout(obj.name, obj);
        };

        this.loadPreloadList = function() {};

        this.registerScript("comMain.xfdl", function()
        {
            this.sPACKAGENAME = "comMain";
            this.fnc_TransactionCall = function(svcID,url,inDs,outDs,arg,cb){ nexacro.getApplication().gfn_transaction(this,svcID,url,inDs,outDs,arg,cb); };
            this.fn_FormLoad = function(obj, e)
            {
                var nm=nexacro.getApplication().gv_userNm; this.p_name.set_text((nm?nm:"사용자")+"님");
                this.fnc_TransactionCall("Portal","com/ComMain_Portal.do","","ds_Notice=ds_Notice ds_Schedule=ds_Schedule","","fn_PortalCb");
            };
            this.fn_PortalCb = function(svcID, errCode, errMsg){ if(errCode<0) { /* 무시 */ } };
            this.q_btn_onclick = function(obj, e)
            {
                var idx=parseInt(obj.name.replace("q_btn",""),10);
                var path=this._qpaths[idx];
                if(path && path!=""){ nexacro.getApplication().gfn_openWork(path); }
                else { alert("준비중인 화면입니다. (이관 예정)"); }
            };
        });

        this.on_initEvent = function()
        {
            this.addEventHandler("onload", this.fn_FormLoad, this);
            for (var i=0;i<10;i++){ this["q_btn"+i].addEventHandler("onclick", this.q_btn_onclick, this); }
        };

        this.loadPreloadList(); obj = null;
    };
}
)();
