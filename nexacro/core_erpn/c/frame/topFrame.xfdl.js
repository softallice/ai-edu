(function()
{
    return function()
    {
        if (!this._is_form) return;
        var obj = null;
        this.on_create = function()
        {
            this.set_name("topFrame");
            this.set_titletext("상단");
            if (Form == this.constructor) { this._setFormPosition(1280, 44); }
            obj = new Static("sta_Title","16","8","300","28",null,null,null,null,null,null,this);
            obj.set_text("ai-edu ERP"); obj.set_font("bold 16px"); this.addChild(obj.name, obj);
            obj = new Static("sta_User","900","10","240","24",null,null,null,null,null,null,this);
            this.addChild(obj.name, obj);
            obj = new Button("btn_Logout","1150","8","110","28",null,null,null,null,null,null,this);
            obj.set_text("로그아웃"); this.addChild(obj.name, obj);
            obj = new Layout("default","",1280,44,this,function(p){});
            this.addLayout(obj.name, obj);
        };
        this.loadPreloadList = function() {};
        this.registerScript("topFrame.xfdl", function()
        {
            this.sPACKAGENAME = "topFrame";
            // JSON 트랜잭션 래퍼 (앱 전역 gfn_transaction 사용: XHR+JSON, ErrorCode/ErrorMsg)
            this.fnc_TransactionCall = function(svcID, url, inDs, outDs, arg, cb) {
                nexacro.getApplication().gfn_transaction(this, svcID, url, inDs, outDs, arg, cb);
            };
            this.fn_FormLoad = function(obj, e)
            {
                var app = nexacro.getApplication();
                this.sta_User.set_text((app.gv_userNm || "") + " (" + (app.gv_userId || "") + ")");
            };
            this.fn_Logout = function(obj, e) { nexacro.getApplication().gfn_logout(); };
        });
        this.on_initEvent = function()
        {
            this.addEventHandler("onload", this.fn_FormLoad, this);
            this.btn_Logout.addEventHandler("onclick", this.fn_Logout, this);
        };
        this.loadPreloadList();
        obj = null;
    };
}
)();
