if (nexacro.Environment)
{
    var env = nexacro._environment = new nexacro.Environment();
    env.on_init = function ()
    {
        this.set_themeid("theme::inbus");
        this.set_loadingimage("url(\'theme://images/img_MF_loading.gif\')");
        this.set_httptimeout("6000");
    };
    env.on_initEvent = function ()
    {
        // add event handler

    };
    env.loadTypeDefinition = function ()
    {
        nexacro._setTypeDefinitionURL("typedefinition.xml");
        nexacro._addService("theme", "file", "./_resource_/_theme_/", "session", null, "", "", "");
        nexacro._addService("initvalue", "file", "./_resource_/_initvalue_/", "session", null, "", "", "");
        nexacro._addService("xcssrc", "file", "./_resource_/_xcss_/", "session", null, "", "", "");
        nexacro._addService("imagerc", "file", "./_resource_/_images_/", "session", null, "", "", "");
        nexacro._addService("font", "file", "./_resource_/_font_/", "session", null, "", "0", "0");
        nexacro._addService("frame", "form", "./c/frame/", "dynamic", null, "", "0", "0");
        nexacro._addService("common", "form", "./c/common/", "dynamic", null, "", "0", "0");
        nexacro._addService("html", "file", "./html/", "dynamic", null, "", "0", "0");
        nexacro._addService("script", "js", "./lib/", "dynamic", null, "", "0", "0");
        nexacro._addService("fi", "form", "./u/fi/", "dynamic", null, "", "0", "0");
        nexacro._addService("hr", "form", "./u/hr/", "dynamic", null, "", "0", "0");
        nexacro._addService("ga", "form", "./u/ga/", "dynamic", null, "", "0", "0");
        nexacro._addService("em", "form", "./u/em/", "dynamic", null, "", "0", "0");
        nexacro._addService("om", "form", "./u/om/", "dynamic", null, "", "0", "0");
        nexacro._addService("po", "form", "./u/po/", "dynamic", null, "", "0", "0");
        nexacro._addService("pm", "form", "./u/pm/", "dynamic", null, "", "0", "0");
        nexacro._addService("tmm", "form", "./c/tmm/", "dynamic", null, "", "0", "0");
        nexacro._addService("template", "form", "./c/template/", "dynamic", null, "", "0", "0");
        nexacro._addService("sample", "form", "./c/sample/", "dynamic", null, "", "0", "0");
        nexacro._addService("guide", "form", "./c/guide/", "dynamic", null, "", "0", "0");
        nexacro._addService("is", "form", "./u/is/", "dynamic", null, "", "0", "0");
        nexacro._addService("cb", "form", "./u/cb/", "dynamic", null, "", "0", "0");
    	nexacro._component_uri = (nexacro._arg_compurl ? nexacro._arg_compurl : "./nexacro17lib/component/");
    	nexacro._theme_uri = "./_resource_/_theme_/";
    	// load components
        var registerclass = [
        		{"id":"Button", "classname":"nexacro.Button", "type":"JavaScript"},
        		{"id":"Combo", "classname":"nexacro.Combo", "type":"JavaScript"},
        		{"id":"Edit", "classname":"nexacro.Edit", "type":"JavaScript"},
        		{"id":"MaskEdit", "classname":"nexacro.MaskEdit", "type":"JavaScript"},
        		{"id":"TextArea", "classname":"nexacro.TextArea", "type":"JavaScript"},
        		{"id":"Static", "classname":"nexacro.Static", "type":"JavaScript"},
        		{"id":"Div", "classname":"nexacro.Div", "type":"JavaScript"},
        		{"id":"PopupDiv", "classname":"nexacro.PopupDiv", "type":"JavaScript"},
        		{"id":"Radio", "classname":"nexacro.Radio", "type":"JavaScript"},
        		{"id":"CheckBox", "classname":"nexacro.CheckBox", "type":"JavaScript"},
        		{"id":"ListBox", "classname":"nexacro.ListBox", "type":"JavaScript"},
        		{"id":"Grid", "classname":"nexacro.Grid", "type":"JavaScript"},
        		{"id":"Spin", "classname":"nexacro.Spin", "type":"JavaScript"},
        		{"id":"Menu", "classname":"nexacro.Menu", "type":"JavaScript"},
        		{"id":"PopupMenu", "classname":"nexacro.PopupMenu", "type":"JavaScript"},
        		{"id":"Tab", "classname":"nexacro.Tab", "type":"JavaScript"},
        		{"id":"GroupBox", "classname":"nexacro.GroupBox", "type":"JavaScript"},
        		{"id":"Calendar", "classname":"nexacro.Calendar", "type":"JavaScript"},
        		{"id":"ImageViewer", "classname":"nexacro.ImageViewer", "type":"JavaScript"},
        		{"id":"ProgressBar", "classname":"nexacro.ProgressBar", "type":"JavaScript"},
        		{"id":"Plugin", "classname":"nexacro.Plugin", "type":"JavaScript"},
        		{"id":"Dataset", "classname":"nexacro.NormalDataset", "type":"JavaScript"},
        		{"id":"ListView", "classname":"nexacro.ListView", "type":"JavaScript"},
        		{"id":"WebBrowser", "classname":"nexacro.WebBrowser", "type":"JavaScript"},
        		{"id":"FileDownload", "classname":"nexacro.FileDownload", "type":"JavaScript"},
        		{"id":"FileUpload", "classname":"nexacro.FileUpload", "type":"JavaScript"},
        		{"id":"Sketch", "classname":"nexacro.Sketch", "type":"JavaScript"},
        		{"id":"ExcelExportObject", "classname":"nexacro.ExcelExportObject", "type":"JavaScript"},
        		{"id":"ExcelImportObject", "classname":"nexacro.ExcelImportObject", "type":"JavaScript"},
        		{"id":"ToggleButton", "classname":"nexacro.ToggleButton", "type":"JavaScript"},
        		{"id":"FileUpTransfer", "classname":"nexacro.FileUpTransfer", "type":"JavaScript"},
        		{"id":"FileDialog", "classname":"nexacro.FileDialog", "type":"JavaScript"},
        		{"id":"UbiReport", "classname":"nexacro.UbiViewer", "type":"JavaScript"},
        		{"id":"Splitter", "classname":"nexacro.Splitter", "type":"JavaScript"},
        		{"id":"VideoPlayer", "classname":"nexacro.VideoPlayer", "type":"JavaScript"}
        ];
    	nexacro._addClasses(registerclass);
    };
    env.on_loadVariables = function ()
    {
        // Variables

        // Cookies

        // HTTP Header

    };
	env.on_loadDeviceAdaptors = function ()
	{
        // load device adatpor

	};
    // User Script

					
    env = null;
}
