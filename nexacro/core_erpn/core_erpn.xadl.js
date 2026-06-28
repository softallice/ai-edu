// 컴파일된 Application (런타임 로드용). index.html 의 screeninfo.xadl 이 참조.
// 부팅 흐름: 로그인(comLogin) → 메인 프레임셋(상단 topFrame + 메뉴 menuFrame + 작업영역 WORKFRAME).
// gv_svcUrl = 백엔드 Nexacro 어댑터 베이스 URL. gv_token/userId/userNm = 로그인 결과.
//
// ⚠ 본 파일 및 c/**·u/** 의 .xfdl.js 는 손수 작성한 부트 스텁입니다.
//    onload·트랜잭션·프레임 전환의 완전한 동작은 Nexacro Studio 의 Generate(컴파일)로
//    .xadl/.xfdl 원본에서 정식 .js 를 재생성해야 보장됩니다(README "검증 상태" 참고).
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

        // 초기 바디 = 로그인 프레임 (this = mainframe)
        this.mainframe_createBodyFrame = function()
        {
            var loginset = new VFrameSet("VFrameSet", null, null, null, null, null, null, this);
            loginset.set_separatesize("*");
            this.addChild(loginset.name, loginset);
            this.frame = loginset;

            var login = new ChildFrame("LOGINFRAME", null, null, null, null, null, null,
                                       "common::comLogin.xfdl", loginset);
            login.set_formurl("common::comLogin.xfdl");
            loginset.addChild(login.name, login);
        };

        // 로그인 성공 → 메인 프레임셋으로 전환 (this = application)
        this.gfn_openMainFrame = function()
        {
            var mf = this.mainframe;
            // 기존 로그인 프레임셋 제거
            if (mf.frame) { mf.removeChild(mf.frame.name); }

            var vset = new VFrameSet("VMAIN", null, null, null, null, null, null, mf);
            vset.set_separatesize("44,*");
            mf.addChild(vset.name, vset);
            mf.frame = vset;

            var top = new ChildFrame("TOPFRAME", null, null, null, null, null, null,
                                     "frame::topFrame.xfdl", vset);
            top.set_formurl("frame::topFrame.xfdl");
            vset.addChild(top.name, top);

            var hset = new HFrameSet("HMAIN", null, null, null, null, null, null, vset);
            hset.set_separatesize("220,*");
            vset.addChild(hset.name, hset);

            var menu = new ChildFrame("MENUFRAME", null, null, null, null, null, null,
                                      "frame::menuFrame.xfdl", hset);
            menu.set_formurl("frame::menuFrame.xfdl");
            hset.addChild(menu.name, menu);

            var work = new ChildFrame("WORKFRAME", null, null, null, null, null, null,
                                      "po::POVM0001.xfdl", hset);
            work.set_formurl("po::POVM0001.xfdl");
            hset.addChild(work.name, work);
        };

        // 메뉴 클릭 → 작업영역에 폼 로드 (this = application)
        this.gfn_openWork = function(formurl)
        {
            var work = this.mainframe.frame.HMAIN.WORKFRAME;
            if (work) { work.set_formurl(formurl); }
        };

        // 로그아웃 → 로그인 화면으로 복귀 (this = application)
        this.gfn_logout = function()
        {
            this.gv_token = "";
            this.gv_userId = "";
            this.gv_userNm = "";
            var mf = this.mainframe;
            if (mf.frame) { mf.removeChild(mf.frame.name); }
            this.mainframe_createBodyFrame.call(mf);
        };

        this.checkLicense("");
        this.loadPreloadList();
        this.loadIncludeScript("core_erpn.xadl");
    };
}
)();
