/**
 * Created on 2017/3/7.
 */
/*eslint-disable */
(function ($) {
    var dataTable = {
        init: function (el, options) {
            var o = $.extend({
                data:[],
                columns: {},
                operations:{
                    displayed: false,
                    title: "操作",
                    btn: []
                },
                selectable: false,
                selectBackFn: function (e) {
                    // 选中回调
                },
                sortBy:"",
                sortSign:"",
                sortBackFn: function (e) {
                    // 排序回调
                },
                onInit: function () {
                    // 初始化回调
                },
                afterRender: function () {
                    // 渲染后执行
                }
            }, options || {});
            this.options = o;
            this.el = el;
            el.data('tableOptions', this);
            o.onInit();
            this._draw();
            o.afterRender();
            return this;
        },

        destroy: function () {
            this.el.empty();
        },

        refresh: function () {
            this._draw();
        },

        sort: function (key, sign) {
            this.el.find("[data-key='" + key + "']").find(".js_sort" + sign + "").addClass("active");
        },

        //绘制table
        _draw: function () {
            this.destroy();
            var self = this;
            var columns = this.options.columns;
            var operations = this.options.operations;
            var data = this.options.data;
            //<thead>元素
            var thead = document.createElement("thead");
            var thead_tr = document.createElement("tr");
            thead_tr.className = "tb-title";
            var tdCount = 0;
            $.each(columns,function (key, item) {
                var thead_tr_td = document.createElement("td");
                if (typeof item == "string") {
                    thead_tr_td.innerHTML = item;
                } else {
                    thead_tr_td.innerHTML = item.title;
                    //Title class
                    if (item && item.titleClass) {
                        thead_tr_td.className = item.titleClass;
                    }
                    //列排序
                    if (item && item.sortable) {
                        var sortBy = item.sortBy ? item.sortBy : key;
                        var sortSignUp = document.createElement("div");
                        sortSignUp.className = "triangle-up js_sortUp";
                        var sortSignDown = document.createElement("div");
                        sortSignDown.className = "triangle-down js_sortDown";
                        if (self.options.sortBy == sortBy) {
                            if (self.options.sortSign == "Up") {
                                sortSignUp.className = sortSignUp.className + " active";
                            } else {
                                sortSignDown.className = sortSignDown.className + " active";
                            }
                        }
                        var sortSign = document.createElement("div");
                        sortSign.className = "sortSign js_tableSort";
                        sortSign.setAttribute("data-key", sortBy);
                        sortSign.onclick = function () {
                            var key = this.attributes.getNamedItem("data-key").nodeValue;
                            self.options.sortBackFn(this, key);
                        };
                        sortSign.appendChild(sortSignUp);
                        sortSign.appendChild(sortSignDown);
                        thead_tr_td.appendChild(sortSign);
                    }
                }
                thead_tr.appendChild(thead_tr_td);
                tdCount++;
            });
            if (operations.displayed) {
                var th_operate_td = document.createElement("td");
                th_operate_td.innerHTML = operations.title;
                thead_tr.appendChild(th_operate_td);
                tdCount = tdCount + 1;
            }
            thead.appendChild(thead_tr);
            self.el.append($(thead));
            //<tbody>元素
            var tbody = document.createElement("tbody");
            if (data && data.length > 0) {
                $.each(data, function (i, obj) {
                    var tbody_tr = document.createElement("tr");
                    var index = 0;
                    $.each(columns,function (_key, item) {
                        var value = obj[_key] == null ? "" : obj[_key];
                        var td = document.createElement("td");
                        //插入列
                        if (self.options.selectable && index == 0) {
                            td.className = "list-filter";
                            var label = document.createElement("label");
                            label.className = "js_radio";
                            label.onclick = function () {
                                self.options.selectBackFn(this);
                            };
                            var input = document.createElement("input");
                            input.type = "radio";
                            input.value = value;
                            td.appendChild(label);
                            td.appendChild(input);
                            tbody_tr.appendChild(td);
                        } else if (item && item.href) {
                            var a = document.createElement("a");
                            a.innerHTML = value;
                            td.appendChild(a);

                        } else {
                            var span = document.createElement("span");
                            span.innerHTML = value;
                            td.appendChild(span);
                        }
                        //注入元素属性
                        var td_first =  td.firstElementChild || td.firstChild;
                        var td_last = td.lastElementChild || td.lastChild;
                        if (td.className == "list-filter") {
                            if (item && item.itemClass) {
                                td_last.className = item.itemClass;
                            }
                        } else {
                            if (item && item.itemClass) {
                                td_first.className = item.itemClass;
                            }
                        }
                        var attrObj = item && item.attr;
                        if (attrObj) {
                            $.each(attrObj,function (_k, _v) {
                                if (_v.indexOf("{{:") > -1) {
                                    for (var count = 0;count < 1;count++) {
                                        var start = _v.indexOf("{{:") + 3;
                                        var end = _v.indexOf("}}");
                                        var keyWord = _v.substring(start, end);
                                        var dataVal = typeof obj[keyWord] == "undefined" ? "" : obj[keyWord];
                                        var _keyWord = "{{:" + keyWord + "}}";
                                        _v = _v.replace(_keyWord, dataVal);
                                        if (_v.indexOf("{{:") > -1) {
                                            count--;
                                        }
                                    }
                                }
                                if (td.className == "list-filter") {
                                    td_last.setAttribute(_k, _v);
                                    td_first.setAttribute("for", td_last.id);
                                } else {
                                    td_first.setAttribute(_k, _v);
                                }
                            });
                        }
                        //注入td样式
                        var styleObj = item && item.style;
                        if (styleObj) {
                            $.each(styleObj,function (_k, _v) {
                                //td.style[_k] = _v;
                                $(td).css(_k, _v);
                            });
                        }
                        tbody_tr.appendChild(td);
                        index++;
                    });
                    //操作按钮列
                    if (operations.displayed) {
                        var operate_td = document.createElement("td");
                        $.each(operations.btn, function (b, btnItem) {
                            var btn_a = document.createElement("a");
                            btn_a.innerHTML = btnItem.title;
                            if (btnItem.className) {
                                btn_a.className = btnItem.className;
                            }
                            btn_a.setAttribute("href", "javascript:void(0)");
                            if (btnItem.attr) {
                                $.each(btnItem.attr,function (_k, _v) {
                                    if (_v.indexOf("{{:") > -1) {
                                        for (var count = 0;count < 1;count++) {
                                            var start = _v.indexOf("{{:") + 3;
                                            var end = _v.indexOf("}}");
                                            var keyWord = _v.substring(start, end);
                                            var dataVal = typeof obj[keyWord] == "undefined" || obj[keyWord] == null ? "" : obj[keyWord];
                                            var _keyWord = "{{:" + keyWord + "}}";
                                            _v = _v.replace(_keyWord, dataVal);
                                            if (_v.indexOf("{{:") > -1) {
                                                count--;
                                            }
                                        }
                                    }
                                    btn_a.setAttribute(_k, _v);
                                });
                            }
                            btn_a.onclick = function () {
                                btnItem.fn && btnItem.fn(this);
                            };
                            operate_td.appendChild(btn_a);
                            if (b < operations.btn.length - 1) {
                                var operate_span = document.createElement("span");
                                operate_span.innerHTML = "&nbsp;&nbsp;|&nbsp;&nbsp;";
                                operate_span.className = "gray";
                                operate_td.appendChild(operate_span);
                            }
                        });
                        tbody_tr.appendChild(operate_td);
                    }
                    tbody.appendChild(tbody_tr);
                });
            } else {
                var tr_noData = document.createElement("tr");
                tr_noData.className = "js_nodata";
                var td_noData = document.createElement("td");
                td_noData.setAttribute("colspan", tdCount.toString());
                td_noData.innerHTML = "暂无记录";
                tr_noData.appendChild(td_noData);
                tbody.appendChild(tr_noData);
            }
            self.el.append($(tbody));
        }
    };

    $.fn.dataTable = function (conf) {
        // Method calling logic
        if (dataTable[conf] && conf.charAt(0) != '_') {
            return dataTable[conf].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof conf === 'object' || !conf) {
            return dataTable.init(this, conf);
        } else {
            $.error('方法' +  conf + '在jQuery.dataTable中不存在！');
        }
    };
})(jQuery);