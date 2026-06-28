(function()
{
    return function()
    {
        if (!this._is_form) return;
        var obj = null;
        this.on_create = function()
        {
            this.set_name("menuFrame");
            this.set_titletext("메뉴");
            if (Form == this.constructor) { this._setFormPosition(220, 756); }
            obj = new Dataset("ds_Menu", this);
            obj.addColumn("MENU_IDXX","STRING",20); obj.addColumn("MENU_NAME","STRING",100);
            obj.addColumn("UPME_IDXX","STRING",20); obj.addColumn("PROG_PATH","STRING",200);
            obj.addColumn("MENU_LEVL","STRING",2); this.addChild(obj.name, obj);
            obj = new Static("sta_Hd","0","0","220","36",null,null,null,null,null,null,this);
            obj.set_text("메뉴"); obj.set_font("bold 14px"); this.addChild(obj.name, obj);
            obj = new Grid("grd_Menu","0","36","220","720",null,null,null,null,null,null,this);
            obj.set_binddataset("ds_Menu"); this.addChild(obj.name, obj);
            obj = new Layout("default","",220,756,this,function(p){});
            this.addLayout(obj.name, obj);
        };
        this.loadPreloadList = function() {};
        this.registerScript("menuFrame.xfdl", function()
        {
            this.sPACKAGENAME = "menuFrame";
            // JSON 트랜잭션 래퍼 (앱 전역 gfn_transaction 사용: XHR+JSON, ErrorCode/ErrorMsg)
            this.fnc_TransactionCall = function(svcID, url, inDs, outDs, arg, cb) {
                nexacro.getApplication().gfn_transaction(this, svcID, url, inDs, outDs, arg, cb);
            };
            this.fn_FormLoad = function(obj, e)
            {
                try { this.grd_Menu.set_format('<Formats><Format id="default"><Columns><Column size="220"/></Columns><Rows><Row size="28" band="head"/><Row size="26" band="body"/></Rows><Band id="head"><Cell text="메뉴"/></Band><Band id="body"><Cell text="bind:MENU_NAME"/></Band></Format></Formats>'); } catch (e) {}
                this.fnc_TransactionCall("Menu","com/ComLogin_Menu.do","","ds_Menu=ds_Menu","","fn_MenuCallback");
            };
            this.fn_MenuCallback = function(svcID, errCode, errMsg)
            {
                if (errCode < 0) { alert("메뉴 조회 실패: " + errMsg); }
            };
            this.grd_Menu_oncellclick = function(obj, e)
            {
                var path = this.ds_Menu.getColumn(e.row, "PROG_PATH");
                if (path != null && path != "") { nexacro.getApplication().gfn_openWork(path); }
            };
        });
        this.on_initEvent = function()
        {
            this.addEventHandler("onload", this.fn_FormLoad, this);
            this.grd_Menu.addEventHandler("oncellclick", this.grd_Menu_oncellclick, this);
        };
        this.loadPreloadList();
        obj = null;
    };
}
)();
