// topFrame.xfdl.js — NDS ERP 상단바 (브랜드 + 가로 메뉴 + 사용자)
(function()
{
    return function()
    {
        if (!this._is_form) return;
        var obj = null; var self=this;
        function S(id,l,t,w,h){ var o=new Static(id,String(l),String(t),String(w),String(h),null,null,null,null,null,null,self); self.addChild(id,o); o.show(); return o; }

        this.on_create = function()
        {
            this.set_name("topFrame");
            this.set_titletext("상단");
            this.set_background("#ffffff");
            if (Form == this.constructor) { this._setFormPosition(1280, 56); }

            // NDS 로고
            var logo=S("t_logo",16,12,44,32); logo.set_background("#D62828"); logo.set_text("NDS"); logo.set_color("#ffffff"); logo.set_font("bold 14px");
            S("t_erp",66,14,70,28).set_text("ERP"); this.t_erp.set_font("bold 18px"); this.t_erp.set_color("#374151");

            // 가로 메뉴
            var menus=["프로젝트관리","영업","구매","재무","인사","평가","총무","공통"];
            var mx=200;
            for (var i=0;i<menus.length;i++){
                var w = menus[i].length*15+24;
                var m=S("t_m"+i,mx,16,w,26); m.set_text(menus[i]); m.set_font("bold 14px");
                if (i==0){ m.set_background("#FCE588"); m.set_color("#5b4708"); } else { m.set_color("#374151"); }
                mx += w + 14;
            }

            // 우측: 사용자 / 사이트맵 / 로그아웃
            S("t_user",980,16,210,24).set_text("사용자"); this.t_user.set_color("#374151");
            S("t_site",1190,16,60,24).set_text("사이트맵"); this.t_site.set_color("#6b7280"); this.t_site.set_font("12px");
            var lo=new Button("btn_Logout","1255","14","18","28",null,null,null,null,null,null,this);
            lo.set_text("⏻"); this.addChild("btn_Logout",lo); lo.show();

            obj = new Layout("default","",1280,56,this,function(p){});
            this.addLayout(obj.name, obj);
        };
        this.loadPreloadList = function() {};
        this.registerScript("topFrame.xfdl", function()
        {
            this.sPACKAGENAME = "topFrame";
            this.fn_FormLoad = function(obj, e)
            {
                var app = nexacro.getApplication();
                var nm = app.gv_userNm; var id = app.gv_userId;
                this.t_user.set_text("플랫폼개발실 / " + (nm ? nm : "사용자"));
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
