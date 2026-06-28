// comLogin.xfdl.js — 로그인 브라우저 런타임 (.xfdl 와 동일 스크립트 패턴)
// ⚠ 손수 작성 부트 스텁 — 정식 구동은 Nexacro Studio Generate 필요(README).
(function()
{
  return function()
  {
    this.on_create = function()
    {
      this.set_titletext("로그인");
      var ds_Login = new Dataset("ds_Login", this);
      ds_Login.addColumn("USER_ID", "STRING", 200);
      ds_Login.addColumn("PASSWORD", "STRING", 200);
      this.addChild("ds_Login", ds_Login);
      var ds_UserInfo = new Dataset("ds_UserInfo", this);
      ds_UserInfo.addColumn("USER_ID", "STRING", 200);
      ds_UserInfo.addColumn("USER_NM", "STRING", 100);
      ds_UserInfo.addColumn("ACCOUNT_NO", "STRING", 30);
      ds_UserInfo.addColumn("ROLE", "STRING", 100);
      ds_UserInfo.addColumn("TOKEN", "STRING", 1000);
      this.addChild("ds_UserInfo", ds_UserInfo);

      var sta_Title = new Static("sta_Title", "absolute", 470, 270, 340, 40, null, null);
      sta_Title.set_text("ai-edu ERP 로그인"); this.addChild("sta_Title", sta_Title); sta_Title.show();
      var edt_Id = new Edit("edt_Id", "absolute", 470, 330, 340, 36, null, null);
      this.addChild("edt_Id", edt_Id); edt_Id.show();
      var edt_Pw = new Edit("edt_Pw", "absolute", 470, 376, 340, 36, null, null);
      this.addChild("edt_Pw", edt_Pw); edt_Pw.show();
      var btn_Login = new Button("btn_Login", "absolute", 470, 430, 340, 42, null, null);
      btn_Login.set_text("로그인"); this.addChild("btn_Login", btn_Login); btn_Login.show();
    };

    this.on_init = function()
    {
      this.addEventHandler("onload", this.comLogin_onload, this);
      this.btn_Login.addEventHandler("onclick", this.btn_Login_onclick, this);
    };

    this.registerScript("comLogin.xfdl", function()
    {
      this.sPACKAGENAME = "comLogin";
      this.comLogin_onload = function(obj, e) { this.fn_Init(); };
      this.fn_Init = function() { this.ds_Login.clearData(); this.ds_Login.addRow(); };
      this.fn_Login = function()
      {
        if (this.ds_Login.getColumn(0, "USER_ID") == "") { alert("이메일을 입력하세요."); return; }
        this.fnc_TransactionCall("Login", "com/ComLogin_Login.do",
          "ds_Login=ds_Login", "ds_UserInfo=ds_UserInfo", "", "fn_LoginCallback");
      };
      this.fn_LoginCallback = function(svcID, errCode, errMsg)
      {
        if (errCode < 0) { alert("로그인 실패: " + errMsg); return; }
        var app = nexacro.getApplication();
        app.gv_token  = this.ds_UserInfo.getColumn(0, "TOKEN");
        app.gv_userId = this.ds_UserInfo.getColumn(0, "USER_ID");
        app.gv_userNm = this.ds_UserInfo.getColumn(0, "USER_NM");
        app.gfn_openMainFrame();
      };
      this.btn_Login_onclick = function(obj, e) { this.fn_Login(); };
    });
  };
})();
