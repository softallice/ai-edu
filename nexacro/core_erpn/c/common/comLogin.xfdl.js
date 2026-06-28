// comLogin.xfdl.js — 로그인 (Nexacro 컴파일 구조 준수: on_create/on_initEvent/include)
(function()
{
    return function()
    {
        if (!this._is_form) return;
        var obj = null;

        this.on_create = function()
        {
            this.set_name("comLogin");
            this.set_titletext("로그인");
            if (Form == this.constructor) { this._setFormPosition(1280, 800); }

            obj = new Dataset("ds_Login", this);
            obj.addColumn("USER_ID", "STRING", 200);
            obj.addColumn("PASSWORD", "STRING", 200);
            this.addChild(obj.name, obj);
            obj = new Dataset("ds_UserInfo", this);
            obj.addColumn("USER_ID", "STRING", 200); obj.addColumn("USER_NM", "STRING", 100);
            obj.addColumn("ACCOUNT_NO", "STRING", 30); obj.addColumn("ROLE", "STRING", 100);
            obj.addColumn("TOKEN", "STRING", 1000);
            this.addChild(obj.name, obj);

            obj = new Static("sta_Title","470","270","340","40",null,null,null,null,null,null,this);
            obj.set_text("ai-edu ERP 로그인"); obj.set_font("bold 20px"); this.addChild(obj.name, obj);
            obj = new Edit("edt_Id","470","330","340","36",null,null,null,null,null,null,this);
            this.addChild(obj.name, obj);
            obj = new Edit("edt_Pw","470","376","340","36",null,null,null,null,null,null,this);
            obj.set_password("true"); this.addChild(obj.name, obj);
            obj = new Button("btn_Login","470","430","340","42",null,null,null,null,null,null,this);
            obj.set_text("로그인"); this.addChild(obj.name, obj);
            obj = new Static("sta_Hint","470","486","340","20",null,null,null,null,null,null,this);
            obj.set_text("데모: admin@aiedu.local / admin1234"); this.addChild(obj.name, obj);

            obj = new Layout("default","",1280,800,this,function(p){});
            this.addLayout(obj.name, obj);
        };

        this.loadPreloadList = function() {};

        this.registerScript("comLogin.xfdl", function()
        {
            this.sPACKAGENAME = "comLogin";
            // JSON 트랜잭션 래퍼 (앱 전역 gfn_transaction 사용: XHR+JSON, ErrorCode/ErrorMsg)
            this.fnc_TransactionCall = function(svcID, url, inDs, outDs, arg, cb) {
                nexacro.getApplication().gfn_transaction(this, svcID, url, inDs, outDs, arg, cb);
            };

            this.fn_FormLoad = function(obj, e)
            {
                this.ds_Login.clearData(); this.ds_Login.addRow();
                this.edt_Id.set_value("admin@aiedu.local");
            };

            this.fn_Login = function(obj, e)
            {
                this.ds_Login.clearData(); this.ds_Login.addRow();
                this.ds_Login.setColumn(0, "USER_ID", this.edt_Id.value);
                this.ds_Login.setColumn(0, "PASSWORD", this.edt_Pw.value);
                if (this.ds_Login.getColumn(0,"USER_ID") == "") { alert("이메일을 입력하세요."); return; }
                this.fnc_TransactionCall("Login","com/ComLogin_Login.do",
                    "ds_Login=ds_Login","ds_UserInfo=ds_UserInfo","","fn_LoginCallback");
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
        });

        this.on_initEvent = function()
        {
            this.addEventHandler("onload", this.fn_FormLoad, this);
            this.btn_Login.addEventHandler("onclick", this.fn_Login, this);
        };

        this.loadPreloadList();
        obj = null;
    };
}
)();
