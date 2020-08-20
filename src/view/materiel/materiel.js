const vscode = acquireVsCodeApi();

window.addEventListener("message", (event) => {
  const message = event.data;

  if (message.blocks) {
    let blocks = message.blocks.blocks;
    blocks = blocks.concat(blocks);
    blocks = blocks.concat(blocks);
    blocks = blocks.concat(blocks);
    blocks = JSON.parse(JSON.stringify(blocks));

    blocks.map((item, index) => {
      item.title = `${item.title}${index}`;
    });

    console.log(JSON.stringify(blocks));

    blockListRender(blocks);
    bindSearch(blocks);
  }
});

function bindSearch(blocks) {
  $('#keyword').keyup(function() {
    const keyword = $(this).val();
    const filterBlocks = blocks.filter(item => {
      return item.title.indexOf(keyword) >= 0;
    });

    blockListRender(filterBlocks);
  });
}

// view render
function blockListRender(blocks) {

  // pagination
  let pageNo = 1;
  const pageSize = 2;
  let maxPageNo = Math.ceil(blocks.length / pageSize);

  let pagination = maxPageNo > 1 ? '<div class="op-prev">上一页</div>' : '';

  for (let index = 0; index < maxPageNo; index++) {
    pagination += `<div class="op-pager" pageNo="${index+1}">${index+1}</div>`;
  }

  pagination += maxPageNo > 1 ? '<div class="op-next">下一页</div>' : '';

  $('.pagination').html(pagination);
  $('.op-pager').eq(0).addClass('cur');

  $('.op-prev').click(function() {
    if (pageNo > 1) {
      pageNo--;
      pageNoChange(pageNo);
    }
  });

  $('.op-next').click(function() {
    if (pageNo < maxPageNo) {
      pageNo++;
      pageNoChange(pageNo);
    }
  });

  $('.op-pager').click(function() {
    pageNo = $(this).attr('pageNo');
    pageNoChange(pageNo);
  });

  function pageNoChange(pageNo) {
    $('.op-pager').eq(pageNo - 1).addClass('cur').siblings().removeClass('cur');
    renderPageList();
  }

  renderPageList();
  function renderPageList() {
    let list = "";
    blocks.slice((pageNo - 1) * pageSize, pageNo * pageSize).map((item, index) => {
      list += `<div class="block-item">
                      <p class="block-title">${item.title}</p>
                      <p class="block-desc">${item.description}</p>
                      <div class="block-snapshot">
                          <img src="${item.img}"/>
                      </div>

                      <div class="block-operation">
                          <a href="javascript:;" class="op-add" itemIndex="${index}">添加</a>   
                          <a href="${item.previewUrl}" target="_blank">预览</a>
                      </div>
                  </div>`;
    });

    $("#blockContainer").html(list);

    // block click
    $(".op-add").click(function() {
      const itemIndex = $(this).attr("itemIndex");
      const selected = blocks[itemIndex];

      vscode.postMessage({ blockSelected: selected });
    });
  }

  

  // tab
  $(".tabs-item").click(function() {
    $(this).addClass("active").siblings().removeClass("active");
  });

}
