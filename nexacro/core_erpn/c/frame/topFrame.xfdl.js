// topFrame.xfdl.js — ⚠ 손수 작성 부트 스텁(Studio Generate 권장)
(function() {
  return function() {
    this.on_create = function() {
      this.set_titletext("상단");
      var sta_Title = new Static("sta_Title","absolute",16,8,300,28,null,null);
      sta_Title.set_text("ai-edu ERP"); this.addChild("sta_Title", sta_Title); sta_Title.show();
      var sta_User = new Static("sta_User","absolute",900,10,240,24,null,null);
      this.addChild("sta_User", sta_User); sta_User.show();
      var btn_Logout = new Button("btn_Logout","absolute",1150,8,110,28,null,null);
      btn_Logout.set_text("로그아웃"); this.addChild("btn_Logout", btn_Logout); btn_Logout.show();
    };
    this.on_init = function() {
      this.addEventHandler("onload", this.topFrame_onload, this);
      this.btn_Logout.addEventHandler("onclick", this.btn_Logout_onclick, this);
    };
    this.registerScript("topFrame.xfdl", function() {
      this.sPACKAGENAME = "topFrame";
      this.topFrame_onload = function(obj, e) {
        var app = nexacro.getApplication();
        this.sta_User.set_text((app.gv_userNm || "") + " (" + (app.gv_userId || "") + ")");
      };
      this.btn_Logout_onclick = function(obj, e) { nexacro.getApplication().gfn_logout(); };
    });
  };
})();
