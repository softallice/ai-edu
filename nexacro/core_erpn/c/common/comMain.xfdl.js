// comMain.xfdl.js — 홈 대시보드(메인화면). Nexacro 컴파일 구조 준수.
(function()
{
    return function()
    {
        if (!this._is_form) return;
        var obj = null;

        this.on_create = function()
        {
            this.set_name("comMain");
            this.set_titletext("홈");
            this.set_background("#f8fafc");
            if (Form == this.constructor) { this._setFormPosition(1040, 720); }

            obj = new Dataset("ds_Stats", this);
            obj.addColumn("CUST_CNT","STRING",20); obj.addColumn("ACTIVE_CNT","STRING",20);
            obj.addColumn("PROG_CNT","STRING",20); obj.addColumn("TOTAL_PROG","STRING",20);
            this.addChild(obj.name, obj);

            obj = new Static("sta_Welcome","24","20","700","32",null,null,null,null,null,null,this);
            obj.set_text("환영합니다"); obj.set_font("bold 22px"); obj.set_color("#0f172a"); this.addChild(obj.name, obj);
            obj = new Static("sta_Sub","24","56","800","22",null,null,null,null,null,null,this);
            obj.set_text("ai-edu ERP 메인 대시보드 — 레거시 Nexacro 화면 이관 데모"); obj.set_color("#64748b"); this.addChild(obj.name, obj);

            // 통계 카드 3종 (박스 + 라벨 + 값)
            var cards = [
                ["card1","거래처 수","sta_v1","#2563eb","24"],
                ["card2","사용중 거래처","sta_v2","#16a34a","344"],
                ["card3","이관 프로그램","sta_v3","#7c3aed","664"]
            ];
            for (var i = 0; i < cards.length; i++) {
                var c = cards[i];
                obj = new Static(c[0],c[4],"100","300","120",null,null,null,null,null,null,this);
                obj.set_background("#ffffff"); obj.set_border("1px solid #e2e8f0"); this.addChild(obj.name, obj);
                obj = new Static(c[0]+"_lbl",c[4],"116","300","24",null,null,null,null,null,null,this);
                obj.set_text(c[1]); obj.set_color("#64748b"); obj.set_font("14px"); this.addChild(obj.name, obj);
                obj = new Static(c[2],c[4],"146","300","56",null,null,null,null,null,null,this);
                obj.set_text("-"); obj.set_font("bold 40px"); obj.set_color(c[3]); this.addChild(obj.name, obj);
            }

            obj = new Static("sta_Guide","24","250","980","60",null,null,null,null,null,null,this);
            obj.set_text("좌측 메뉴에서 [구매관리 > 거래처등록]을 클릭하면 실제 이관된 프로그램이 열립니다.");
            obj.set_color("#334155"); this.addChild(obj.name, obj);

            obj = new Layout("default","",1040,720,this,function(p){});
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
                this.sta_Welcome.set_text("환영합니다, " + (nm ? nm : "사용자") + "님");
                this.fnc_TransactionCall("Stats","com/ComMain_Stats.do","","ds_Stats=ds_Stats","","fn_StatsCallback");
            };
            this.fn_StatsCallback = function(svcID, errCode, errMsg)
            {
                if (errCode < 0 || this.ds_Stats.getRowCount() == 0) return;
                this.sta_v1.set_text(this.ds_Stats.getColumn(0, "CUST_CNT"));
                this.sta_v2.set_text(this.ds_Stats.getColumn(0, "ACTIVE_CNT"));
                this.sta_v3.set_text(this.ds_Stats.getColumn(0, "PROG_CNT") + " / " + this.ds_Stats.getColumn(0, "TOTAL_PROG"));
            };
        });

        this.on_initEvent = function()
        {
            this.addEventHandler("onload", this.fn_FormLoad, this);
        };

        this.loadPreloadList();
        obj = null;
    };
}
)();
