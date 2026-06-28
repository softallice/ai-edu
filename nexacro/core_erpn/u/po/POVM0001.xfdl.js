//==============================================================================
//  POVM0001.xfdl.js  —  거래처등록 브라우저 런타임
//  ⚠ 컨벤션: .xfdl 의 <Script> 와 동일한 스크립트 패턴을 유지합니다.
//     (Nexacro Studio 가 .xfdl 로부터 자동 생성/갱신 — 본 파일은 손수 작성한 동등 구현)
//==============================================================================
(function()
{
  return function()
  {
    // --- 컴포넌트/데이터셋 생성 (요약) ---
    this.on_create = function()
    {
      this.set_titletext("거래처등록");

      // Datasets
      var ds_Search = new Dataset("ds_Search", this);
      ds_Search.set_useclientlayout("false");
      ds_Search.addColumn("CUST_CD_AND_NM", "STRING", 256);
      ds_Search.addColumn("BUY_SALE_GB", "STRING", 10);
      ds_Search.addColumn("TRAN_EN_YN", "STRING", 1);
      ds_Search.addColumn("ID", "STRING", 32);
      this.addChild("ds_Search", ds_Search);

      var ds_List = new Dataset("ds_List", this);
      ds_List.addColumn("ID", "STRING", 32);
      ds_List.addColumn("CUST_CODE", "STRING", 20);
      ds_List.addColumn("CUST_NM", "STRING", 200);
      ds_List.addColumn("BUY_SALE_GB", "STRING", 10);
      ds_List.addColumn("REPRESENT_NM", "STRING", 100);
      ds_List.addColumn("SAUP_NO", "STRING", 20);
      ds_List.addColumn("TRAN_EN_YN", "STRING", 1);
      this.addChild("ds_List", ds_List);

      var ds_CustInfo = new Dataset("ds_CustInfo", this);
      ds_CustInfo.addColumn("ID", "STRING", 32);
      ds_CustInfo.addColumn("CUST_CODE", "STRING", 20);
      ds_CustInfo.addColumn("SAUP_NO", "STRING", 20);
      ds_CustInfo.addColumn("CUST_NM", "STRING", 200);
      ds_CustInfo.addColumn("CUST_SHOT_NM", "STRING", 100);
      ds_CustInfo.addColumn("BUY_SALE_GB", "STRING", 10);
      ds_CustInfo.addColumn("REPRESENT_NM", "STRING", 100);
      ds_CustInfo.addColumn("REPRESENT_TEL_NO", "STRING", 30);
      ds_CustInfo.addColumn("ADD1", "STRING", 300);
      ds_CustInfo.addColumn("CUST_EMAIL", "STRING", 200);
      ds_CustInfo.addColumn("TRAN_EN_YN", "STRING", 1);
      ds_CustInfo.addColumn("ECONT_YN", "STRING", 1);
      this.addChild("ds_CustInfo", ds_CustInfo);

      var ds_CustMngr = new Dataset("ds_CustMngr", this);
      ds_CustMngr.addColumn("DEPT_NM", "STRING", 100);
      ds_CustMngr.addColumn("EMP_NM", "STRING", 100);
      ds_CustMngr.addColumn("TEL_NO", "STRING", 30);
      ds_CustMngr.addColumn("EMAIL", "STRING", 200);
      this.addChild("ds_CustMngr", ds_CustMngr);

      // Components
      var edt_Search = new Edit("edt_Search", "absolute", 20, 16, 240, 28, null, null);
      this.addChild("edt_Search", edt_Search); edt_Search.show();
      var btn_Search = new Button("btn_Search", "absolute", 420, 16, 70, 28, null, null);
      btn_Search.set_text("조회"); this.addChild("btn_Search", btn_Search); btn_Search.show();
      var btn_New = new Button("btn_New", "absolute", 700, 16, 70, 28, null, null);
      btn_New.set_text("신규"); this.addChild("btn_New", btn_New); btn_New.show();
      var btn_Save = new Button("btn_Save", "absolute", 775, 16, 70, 28, null, null);
      btn_Save.set_text("저장"); this.addChild("btn_Save", btn_Save); btn_Save.show();
      var btn_Delete = new Button("btn_Delete", "absolute", 850, 16, 70, 28, null, null);
      btn_Delete.set_text("삭제"); this.addChild("btn_Delete", btn_Delete); btn_Delete.show();
      var grd_List = new Grid("grd_List", "absolute", 20, 56, 500, 560, null, null);
      grd_List.set_binddataset("ds_List"); this.addChild("grd_List", grd_List); grd_List.show();
      var grd_Mngr = new Grid("grd_Mngr", "absolute", 540, 180, 464, 436, null, null);
      grd_Mngr.set_binddataset("ds_CustMngr"); this.addChild("grd_Mngr", grd_Mngr); grd_Mngr.show();
    };

    // 컴포넌트 바인딩/이벤트 연결
    this.on_init = function()
    {
      this.addEventHandler("onload", this.POVM0001_onload, this);
      this.btn_Search.addEventHandler("onclick", this.btn_Search_onclick, this);
      this.btn_New.addEventHandler("onclick", this.btn_New_onclick, this);
      this.btn_Save.addEventHandler("onclick", this.btn_Save_onclick, this);
      this.btn_Delete.addEventHandler("onclick", this.btn_Delete_onclick, this);
      this.grd_List.addEventHandler("oncellclick", this.grd_List_oncellclick, this);
    };

    this.loadIncludeScript = function()
    {
      // include "script::lib_script_common.xjs" 에 해당 (fnc_TransactionCall 제공)
    };

    //==========================================================================
    //  Script — .xfdl <Script> 와 동일 패턴
    //==========================================================================
    this.registerScript("POVM0001.xfdl", function()
    {
      this.sPACKAGENAME = "POVM0001";

      this.POVM0001_onload = function(obj, e) { this.fn_Init(); };

      this.fn_Init = function()
      {
        this.grd_List.set_format('<Format id="default"><Columns><Column size="80"/><Column size="220"/><Column size="100"/><Column size="100"/></Columns>'
          + '<Head><Band id="head"><Cell text="코드"/><Cell col="1" text="거래처명"/><Cell col="2" text="구분"/><Cell col="3" text="대표자"/></Band></Head>'
          + '<Body><Band id="body"><Cell text="bind:CUST_CODE"/><Cell col="1" text="bind:CUST_NM"/><Cell col="2" text="bind:BUY_SALE_GB"/><Cell col="3" text="bind:REPRESENT_NM"/></Band></Body></Format>');
        this.fn_Search();
      };

      this.fn_Search = function()
      {
        this.fnc_TransactionCall("SEARCH00", "erp/po/POVM0001_SEARCH00.do",
          "ds_Search=ds_Search", "ds_List=ds_List", "", "fn_PostProcess");
      };

      this.fn_SelectDetail = function()
      {
        var nRow = this.ds_List.rowposition;
        this.ds_Search.clearData();
        this.ds_Search.addRow();
        this.ds_Search.setColumn(0, "ID", this.ds_List.getColumn(nRow, "ID"));
        this.fnc_TransactionCall("SEARCH01", "erp/po/POVM0001_SEARCH01.do",
          "ds_Search=ds_Search", "ds_CustInfo=ds_CustInfo ds_CustMngr=ds_CustMngr", "", "fn_PostProcess");
      };

      this.fn_New = function()
      {
        this.ds_CustInfo.clearData(); this.ds_CustInfo.addRow();
        this.ds_CustMngr.clearData();
      };

      this.fn_Save = function()
      {
        if (this.ds_CustInfo.getRowCount() == 0) { alert("저장할 거래처가 없습니다."); return; }
        this.fnc_TransactionCall("SAVE00", "erp/po/POVM0001_SAVE00.do",
          "ds_CustInfo=ds_CustInfo ds_CustMngr=ds_CustMngr", "ds_CustInfo=ds_CustInfo", "", "fn_PostProcess");
      };

      this.fn_Delete = function()
      {
        var sId = this.ds_CustInfo.getColumn(0, "ID");
        if (sId == null || sId == "") { alert("삭제할 거래처를 선택하세요."); return; }
        this.ds_Search.clearData(); this.ds_Search.addRow();
        this.ds_Search.setColumn(0, "ID", sId);
        this.fnc_TransactionCall("DELETE00", "erp/po/POVM0001_DELETE00.do",
          "ds_Search=ds_Search", "", "", "fn_PostProcess");
      };

      this.fn_PostProcess = function(svcID, errCode, errMsg)
      {
        if (errCode < 0) { alert("오류[" + errCode + "] " + errMsg); return; }
        if (svcID == "SAVE00" || svcID == "DELETE00") { this.fn_Search(); }
      };

      this.btn_Search_onclick = function(obj, e) { this.fn_Search(); };
      this.btn_New_onclick    = function(obj, e) { this.fn_New(); };
      this.btn_Save_onclick   = function(obj, e) { this.fn_Save(); };
      this.btn_Delete_onclick = function(obj, e) { this.fn_Delete(); };
      this.grd_List_oncellclick = function(obj, e) { this.fn_SelectDetail(); };
    });
  };
})();
