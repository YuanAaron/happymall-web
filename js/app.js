window.app = {
    /* 开发环境 */
    //serverUrl: "http://127.0.0.1:8088",                                   // 接口服务接口地址，注意：访问链接必须要和这里一样，否则因为跨域可能拿不到Cookie
    // paymentServerUrl: "http://192.168.1.3:8089",                            // 支付中心服务地址
    //shopServerUrl: "http://127.0.0.1:8080/happymall-web/",                  // 门户网站地址
    //centerServerUrl: "http://127.0.0.1:8080/happymall-center/",              // 用户中心地址
    cookieDomain: "",                                                       // cookie 域

    /* 生产环境 */
    serverUrl: "http://47.93.190.199:8088/happymall",                      // 接口服务接口地址
    paymentServerUrl: "http://payment.t.mukewang.com/foodie-payment",       // 支付中心服务地址
    shopServerUrl: "http://47.93.190.199:8080/happymall-web/",                            // 门户网站地址
    centerServerUrl: "http://47.93.190.199:8080/happymall-center/",                        // 用户中心地址
    //cookieDomain: ".z.mukewang.com;",                                       // cookie 域
    cookieDomain: "",

    ctx: "/happymall-web",

    /*
    查看后端tomcat/logs/catalina.out日志可知，cookie域使用域名注册会出现cookie异常，
    解决方法是修改该tomcat配置，以使用老版的cookieProcessor
    具体操作是进入后端tomcat/conf/context.xml，然后再<Context>标签中添加下面一行：

    <CookieProcessor className="org.apache.tomcat.util.http.LegacyCookieProcessor"/>
    */

    getCookie: function (cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            // console.log(c)
            while (c.charAt(0) == ' ') c = c.substring(1);
                if (c.indexOf(name) != -1){
                    return c.substring(name.length, c.length);
                }
            }
        return "";
    },

    goErrorPage() {
        window.location.href = "http://www.imooc.com/error/noexists";
    },

    setCookie: function(name, value) {
        var Days = 365;
        var exp = new Date(); 
        exp.setTime(exp.getTime() + Days*24*60*60*1000);
        var cookieContent = name + "="+ encodeURIComponent (value) + ";path=/;";
        if (this.cookieDomain != null && this.cookieDomain != undefined && this.cookieDomain != '') {
            cookieContent += "domain=" + this.cookieDomain;
        }
        document.cookie = cookieContent;
        // document.cookie = name + "="+ encodeURIComponent (value) + ";path=/;domain=" + cookieDomain;//expires=" + exp.toGMTString();
    },

    deleteCookie: function(name) {
        var cookieContent = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        if (this.cookieDomain != null && this.cookieDomain != undefined && this.cookieDomain != '') {
            cookieContent += "domain=" + this.cookieDomain;
        }
        document.cookie = cookieContent;
    },

    getUrlParam(paramName) {
        var reg = new RegExp("(^|&)" + paramName + "=([^&]*)(&|$)");    //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);            //匹配目标参数
        if (r != null) return decodeURI(r[2]); return null;             //返回参数值
    },

    /**
	 * 构建购物车商品对象
	 */
	ShopcartItem: function(itemId, itemImgUrl, itemName, specId, specName, buyCounts, priceDiscount, priceNormal) {
		this.itemId = itemId;
		this.itemImgUrl = itemImgUrl;
		this.itemName = itemName;
        this.specId = specId;
        this.specName = specName;
        this.buyCounts = buyCounts;
        this.priceDiscount = priceDiscount;
        this.priceNormal = priceNormal;
    },

    addItemToShopcart(pendingItem) {
        // 判断有没有购物车，如果没有购物车，则new 一个购物车list
        // 如果有购物车，则直接把shopcartItem丢进去
        var foodieShopcartCookie = this.getCookie("shopcart");
        var foodieShopcart = [];
        if (foodieShopcartCookie != null && foodieShopcartCookie != "" && foodieShopcartCookie != undefined) {
            var foodieShopcartStr = decodeURIComponent(foodieShopcartCookie);
            foodieShopcart = JSON.parse(foodieShopcartStr); //转换成一个List

            // 如果不是对象，则重新复制为空数组
            if (typeof(foodieShopcart) != "object") {
                foodieShopcart = [];
            }

            var isHavingItem = false;
            // 如果添加的商品已经存在与购物车中，则购物车中已经存在的商品数量累加新增的
            for(var i = 0 ; i < foodieShopcart.length ; i ++) {
                var tmpItem = foodieShopcart[i];
                var specId = tmpItem.specId;
                if (specId == pendingItem.specId) {
                    isHavingItem = true;
                    var newCounts = tmpItem.buyCounts + pendingItem.buyCounts;
                    tmpItem.buyCounts = newCounts;
                    // 删除主图在数组中的位置
                    foodieShopcart.splice(i, 1, tmpItem);
                }
            }   
            if (!isHavingItem) {
                foodieShopcart.push(pendingItem);
            }
        } else {
            foodieShopcart.push(pendingItem);
        }
        // 用新的购物车cookie覆盖本地已经有的购物车cookie
        this.setCookie("shopcart", JSON.stringify(foodieShopcart));
    },

    /**
     * 获得购物车中的数量
     */
    getShopcartItemCounts() {
        // 判断有没有购物车，如果没有购物车，则new 一个购物车list
        // 如果有购物车，则直接把shopcartItem丢进去
        var foodieShopcartCookie = this.getCookie("shopcart");
        var foodieShopcart = [];
        if (foodieShopcartCookie != null && foodieShopcartCookie != "" && foodieShopcartCookie != undefined) {
            var foodieShopcartStr = decodeURIComponent(foodieShopcartCookie);
            foodieShopcart = JSON.parse(foodieShopcartStr);

            // 如果不是对象，则重新复制为空数组
            if (typeof(foodieShopcart) != "object") {
                foodieShopcart = [];
            }
        }
        return foodieShopcart.length;
    },

    /**
     * 获得购物车列表
     */
    getShopcartList() {
        // 判断有没有购物车，如果没有购物车，则new 一个购物车list
        // 如果有购物车，则直接把shopcartItem丢进去
        var foodieShopcartCookie = this.getCookie("shopcart");
        var foodieShopcart = [];
        if (foodieShopcartCookie != null && foodieShopcartCookie != "" && foodieShopcartCookie != undefined) {
            var foodieShopcartStr = decodeURIComponent(foodieShopcartCookie);
            foodieShopcart = JSON.parse(foodieShopcartStr);

            // 如果不是对象，则重新复制为空数组
            if (typeof(foodieShopcart) != "object") {
                foodieShopcart = [];
            }
        }
        return foodieShopcart;
    },

    checkMobile(mobile) {
        var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
        if (!myreg.test(mobile)) {
            return false;
        }
        return true;
    },
}
