// POVM0001.xfdl.js — 거래처등록 (Nexacro 컴파일 구조 준수)
(function()
{
    return function()
    {
        if (!this._is_form) return;
        var obj = null;

        this.on_create = function()
        {
            this.set_name("POVM0001");
            this.set_titletext("거래처등록");
            if (Form == this.constructor) { this._setFormPosition(1040, 760); }

            obj = new Dataset("ds_Search", this);
            obj.addColumn("CUST_CD_AND_NM","STRING",256); obj.addColumn("BUY_SALE_GB","STRING",10);
            obj.addColumn("TRAN_EN_YN","STRING",1); obj.addColumn("ID","STRING",32);
            this.addChild(obj.name, obj);
            obj = new Dataset("ds_List", this);
            obj.addColumn("ID","STRING",32); obj.addColumn("CUST_CODE","STRING",20);
            obj.addColumn("CUST_NM","STRING",200); obj.addColumn("BUY_SALE_GB","STRING",10);
            obj.addColumn("REPRESENT_NM","STRING",100); obj.addColumn("SAUP_NO","STRING",20);
            obj.addColumn("TRAN_EN_YN","STRING",1); this.addChild(obj.name, obj);
            obj = new Dataset("ds_CustInfo", this);
            obj.addColumn("ID","STRING",32); obj.addColumn("CUST_CODE","STRING",20);
            obj.addColumn("SAUP_NO","STRING",20); obj.addColumn("CUST_NM","STRING",200);
            obj.addColumn("BUY_SALE_GB","STRING",10); obj.addColumn("REPRESENT_NM","STRING",100);
            obj.addColumn("TRAN_EN_YN","STRING",1); this.addChild(obj.name, obj);
            obj = new Dataset("ds_CustMngr", this);
            obj.addColumn("DEPT_NM","STRING",100); obj.addColumn("EMP_NM","STRING",100);
            obj.addColumn("TEL_NO","STRING",30); obj.addColumn("EMAIL","STRING",200);
            this.addChild(obj.name, obj);

            obj = new Edit("edt_Search","20","16","240","28",null,null,null,null,null,null,this);
            this.addChild(obj.name, obj);
            obj = new Button("btn_Search","270","16","70","28",null,null,null,null,null,null,this);
            obj.set_text("조회"); this.addChild(obj.name, obj);
            obj = new Button("btn_New","700","16","70","28",null,null,null,null,null,null,this);
            obj.set_text("신규"); this.addChild(obj.name, obj);
            obj = new Button("btn_Save","775","16","70","28",null,null,null,null,null,null,this);
            obj.set_text("저장"); this.addChild(obj.name, obj);
            obj = new Button("btn_Delete","850","16","70","28",null,null,null,null,null,null,this);
            obj.set_text("삭제"); this.addChild(obj.name, obj);
            obj = new Grid("grd_List","20","56","500","560",null,null,null,null,null,null,this);
            obj.set_binddataset("ds_List"); this.addChild(obj.name, obj);
            obj = new Grid("grd_Mngr","540","180","464","436",null,null,null,null,null,null,this);
            obj.set_binddataset("ds_CustMngr"); this.addChild(obj.name, obj);

            obj = new Layout("default","",1040,760,this,function(p){});
            this.addLayout(obj.name, obj);
        };

        this.loadPreloadList = function() {};

        this.registerScript("POVM0001.xfdl", function()
        {
            this.sPACKAGENAME = "POVM0001";
            // JSON 트랜잭션 래퍼 (앱 전역 gfn_transaction 사용: XHR+JSON, ErrorCode/ErrorMsg)
            this.fnc_TransactionCall = function(svcID, url, inDs, outDs, arg, cb) {
                nexacro.getApplication().gfn_transaction(this, svcID, url, inDs, outDs, arg, cb);
            };

            this.fn_FormLoad = function(obj, e)
            {
                try { this.grd_List.set_format('<Formats><Format id="default"><Columns><Column size="80"/><Column size="220"/><Column size="100"/><Column size="100"/></Columns><Rows><Row size="28" band="head"/><Row size="26" band="body"/></Rows><Band id="head"><Cell text="코드"/><Cell col="1" text="거래처명"/><Cell col="2" text="구분"/><Cell col="3" text="대표자"/></Band><Band id="body"><Cell text="bind:CUST_CODE"/><Cell col="1" text="bind:CUST_NM"/><Cell col="2" text="bind:BUY_SALE_GB"/><Cell col="3" text="bind:REPRESENT_NM"/></Band></Format></Formats>'); } catch (e) {}
                try { this.grd_Mngr.set_format('<Formats><Format id="default"><Columns><Column size="120"/><Column size="120"/><Column size="120"/><Column size="100"/></Columns><Rows><Row size="28" band="head"/><Row size="26" band="body"/></Rows><Band id="head"><Cell text="소속"/><Cell col="1" text="성명"/><Cell col="2" text="전화"/><Cell col="3" text="이메일"/></Band><Band id="body"><Cell text="bind:DEPT_NM"/><Cell col="1" text="bind:EMP_NM"/><Cell col="2" text="bind:TEL_NO"/><Cell col="3" text="bind:EMAIL"/></Band></Format></Formats>'); } catch (e) {}
                this.fn_Search();
            };
            this.fn_Search = function()
            {
                this.ds_Search.clearData(); this.ds_Search.addRow();
                this.ds_Search.setColumn(0, "CUST_CD_AND_NM", this.edt_Search.value);
                this.fnc_TransactionCall("SEARCH00","erp/po/POVM0001_SEARCH00.do",
                    "ds_Search=ds_Search","ds_List=ds_List","","fn_PostProcess");
            };
            this.fn_SelectDetail = function()
            {
                var nRow = this.ds_List.rowposition;
                this.ds_Search.clearData(); this.ds_Search.addRow();
                this.ds_Search.setColumn(0, "ID", this.ds_List.getColumn(nRow, "ID"));
                this.fnc_TransactionCall("SEARCH01","erp/po/POVM0001_SEARCH01.do",
                    "ds_Search=ds_Search","ds_CustInfo=ds_CustInfo ds_CustMngr=ds_CustMngr","","fn_PostProcess");
            };
            this.fn_New = function() { this.ds_CustInfo.clearData(); this.ds_CustInfo.addRow(); this.ds_CustMngr.clearData(); };
            this.fn_Save = function()
            {
                if (this.ds_CustInfo.getRowCount() == 0) { alert("저장할 거래처가 없습니다."); return; }
                this.fnc_TransactionCall("SAVE00","erp/po/POVM0001_SAVE00.do",
                    "ds_CustInfo=ds_CustInfo ds_CustMngr=ds_CustMngr","ds_CustInfo=ds_CustInfo","","fn_PostProcess");
            };
            this.fn_Delete = function()
            {
                var sId = this.ds_CustInfo.getColumn(0, "ID");
                if (sId == null || sId == "") { alert("삭제할 거래처를 선택하세요."); return; }
                this.ds_Search.clearData(); this.ds_Search.addRow();
                this.ds_Search.setColumn(0, "ID", sId);
                this.fnc_TransactionCall("DELETE00","erp/po/POVM0001_DELETE00.do",
                    "ds_Search=ds_Search","","","fn_PostProcess");
            };
            this.fn_PostProcess = function(svcID, errCode, errMsg)
            {
                if (errCode < 0) { alert("오류[" + errCode + "] " + errMsg); return; }
                if (svcID == "SAVE00" || svcID == "DELETE00") { this.fn_Search(); }
            };
        });

        this.on_initEvent = function()
        {
            this.addEventHandler("onload", this.fn_FormLoad, this);
            this.btn_Search.addEventHandler("onclick", function(o,e){ this.fn_Search(); });
            this.btn_New.addEventHandler("onclick", function(o,e){ this.fn_New(); });
            this.btn_Save.addEventHandler("onclick", function(o,e){ this.fn_Save(); });
            this.btn_Delete.addEventHandler("onclick", function(o,e){ this.fn_Delete(); });
            this.grd_List.addEventHandler("oncellclick", function(o,e){ this.fn_SelectDetail(); });
        };

        this.loadPreloadList();
        obj = null;
    };
}
)();
