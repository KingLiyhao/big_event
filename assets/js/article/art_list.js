$(function () {
  var layer = layui.layer
  var form = layui.form
  var laypage = layui.laypage;
  //定义美化时间过滤器
  template.defaults.imports.dataFormat = function (date) {
    const dt = new Date(date)


    var y = dt.getFullYear()
    var m = padZero(dt.getMonth() + 1)
    var d = padZero(dt.getDate())

    var hh = padZero(dt.getHours())
    var mm = padZero(dt.getMinutes())
    var ss = padZero(dt.getSeconds())

    return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
  }
  // 补零
  function padZero(n) {
    return n > 9 ? n : '0' + n
  }

  var q = {
    pagenum: 1,
    pagesize: 2,
    cate_id: '',
    state: ''
  }
  var curretData = null

  initTable()
  initCate()

  function initTable() {
    $.ajax({
      method: 'GET',
      url: '/my/article/list',
      data: q,
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('获取文章列表失败!')
        }
        var htmlStr = template('tpl-table', res)
        $('tbody').html(htmlStr)

        //调用渲染分页
        renderPage(res.total)
        curretData = res.data
      }
    })
  }
  // 初始化文章分类的方法
  function initCate() {
    $.ajax({
      method: 'GET',
      url: '/my/article/cates',
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('获取分类数据失败！')
        }
        // 调用模板引擎渲染分类的可选项
        var htmlStr = template('tpl-cate', res)
        $('[name=cate_id]').html(htmlStr)
        // console.log(htmlStr);
        // 通过 layui 重新渲染表单区域的UI结构
        form.render()
      }
    })
  }
  // 为筛选表单绑定 submit 事件
  $('#form-search').on('submit', function (e) {
    e.preventDefault()
    //获取表单中的值
    var cate_id = $('[name=cate_id]').val()
    var state = $('[name=state]').val()
    // console.log(cate_id, state);
    //查询参数
    q.cate_id = cate_id
    q.state = state
    //重新渲染
    initTable()
  })


  //定义渲染分页
  function renderPage(total) {
    // console.log(total);
    laypage.render({
      elem: 'pageBox', // 分页容器的 Id
      count: total, // 总数据条数
      limit: q.pagesize, // 每页显示几条数据
      curr: q.pagenum, //设置默认选中的页数
      layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
      limits: [1, 3, 5, 10],
      //分页切换渲染    jump回调
      jump: function (obj, first) {
        // console.log(first);
        // console.log(obj.curr);
        //把新的页码传到q的参数对象中
        q.pagenum = obj.curr
        q.pagesize = obj.limit
        // initTable()
        if(first) return
        initTable()
        // if (!first) {
        //   initTable()

        // }
      }
    })
  }
  // 代理，为删除按钮绑定点击事件
  $('tbody').on('click', '.btn-delete', function () {
    console.log(111 );
    //获取删除按钮的个数 
    var len = $('btn-delete').length
    console.log(len);
    //获取文章id
    var id = $(this).attr('data-id')
    //询问是否删除数据
    layer.confirm('确认删除?', { icon: 3, title: '提示' }, function (index) {
      $.ajax({
        method: 'GET',
        url: '/my/article/delete/' + id,
        success: function (res) {
          if (res.status !== 0) {
            return layer.msg('删除文章失败！')
          }
          layer.msg('删除文章成功！')
          // 当数据删除完成后，需要判断当前这一页中，是否还有剩余的数据
          // 如果没有剩余的数据了,则让页码值 -1 之后,
          // 再重新调用 initTable 方法
          // 4
          if (curretData.length === 1) {
            // 如果 len 的值等于1，证明删除完毕之后，页面上就没有任何数据了
            // 页码值最小必须是 1
            q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
          }
          initTable()
        }
      })

      layer.close(index)
    })
  })
})

//   })
// })

// })