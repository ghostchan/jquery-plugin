/**
 * Created on 2017/2/22.
 */
(function($){

    var methods = {
        init: function(el, options) {
            var o = $.extend({
                pageCount: 0,//总页数，不传默认为单页码显示
                current: 1,//当前页码
                displayedPages:5,//显示页码数
                pageSize: 10,//单页显示条数
                listLength: 1, //数据条数
                ajaxRefresh:true,//是否为ajax刷新
                textAlign: "right",//对齐方式
                prevPageText: "上一页",
                nextPageText:" 下一页",
                firstPageText: "首页",
                lastPageText: "尾页",
                displayedHomeLast:false,//首尾页开关
                displayedGo2Page:false,//跳转框开关
                selectPageSize:false,//选择单页条数开关
                disabled:false,//禁用开关
                backFn: function(data) {
                    //分页操作回调
                },
                onInit: function() {
                    // 初始化回调
                }
            }, options || {});
            this.options = o;
            this.el = el;
            el.data('pagination', this);
            if(o.listLength == 0 && o.ajaxRefresh){
                if(o.current == 1 && o.listLength == 0){
                    this.destroy();
                    return false;
                }
                if (typeof (o.backFn) == "function") {
                    var _current = el.find("span.current").text();
                    if(o.current - 1 <= el.find("span.current").text()){
                        o.backFn(o.current - 1);
                    }else{
                        o.backFn(_current);
                        alert("跳转页数已超过最大值");
                    }
                }
            } else {
                this._draw();
                o.onInit();
            }

            return this;
        },

        prevPage: function() {
            var o = this.options;
            if (o.current > 1) {
                this._selectPage(o.current - 1);
            }
        },

        nextPage: function() {
            var o = this.options;
            if (parseInt(o.current) + 1 <= o.pageCount || (o.pageCount == 0 && o.pageSize == o.listLength)) {
                this._selectPage(parseInt(o.current) + 1);
            }
        },

        firstPage: function() {
            this._selectPage(1);
        },

        lastPage: function() {
            var o = this.options;
            this._selectPage(o.pageCount);
        },

        getPagesCount: function() {
            return this.options.pageCount;
        },

        setPagesCount: function(count) {
            this.options.pageCount = count;
        },

        getCurrentPage: function () {
            return this.options ? this.options.current : 1;
        },

        destroy: function(){
            this.el.empty();
        },

        redraw: function(){
            this._draw();
        },

        disable: function(){
            this.options.disabled = true;
            this._draw();
        },

        enable: function(){
            this.options.disabled = false;
            this._draw();
        },

        updatePageSize: function (pageSize) {
            if(pageSize == this.options.pageSize){
                return;
            }
            this.options.pageSize = pageSize;
            this._selectPage(1);
        },

        getPageSize: function() {
            return this.options ? this.options.pageSize : 10;
        },

        _draw: function() {
            this.destroy();
            var optionsHtml = '<option value="10"> 10 条/页</option>' +
                '<option value="20"> 20 条/页</option>' +
                '<option value="30"> 30 条/页</option>' +
                '<option value="40"> 40 条/页</option>' +
                '<option value="50"> 50 条/页</option>';
            var args = this.options;
            if(args.pageCount < 2 && args.pageCount != 0){
                return false;
            }
            var $panel = this.el;
            if(args.displayedHomeLast && args.pageCount > args.displayedPages) {
                $panel.append('<a href="javascript:;" class="firstPage">'+ args.firstPageText +'</a><span class="page_link_border"> | </span>');
            }
            $panel.append('<a href="javascript:;" class="prevPage">'+ args.prevPageText +'</a>');
            var currentPage = parseInt(args.current);
            if (args.pageCount != 0) {
                var steps = parseInt(args.displayedPages/2);
                var listBegin = args.pageCount <= args.displayedPages ? 1 : (currentPage - steps) > 0 ? (currentPage + steps > args.pageCount ? args.pageCount - args.displayedPages + 1 : currentPage - steps) : 1; //开始页数
                var listEnd = listBegin + args.displayedPages > args.pageCount ? args.pageCount : listBegin + args.displayedPages - 1; //结束页数
                if(!args.displayedHomeLast && listBegin != 1 && args.displayedPages > 1){
                    $panel.append('<a href="javascript:void(0);" class="tcdNumber">1</a>');
                    if(listBegin - 1 != 1){
                        $panel.append('<span class="tcdNumber">......</span>');
                    }
                }
                while(listBegin <= listEnd){
                    if (listBegin != args.current) {
                        $panel.append('<a href="javascript:void(0);" class="tcdNumber">'+ listBegin +'</a>');
                    } else {
                        $panel.append('<span href="javascript:void(0);" class="tcdNumber current">'+ listBegin +'</span>');
                    }
                    listBegin++;
                }
                if(!args.displayedHomeLast && listEnd != args.pageCount && args.displayedPages > 1){
                    if(listEnd  + 1 != args.pageCount){
                        $panel.append('<span class="tcdNumber">......</span>');
                    }
                    $panel.append('<a href="javascript:void(0);" class="tcdNumber">'+ args.pageCount +'</a>');
                }
            }else {
                $panel.append('<span href="javascript:void(0);" class="tcdNumber current">'+ currentPage +'</span>');
            }
            $panel.append('<a href="javascript:;" class="nextPage">'+ args.nextPageText +'</a>');
            if (args.displayedHomeLast && args.pageCount > args.displayedPages) {
                $panel.append('<span class="page_link_border"> | </span><a href="javascript:;" class="lastPage">'+ args.lastPageText +'</a>');
            }

            var ohtml = '<div class="operatePage">';
            if (args.displayedGo2Page) {
                ohtml += '<div class="gotoPage">' +
                    '<input type="text" maxlength="6" class="whichPage"><button class="goToPage fz14">跳转</button>' +
                    '</div>';
            }
            if (args.selectPageSize) {
                if(args.disabled){
                    ohtml += '<select class="selectPageSize" name="selectPageSize" disabled>' + optionsHtml + '</select>';
                }else{
                    ohtml += '<select class="selectPageSize" name="selectPageSize">' + optionsHtml + '</select>';
                }
            }
            ohtml += '</div>';
            $panel.append(ohtml);
            $panel.find("[name='selectPageSize']").val(args.pageSize);
            $panel.css("text-align",args.textAlign);
            if(!args.disabled){
                this._bindEvent();
            }
        },

        _bindEvent: function () {
            var self = this;
            var obj = this.el;
            obj.find("a.tcdNumber").unbind("click").bind("click",  function() {
                var current = parseInt($(this).text());
                self._selectPage(current);
            });
            obj.find("a.prevPage").unbind("click").bind("click",  function() {
                self.prevPage();
            });
            obj.find("a.nextPage").unbind("click").bind("click",  function() {
                self.nextPage();
            });
            obj.find("a.firstPage").unbind("click").bind("click",  function() {
                self.firstPage();
            });
            obj.find("a.lastPage").unbind("click").bind("click",  function() {
                self.lastPage();
            });

            obj.find("[name='selectPageSize']").unbind("change").bind("change",  function() {
                var pageSize = this.value;
                self.updatePageSize(pageSize);
            });

            obj.find(".goToPage").unbind("click").bind("click",  function() {
                var pageNo = $(this).prev().val();
                var _reg = /^[0-9]*[1-9][0-9]*$/;
                var result = _reg.test($.trim(pageNo) );
                if (result) {
                    $(this).prev().removeClass("errorNo");
                    self._selectPage(pageNo);
                }
            });
        },

        _selectPage: function(pageIndex, event) {
            if (pageIndex > this.options.pageCount && this.options.pageCount > 0) {
                return;
            }
            this.options.current = pageIndex;
            if (!this.options.ajaxRefresh) {
                this._draw();
            }
            return this.options.backFn(pageIndex, event);
        }
    };

    $.fn.createPage = function(method) {
        // Method calling logic
        if (methods[method] && method.charAt(0) != '_') {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init(this, method);
        } else {
            $.error('方法' +  method + '在jQuery.pagination中不存在！');
        }
    };

})(jQuery);
