// 컴파일된 Application (런타임 로드용). index.html 의 screeninfo.xadl 이 참조.
// 부팅: 모든 프레임(로그인/상단/메뉴/작업)을 미리 생성하고 VFrameSet separatesize 로 가시성 토글.
//   초기: "*,0,0" (로그인만) → 로그인 성공: "0,44,*" (상단+메뉴+작업).
// 백엔드와는 gfn_transaction(XHR+JSON)으로 통신.
//
// ⚠ 손수 작성 부트 스텁. 정식 구동/배포는 Nexacro Studio Generate 권장(README).
(function()
{
    return function()
    {
        this.on_loadAppVariables = function()
        {
            this._addVariable("gv_svcUrl", "http://localhost:8080/nexacro");
            this._addVariable("gv_token", "");
            this._addVariable("gv_userId", "");
            this._addVariable("gv_userNm", "");
        };

        this.on_initApplication = function()
        {
            this.set_id("core_erpn");
            this.set_screenid("screen_generated");
            if (this._is_attach_childframe) return;
            var mainframe = this.createMainFrame("mainframe", "0", "0", "1280", "800", null, null, this);
            mainframe.set_showtitlebar("true");
            mainframe.set_showstatusbar("false");
            mainframe.set_titletext("ai-edu ERP (Nexacro)");
            mainframe.on_createBodyFrame = this.mainframe_createBodyFrame;
        };

        this.loadPreloadList = function() {};

        // 모든 프레임을 미리 생성 (this = mainframe). 초기엔 로그인만 보이게 separatesize.
        this.mainframe_createBodyFrame = function()
        {
            var vset = new VFrameSet("VFrameSet", null, null, null, null, null, null, this);
            this.addChild(vset.name, vset);
            this.frame = vset;

            var login = new ChildFrame("LOGINFRAME", null, null, null, null, null, null, "common::comLogin.xfdl", vset);
            login.set_showtitlebar("false");
            vset.addChild(login.name, login);
            login.set_formurl("common::comLogin.xfdl");

            var top = new ChildFrame("TOPFRAME", null, null, null, null, null, null, "frame::topFrame.xfdl", vset);
            top.set_showtitlebar("false");
            vset.addChild(top.name, top);
            top.set_formurl("frame::topFrame.xfdl");

            var hmain = new HFrameSet("HMAIN", null, null, null, null, null, null, vset);
            hmain.set_separatesize("220,*");
            vset.addChild(hmain.name, hmain);

            var menu = new ChildFrame("MENUFRAME", null, null, null, null, null, null, "frame::menuFrame.xfdl", hmain);
            menu.set_showtitlebar("false");
            hmain.addChild(menu.name, menu);
            menu.set_formurl("frame::menuFrame.xfdl");

            var work = new ChildFrame("WORKFRAME", null, null, null, null, null, null, "common::comMain.xfdl", hmain);
            work.set_showtitlebar("false");
            hmain.addChild(work.name, work);
            work.set_formurl("common::comMain.xfdl");

            // 초기: 로그인 프레임만 표시
            vset.set_separatesize("*,0,0");
        };

        // 로그인 성공 → 메인(상단+메뉴+작업) 표시 (this = application)
        this.gfn_openMainFrame = function()
        {
            var vf = this.mainframe.VFrameSet;
            vf.set_separatesize("0,44,*");
            try { vf.LOGINFRAME.set_visible(false); } catch (e) {}
            try { vf.TOPFRAME.set_visible(true); } catch (e) {}
            try { vf.HMAIN.set_visible(true); } catch (e) {}
            // 숨겨져 있던 메인 프레임을 표시한 뒤 formurl 을 재설정해 폼 로드(+onload 트랜잭션)를 강제
            vf.TOPFRAME.set_formurl("frame::topFrame.xfdl");
            vf.HMAIN.MENUFRAME.set_formurl("frame::menuFrame.xfdl");
            vf.HMAIN.WORKFRAME.set_formurl("common::comMain.xfdl");
        };

        // 메뉴 클릭 → 작업영역 폼 교체 (this = application)
        this.gfn_openWork = function(formurl)
        {
            var work = this.mainframe.VFrameSet.HMAIN.WORKFRAME;
            if (work) {
                work.set_formurl(formurl);
                var self = this;
                setTimeout(function(){ try { if (work.form && work.form.fn_FormLoad) work.form.fn_FormLoad(); } catch(e){} }, 300);
            }
        };

        // 로그아웃 → 로그인 화면 (this = application)
        this.gfn_logout = function()
        {
            this.gv_token = ""; this.gv_userId = ""; this.gv_userNm = "";
            var vf2 = this.mainframe.VFrameSet;
            vf2.set_separatesize("*,0,0");
            try { vf2.LOGINFRAME.set_visible(true); } catch (e) {}
        };

        // 공통 JSON 트랜잭션 (XHR). Nexacro SSV 대신 백엔드 JSON 어댑터와 직접 통신.
        //  inDs/outDs : "백엔드ds=폼ds" 공백구분 매핑. cb(svcID, ErrorCode, ErrorMsg).
        this.gfn_transaction = function(form, svcID, url, inDs, outDs, arg, cbName)
        {
            var base = this.gv_svcUrl;
            if (base.charAt(base.length - 1) != "/") base += "/";

            var reqBody = {};
            if (inDs) {
                inDs.split(" ").forEach(function(pair) {
                    if (!pair) return;
                    var kv = pair.split("="); var sendName = kv[0]; var dsName = kv[1] || kv[0];
                    var ds = form[dsName];
                    if (!ds) return;
                    var rows = [];
                    for (var i = 0; i < ds.getRowCount(); i++) {
                        var row = {};
                        for (var c = 0; c < ds.getColCount(); c++) {
                            var col = ds.getColID(c);
                            row[col] = ds.getColumn(i, col);
                        }
                        rows.push(row);
                    }
                    reqBody[sendName] = rows;
                });
            }

            var app = this;
            var xhr = new XMLHttpRequest();
            xhr.open("POST", base + url, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            if (app.gv_token) xhr.setRequestHeader("Authorization", "Bearer " + app.gv_token);
            xhr.onreadystatechange = function() {
                if (xhr.readyState != 4) return;
                var errCode = -1, errMsg = "통신 오류(" + xhr.status + ")";
                try {
                    var res = JSON.parse(xhr.responseText);
                    errCode = (res.ErrorCode != null) ? res.ErrorCode : 0;
                    errMsg = res.ErrorMsg || "";
                    if (errCode >= 0 && outDs) {
                        outDs.split(" ").forEach(function(pair) {
                            if (!pair) return;
                            var kv = pair.split("="); var dsName = kv[0]; var respName = kv[1] || kv[0];
                            var ds = form[dsName]; var arr = res[respName];
                            if (!ds || !arr) return;
                            ds.clearData();
                            for (var i = 0; i < arr.length; i++) {
                                var r = ds.addRow(); var o = arr[i];
                                for (var c = 0; c < ds.getColCount(); c++) {
                                    var col = ds.getColID(c);
                                    if (o[col] !== undefined && o[col] !== null) ds.setColumn(r, col, o[col]);
                                }
                            }
                        });
                    }
                } catch (e) { errCode = -1; errMsg = "응답 파싱 오류: " + e.message; }
                if (cbName && typeof form[cbName] === "function") {
                    form[cbName].call(form, svcID, errCode, errMsg);
                }
            };
            xhr.send(JSON.stringify(reqBody));
        };

        this.checkLicense("");
        this.loadPreloadList();
        this.loadIncludeScript("core_erpn.xadl");
    };
}
)();
