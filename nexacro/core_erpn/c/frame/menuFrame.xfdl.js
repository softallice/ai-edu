// menuFrame.xfdl.js — ⚠ 손수 작성 부트 스텁(Studio Generate 권장)
(function() {
  return function() {
    this.on_create = function() {
      this.set_titletext("메뉴");
      var ds_Menu = new Dataset("ds_Menu", this);
      ds_Menu.addColumn("MENU_IDXX","STRING",20); ds_Menu.addColumn("MENU_NAME","STRING",100);
      ds_Menu.addColumn("UPME_IDXX","STRING",20); ds_Menu.addColumn("PROG_PATH","STRING",200);
      ds_Menu.addColumn("MENU_LEVL","STRING",2); this.addChild("ds_Menu", ds_Menu);
      var grd_Menu = new Grid("grd_Menu","absolute",0,36,220,720,null,null);
      grd_Menu.set_binddataset("ds_Menu"); this.addChild("grd_Menu", grd_Menu); grd_Menu.show();
    };
    this.on_init = function() {
      this.addEventHandler("onload", this.menuFrame_onload, this);
      this.grd_Menu.addEventHandler("oncellclick", this.grd_Menu_oncellclick, this);
    };
    this.registerScript("menuFrame.xfdl", function() {
      this.sPACKAGENAME = "menuFrame";
      this.menuFrame_onload = function(obj, e) { this.fn_LoadMenu(); };
      this.fn_LoadMenu = function() {
        this.grd_Menu.set_format('<Format id="default"><Columns><Column size="220"/></Columns>'
          + '<Head><Band id="head"><Cell text="메뉴"/></Band></Head>'
          + '<Body><Band id="body"><Cell text="bind:MENU_NAME"/></Band></Body></Format>');
        this.fnc_TransactionCall("Menu", "com/ComLogin_Menu.do", "", "ds_Menu=ds_Menu", "", "fn_MenuCallback");
      };
      this.fn_MenuCallback = function(svcID, errCode, errMsg) {
        if (errCode < 0) { alert("메뉴 조회 실패: " + errMsg); }
      };
      this.grd_Menu_oncellclick = function(obj, e) {
        var path = this.ds_Menu.getColumn(e.row, "PROG_PATH");
        if (path != null && path != "") { nexacro.getApplication().gfn_openWork(path); }
      };
    });
  };
})();
